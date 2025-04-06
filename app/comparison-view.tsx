/** @format */

import React, { useMemo } from "react";
import { GridTable } from "@/components/ui/gridTable";

interface ComparisonViewProps {
  changedDiamonds: any[];
  fieldMapping: Record<string, string>;
  ignoredFields: string[];
  showOnlyChangedColumns: boolean;
}

export function ComparisonView({
  changedDiamonds,
  fieldMapping,
  ignoredFields,
  showOnlyChangedColumns,
}: ComparisonViewProps) {
  if (!changedDiamonds.length) {
    return (
      <p className="text-center py-4">No changes detected between the files.</p>
    );
  }

  const changedFieldsSet = useMemo(() => {
    const fields = new Set<string>();

    for (const diamond of changedDiamonds) {
      for (const [oldField, newField] of Object.entries(fieldMapping)) {
        if (ignoredFields.includes(newField)) continue;

        const oldVal = diamond[`${newField}_old`] ?? "";
        const newVal = diamond[`${newField}_new`] ?? "";

        if (String(oldVal).trim() !== String(newVal).trim()) {
          fields.add(newField);
        }
      }
    }

    return fields;
  }, [changedDiamonds, fieldMapping, ignoredFields]);

  const comparisonColumns = useMemo(() => {
    return Object.entries(fieldMapping)
      .filter(([_, newField]) => {
        if (!showOnlyChangedColumns) return true;
        return changedFieldsSet.has(newField);
      })
      .flatMap(([oldField, newField]) => {
        const isIgnored = ignoredFields.includes(newField);

        return [
          {
            title: `${oldField} (Old)`,
            dataIndex: `${newField}_old`,
            key: `${newField}_old`,
            width: 100,
            alignment: "center",
          },
          {
            title: `${newField} (New)`,
            dataIndex: `${newField}_new`,
            key: `${newField}_new`,
            width: 100,
            alignment: "center",
            render: (text: string, record: any) => {
              const oldValue = record[`${newField}_old`] ?? "";
              const hasChanged =
                String(oldValue).trim() !== String(text).trim();

              return (
                <div
                  style={{
                    backgroundColor:
                      hasChanged && !isIgnored ? "#fed7d7" : "transparent",
                    fontStyle: isIgnored ? "italic" : "normal",
                    opacity: isIgnored ? 0.6 : 1,
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
  }, [fieldMapping, ignoredFields, changedFieldsSet, showOnlyChangedColumns]);

  return (
    <GridTable
      dataSource={changedDiamonds}
      columns={comparisonColumns}
      scroll={{ y: 600 }}
      loading={false}
    />
  );
}
