/** @format */

"use client";

import React, { useEffect, useState } from "react";
import { useRef } from "react";
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
import { on } from "events";

const MemoizedFieldRow = React.memo(
  ({
    oldField,
    newFields,
    selectedValue,
    onChange,
  }: {
    oldField: string;
    newFields: string[];
    selectedValue: string;
    onChange: (value: string) => void;
  }) => {
    return (
      <TableRow>
        <TableCell className="font-medium">{oldField}</TableCell>
        <TableCell>
          <Select value={selectedValue || ""} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a field..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">-- Select field --</SelectItem>
              {newFields.map((newField) => (
                <SelectItem key={newField} value={newField}>
                  {newField}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
      </TableRow>
    );
  }
);

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
  const [localMapping, setLocalMapping] = useState<Record<string, string>>(
    () => ({ ...mapping })
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setLocalMapping({ ...mapping }); // Sync if external mapping changes
  }, [mapping]);

  const handleMappingChange = (oldField: string, newField: string) => {
    setLocalMapping((prev) => ({
      ...prev,
      [oldField]: newField,
    }));
  };

  const handleConfirm = () => {
    setIsLoading(true);
    onMappingChange?.({ ...localMapping });
    onConfirm();
    setIsLoading(false);
  };

  const unmappedFields = oldFields.filter(
    (oldField) =>
      !localMapping[oldField] || localMapping[oldField] === "default"
  );
  const isComplete = unmappedFields.length === 0;

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

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">Old Field Name</TableHead>
              <TableHead className="w-1/2">New Field Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {oldFields.map((oldField) => (
              <MemoizedFieldRow
                key={oldField}
                oldField={oldField}
                newFields={newFields}
                selectedValue={localMapping[oldField] || ""}
                onChange={(value) => handleMappingChange(oldField, value)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleConfirm}>Confirm Mapping & Continue</Button>
      </div>
    </div>
  );
}
