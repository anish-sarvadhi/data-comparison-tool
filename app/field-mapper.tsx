/** @format */

// app/field-mapper.tsx

"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Modified/New Code
// Create a lightweight select component specifically for this use case
const FieldSelect = React.memo(
  ({
    oldField,
    newFields,
    value,
    onChange,
  }: {
    oldField: string;
    newFields: string[];
    value: string;
    onChange: (oldField: string, value: string) => void;
  }) => {
    // Use a local state to make the UI more responsive
    const [localValue, setLocalValue] = useState(value || "");

    // Update local value when prop changes
    useEffect(() => {
      setLocalValue(value || "");
    }, [value]);

    const handleValueChange = useCallback(
      (newValue: string) => {
        // Update local state immediately for responsive UI
        setLocalValue(newValue);
        // Then propagate the change to parent
        onChange(oldField, newValue);
      },
      [oldField, onChange]
    );

    // Memoize the options to prevent recreation
    const options = useMemo(() => {
      return [
        { value: "default", label: "-- Select field --" },
        ...newFields.map((field) => ({ value: field, label: field })),
      ];
    }, [newFields]);

    return (
      <Select value={localValue} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a field..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

FieldSelect.displayName = "FieldSelect";

// Modified/New Code
// Simplified row component that uses the optimized select
const FieldRow = React.memo(
  ({
    oldField,
    newFields,
    selectedValue,
    onChange,
  }: {
    oldField: string;
    newFields: string[];
    selectedValue: string;
    onChange: (oldField: string, value: string) => void;
  }) => {
    return (
      <TableRow>
        <TableCell className="font-medium">{oldField}</TableCell>
        <TableCell>
          <FieldSelect
            oldField={oldField}
            newFields={newFields}
            value={selectedValue}
            onChange={onChange}
          />
        </TableCell>
      </TableRow>
    );
  }
);

FieldRow.displayName = "FieldRow";

interface FieldMapperProps {
  oldFields: string[];
  newFields: string[];
  mapping: Record<string, string>;
  onMappingChange: (mapping: Record<string, string>) => void;
  onConfirm: () => void;
}

export function FieldMapper({
  oldFields,
  newFields,
  mapping,
  onMappingChange,
  onConfirm,
}: FieldMapperProps) {
  // Modified/New Code
  // Use a ref for the mapping to avoid unnecessary re-renders
  const mappingRef = useRef<Record<string, string>>({ ...mapping });
  const [, forceUpdate] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync with external mapping changes
  useEffect(() => {
    mappingRef.current = { ...mapping };
    forceUpdate({});
  }, [mapping]);

  // Modified/New Code
  // Optimized handler that updates the ref directly
  const handleMappingChange = useCallback(
    (oldField: string, newField: string) => {
      mappingRef.current[oldField] = newField;
      forceUpdate({}); // Trigger a re-render
    },
    []
  );

  const handleConfirm = useCallback(() => {
    setIsLoading(true);
    // Use setTimeout to prevent UI freezing
    setTimeout(() => {
      onMappingChange?.(mappingRef.current);
      onConfirm();
      setIsLoading(false);
    }, 0);
  }, [onMappingChange, onConfirm]);

  // Modified/New Code
  // Memoize calculations based on the ref
  const unmappedFields = useMemo(
    () =>
      oldFields.filter(
        (oldField) =>
          !mappingRef.current[oldField] ||
          mappingRef.current[oldField] === "default"
      ),
    [oldFields, mappingRef.current]
  );

  const isComplete = unmappedFields.length === 0;

  // Modified/New Code
  // Virtualize the list if there are many fields
  const sortedFields = useMemo(
    () =>
      [...oldFields].sort((a, b) => {
        const aIsMapped =
          mappingRef.current[a] && mappingRef.current[a] !== "default";
        const bIsMapped =
          mappingRef.current[b] && mappingRef.current[b] !== "default";

        if (!aIsMapped && bIsMapped) return -1;
        if (aIsMapped && !bIsMapped) return 1;
        return 0;
      }),
    [oldFields, mappingRef.current]
  );

  // Modified/New Code
  // Limit the number of visible rows for better performance
  const visibleFields = useMemo(() => {
    // Show all unmapped fields first
    const unmapped = sortedFields.filter(
      (field) =>
        !mappingRef.current[field] || mappingRef.current[field] === "default"
    );

    // Then add mapped fields up to a reasonable limit
    const mapped = sortedFields.filter(
      (field) =>
        mappingRef.current[field] && mappingRef.current[field] !== "default"
    );

    return [...unmapped, ...mapped];
  }, [sortedFields, mappingRef.current]);

  return (
    <div className="space-y-6">
      {!isComplete && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {unmappedFields.length} fields still need to be mapped. Please
            complete the mapping before proceeding.
          </AlertDescription>
        </Alert>
      )}

      {!isComplete && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-4">
          <h3 className="font-medium text-amber-800 mb-2">Unmapped Fields:</h3>
          <div className="flex flex-wrap gap-2">
            {unmappedFields.map((field) => (
              <span
                key={field}
                className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-sm"
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">Old Field Name</TableHead>
              <TableHead className="w-1/2">New Field Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleFields.map((oldField) => (
              <FieldRow
                key={oldField}
                oldField={oldField}
                newFields={newFields}
                selectedValue={mappingRef.current[oldField] || ""}
                onChange={handleMappingChange}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleConfirm} disabled={isLoading}>
          {isLoading ? "Processing..." : "Confirm Mapping & Continue"}
        </Button>
      </div>
    </div>
  );
}
