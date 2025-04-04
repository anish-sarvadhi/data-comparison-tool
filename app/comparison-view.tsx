/** @format */

import { useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { GridTable } from "@/components/ui/gridTable";

interface ComparisonViewProps {
  changedDiamonds: any[];
  fieldMapping: Record<string, string>;
}

const MemoizedRow = React.memo(
  ({ diamond, fieldKeys }: { diamond: any; fieldKeys: string[][] }) => {
    return (
      <TableRow key={diamond.id}>
        {fieldKeys.map(([oldField, newField]) => {
          const oldValue = diamond.oldData?.[oldField] ?? "N/A";
          const newValue = diamond.newData?.[newField] ?? "N/A";
          const hasChanged =
            String(oldValue).trim() !== String(newValue).trim();

          return (
            <React.Fragment key={oldField}>
              <TableCell className="border p-2">{oldValue}</TableCell>
              <TableCell
                className={cn("border p-2", { "bg-red-200": hasChanged })}
              >
                {newValue}
              </TableCell>
            </React.Fragment>
          );
        })}
      </TableRow>
    );
  }
);

export function ComparisonView({
  changedDiamonds,
  fieldMapping,
}: ComparisonViewProps) {
  if (!changedDiamonds.length) {
    return (
      <p className="text-center py-4">No changes detected between the files.</p>
    );
  }

  const comparisonColumns = useMemo(() => {
    return Object.entries(fieldMapping).flatMap(([oldField, newField]) => {
      return [
        {
          title: `${oldField} (Old)`,
          dataIndex: `${newField}_old`,
          key: `${newField}_old`,
          width: 80,
          alignment: "center",
        },
        {
          title: `${newField} (New)`,
          dataIndex: `${newField}_new`,
          key: `${newField}_new`,
          width: 80,
          alignment: "center",
          render: (text: string, record: any) => {
            const oldValue = record[`${newField}_old`] ?? "";
            const hasChanged = String(oldValue).trim() !== String(text).trim();

            return (
              <div
                style={{
                  backgroundColor: hasChanged ? "#fed7d7" : "transparent",
                  padding: "4px",
                }}
              >
                {text}
              </div>
            );
          },
        },
      ];
    });
  }, [fieldMapping]);

  return (
    <GridTable
      dataSource={changedDiamonds}
      columns={comparisonColumns}
      scroll={{ y: 600 }}
      loading={false}
    />
  );
}
