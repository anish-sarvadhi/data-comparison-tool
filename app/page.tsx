/** @format */

"use client";

import { useMemo, useState } from "react";
import { read, utils } from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/app/file-uploader";
import { FieldMapper } from "@/app/field-mapper";
import { ComparisonView } from "@/app/comparison-view";
import { SafeDiamondsTable } from "@/app/safe-diamonds-table";
import { fieldMapping } from "@/lib/mapping";
import { Select, SelectItem } from "@/components/ui/select";
import { IgnoreFieldsSelect } from "@/components/ui/IgnoreFieldsSelect";
import { Checkbox } from "@/components/ui/checkbox";
// import { fieldMapping } from "@/lib/mapping";

export default function DiamondComparison() {
  const [data, setData] = useState<{
    old: { headers: string[]; data: any[] };
    new: { headers: string[]; data: any[] };
  }>({
    old: { headers: [], data: [] },
    new: { headers: [], data: [] },
  });
  // const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [ignoredFields, setIgnoredFields] = useState<string[]>([]);
  const [mappingConfirmed, setMappingConfirmed] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<{
    changed: any[];
    unchanged: any[];
    notFound?: any[];
  }>({ changed: [], unchanged: [] });
  const [activeTab, setActiveTab] = useState("upload");
  const [showOnlyChangedColumns, setShowOnlyChangedColumns] =
    useState<boolean>(false);

  // const handleOldFileUpload = async (file: File) => {
  //   try {
  //     const data = await readExcelFile(file);
  //     console.log("Old Data:", data);

  //     setOldData(data);
  //     if (newData.length > 0) {
  //       generateFieldMapping(data, newData);
  //     }
  //   } catch (error) {
  //     console.error("Error reading old file:", error);
  //   }
  // };

  // const handleNewFileUpload = async (file: File) => {
  //   try {
  //     const data = await readExcelFile(file);
  //     console.log("New Data:", data);
  //     setNewData(data);
  //     if (oldData.length > 0) {
  //       generateFieldMapping(oldData, data);
  //     }
  //   } catch (error) {
  //     console.error("Error reading new file:", error);
  //   }
  // };

  // const readExcelFile = (file: File): Promise<any[]> => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       try {
  //         const data = e.target?.result;
  //         const workbook = read(data, { type: "binary" });
  //         const sheetName = workbook.SheetNames[0];
  //         const worksheet = workbook.Sheets[sheetName];
  //         const jsonData = utils.sheet_to_json(worksheet);
  //         resolve(jsonData);
  //       } catch (error) {
  //         reject(error);
  //       }
  //     };
  //     reader.onerror = (error) => reject(error);
  //     reader.readAsBinaryString(file);
  //   });
  // };

  const handleFileUpload = async (
    file: File,
    type: "old" | "new",
    headerRowIndex: number
  ) => {
    try {
      const { headers, data } = await readExcelFile(file, headerRowIndex);
      setData((prev) => ({
        ...prev,
        [type]: { headers, data },
      }));
      // generateFieldMapping(data.old.headers, data.new.headers);
    } catch (error) {
      console.error(`Error reading ${type} file:`, error);
    }
  };

  const readExcelFile = (
    file: File,
    headerRowIndex = 0
  ): Promise<{ headers: string[]; data: any[] }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          const jsonData = utils.sheet_to_json(worksheet, { header: 1 }); // Get array of arrays
          const headers: string[] =
            (jsonData[headerRowIndex] as string[]) || [];
          const rowData = jsonData
            .slice(headerRowIndex + 1)
            .map((row) =>
              Object.fromEntries(
                headers.map((key, index) => [key, (row as any[])[index]])
              )
            );

          resolve({ headers, data: rowData });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });

  // const generateFieldMapping = (oldData: any[], newData: any[]) => {
  //   if (!oldData.length || !newData.length) return;

  //   const oldFields = Object.keys(oldData[0]);
  //   const newFields = Object.keys(newData[0]);

  //   // Simple initial mapping based on field names
  //   const initialMapping: Record<string, string> = {};

  //   oldFields.forEach((oldField) => {
  //     // First try exact match
  //     if (newFields.includes(oldField)) {
  //       initialMapping[oldField] = oldField;
  //       return;
  //     }

  //     // Try case-insensitive match
  //     const lowerOldField = oldField.toLowerCase();
  //     const matchingNewField = newFields.find(
  //       (newField) => newField.toLowerCase() === lowerOldField
  //     );

  //     if (matchingNewField) {
  //       initialMapping[oldField] = matchingNewField;
  //       return;
  //     }

  //     // Try to find a field with similar values
  //     for (const newField of newFields) {
  //       const oldValues = new Set(
  //         oldData.slice(0, 10).map((item) => String(item[oldField]))
  //       );
  //       const newValues = new Set(
  //         newData.slice(0, 10).map((item) => String(item[newField]))
  //       );

  //       // Check if there's significant overlap in values
  //       let matchCount = 0;
  //       oldValues.forEach((value) => {
  //         if (newValues.has(value)) matchCount++;
  //       });

  //       if (matchCount > 0 && matchCount / oldValues.size > 0.3) {
  //         initialMapping[oldField] = newField;
  //         break;
  //       }
  //     }
  //   });

  //   setFieldMapping(initialMapping);
  //   setActiveTab("mapping");
  // };

  // const generateFieldMapping = () => {
  //   const oldHeaders = data.old.headers;
  //   const newHeaders = data.new.headers;

  //   if (!oldHeaders.length || !newHeaders.length) return;

  //   const initialMapping = oldHeaders.reduce<Record<string, string>>(
  //     (acc, oldField) => {
  //       acc[oldField] =
  //         newHeaders.find(
  //           (newField) => newField.toLowerCase() === oldField.toLowerCase()
  //         ) || "";
  //       return acc;
  //     },
  //     {}
  //   );

  //   setFieldMapping(initialMapping);
  //   setActiveTab("mapping");
  // };

  // const compareData = () => {
  //   if (!data.old.data.length || !data.new.data.length) return;

  //   const changed: any[] = [];
  //   const unchanged: any[] = [];
  //   const notFound: any[] = [];

  //   // Define special number fields for comparison
  //   const oldSpecialNumberField = "Packet Id";
  //   const newSpecialNumberField = "Stock ID";

  //   // Create a Map for old data lookup
  //   const oldDataMap = new Map(
  //     data.old.data.map((item) => [String(item[oldSpecialNumberField]), item])
  //   );

  //   data.new.data.forEach((newItem) => {
  //     const specialNumber = String(newItem[newSpecialNumberField]);
  //     const oldItem = oldDataMap.get(specialNumber);

  //     if (
  //       !specialNumber ||
  //       specialNumber === "undefined" ||
  //       specialNumber === "null"
  //     ) {
  //       // If a diamond has no special number, add it to the not found list
  //       notFound.push(newItem);
  //       return;
  //     }

  //     if (!oldItem) {
  //       changed.push({
  //         newData: newItem,
  //         oldData: null,
  //         changes: ["New entry"],
  //       });
  //       return;
  //     }

  //     const differences: string[] = [];

  //     // Compare mapped fields
  //     Object.entries(fieldMapping).forEach(([oldField, newField]) => {
  //       if (
  //         String(oldItem[oldField] || "").trim() !==
  //         String(newItem[newField] || "").trim()
  //       ) {
  //         differences.push(newField);
  //       }
  //     });

  //     // Compare unmapped fields dynamically
  //     const oldFields = Object.keys(oldItem);
  //     const newFields = Object.keys(newItem);

  //     newFields.forEach((field) => {
  //       // If a field isn't explicitly mapped, assume it's skill-mapped
  //       if (
  //         !Object.values(fieldMapping).includes(field) &&
  //         oldFields.includes(field)
  //       ) {
  //         if (
  //           String(oldItem[field] || "").trim() !==
  //           String(newItem[field] || "").trim()
  //         ) {
  //           differences.push(field);
  //         }
  //       }
  //     });

  //     if (differences.length > 0) {
  //       changed.push({
  //         newData: newItem,
  //         oldData: oldItem,
  //         changes: differences,
  //       });
  //     } else {
  //       unchanged.push(newItem);
  //     }
  //   });
  //   console.log("Comparison Results:", {
  //     changed,
  //     unchanged,
  //     notFound,
  //   });
  //   // Set the comparison results

  //   setComparisonResults({ changed, unchanged, notFound });
  // };

  // const compareData = () => {
  //   if (!data.old.data.length || !data.new.data.length) return;

  //   const changed: any[] = [];
  //   const unchanged: any[] = [];
  //   const notFound: any[] = [];

  //   // Define unique identifier fields
  //   const oldSpecialNumberField = "Packet Id";
  //   const newSpecialNumberField = "Stock ID";

  //   // Map old data for fast lookup
  //   const oldDataMap = new Map(
  //     data.old.data.map((item) => [String(item[oldSpecialNumberField]), item])
  //   );

  //   data.new.data.forEach((newItem) => {
  //     const specialNumber = String(newItem[newSpecialNumberField]);
  //     const oldItem = oldDataMap.get(specialNumber);

  //     if (
  //       !specialNumber ||
  //       specialNumber === "undefined" ||
  //       specialNumber === "null"
  //     ) {
  //       notFound.push(newItem);
  //       return;
  //     }

  //     if (!oldItem) {
  //       changed.push({
  //         newData: newItem,
  //         oldData: null,
  //         changes: ["New entry"],
  //       });
  //       return;
  //     }

  //     // Check for field changes
  //     const differences = Object.entries(fieldMapping)
  //       .map(([oldField, newField]) => {
  //         const oldValue = String(oldItem[oldField] || "").trim();
  //         const newValue = String(newItem[newField] || "").trim();

  //         return oldValue !== newValue
  //           ? { field: oldField, oldValue, newValue }
  //           : null;
  //       })
  //       .filter(Boolean);

  //     if (differences.length > 0) {
  //       changed.push({
  //         newData: newItem,
  //         oldData: oldItem,
  //         changes: differences,
  //       });
  //     } else {
  //       unchanged.push(newItem);
  //     }
  //   });

  //   console.log("Comparison Results:", {
  //     changed,
  //     unchanged,
  //     notFound,
  //   });

  //   setComparisonResults({ changed, unchanged, notFound });
  // };

  // ------  22222
  // const compareData = () => {
  //   setMappingConfirmed(true);
  //   if (!fieldMapping) return;
  //   if (!data.old.data.length || !data.new.data.length) return;

  //   const changed: any[] = [];
  //   const unchanged: any[] = [];
  //   const notFound: any[] = [];

  //   const oldSpecialNumberField = "Packet Id";
  //   const newSpecialNumberField = "Stock ID";

  //   // Convert old data into a Map for quick lookup
  //   const oldDataMap = new Map(
  //     data.old.data.map((item) => [String(item[oldSpecialNumberField]), item])
  //   );

  //   // Chunk processing variables
  //   const batchSize = 1000; // Process 1000 diamonds at a time
  //   let index = 0;

  //   const processChunk = () => {
  //     const chunk = data.new.data.slice(index, index + batchSize);

  //     chunk.forEach((newItem) => {
  //       const specialNumber = String(newItem[newSpecialNumberField]);
  //       const oldItem = oldDataMap.get(specialNumber);

  //       if (
  //         !specialNumber ||
  //         specialNumber === "undefined" ||
  //         specialNumber === "null"
  //       ) {
  //         notFound.push(newItem);
  //         return;
  //       }

  //       if (!oldItem) {
  //         changed.push({
  //           newData: newItem,
  //           oldData: null,
  //           changes: ["New entry"],
  //         });
  //         return;
  //       }

  //       // Check for differences
  //       const differences = Object.entries(fieldMapping)
  //         .map(([oldField, newField]) => {
  //           const oldValue = String(oldItem[oldField] || "").trim();
  //           const newValue = String(newItem[newField] || "").trim();
  //           return oldValue !== newValue
  //             ? { field: oldField, oldValue, newValue }
  //             : null;
  //         })
  //         .filter(Boolean);

  //       if (differences.length > 0) {
  //         changed.push({
  //           newData: newItem,
  //           oldData: oldItem,
  //           changes: differences,
  //         });
  //       } else {
  //         unchanged.push(newItem);
  //       }
  //     });

  //     index += batchSize;

  //     // Update UI with current results (partial data)
  //     setComparisonResults({ changed, unchanged, notFound });
  //     setActiveTab("comparison");

  //     if (index < data.new.data.length) {
  //       // Schedule next chunk in the next event loop to avoid freezing UI
  //       setTimeout(processChunk, 0);
  //     } else {
  //       console.log("Comparison completed! ✅");
  //     }
  //   };

  //   // Start processing in chunks
  //   processChunk();
  // };

  const compareData = () => {
    setMappingConfirmed(true);
    if (!fieldMapping) return;
    if (!data.old.data.length || !data.new.data.length) return;

    const changed: any[] = [];
    const unchanged: any[] = [];
    const notFound: any[] = [];

    const oldSpecialNumberField = "Packet Id";
    const newSpecialNumberField = "Stock ID";

    const oldDataMap = new Map(
      data.old.data.map((item) => [String(item[oldSpecialNumberField]), item])
    );

    const batchSize = 1000;
    let index = 0;

    const processChunk = () => {
      const chunk = data.new.data.slice(index, index + batchSize);

      chunk.forEach((newItem) => {
        const specialNumber = String(newItem[newSpecialNumberField]);
        const oldItem = oldDataMap.get(specialNumber);

        if (
          !specialNumber ||
          specialNumber === "undefined" ||
          specialNumber === "null"
        ) {
          notFound.push(newItem);
          return;
        }

        if (!oldItem) {
          changed.push({
            newData: newItem,
            oldData: null,
            changes: ["New entry"],
          });
          return;
        }

        // Compare excluding ignored fields
        const differences = Object.entries(fieldMapping)
          .filter(([_, newField]) => !ignoredFields.includes(newField))
          .map(([oldField, newField]) => {
            const oldValue = String(oldItem[oldField] || "").trim();
            const newValue = String(newItem[newField] || "").trim();
            return oldValue !== newValue
              ? { field: oldField, oldValue, newValue }
              : null;
          })
          .filter(Boolean);

        if (differences.length > 0) {
          changed.push({
            newData: newItem,
            oldData: oldItem,
            changes: differences,
          });
        } else {
          unchanged.push(newItem);
        }
      });

      index += batchSize;
      setComparisonResults({ changed, unchanged, notFound });
      setActiveTab("comparison");

      if (index < data.new.data.length) {
        setTimeout(processChunk, 0);
      } else {
        console.log("✅ Comparison complete.");
      }
    };

    processChunk();
  };

  const comparisonTableData = useMemo(() => {
    return comparisonResults.changed.map((item, index) => {
      const row: Record<string, any> = {
        key: index,
        ...item,
      };

      Object.entries(fieldMapping).forEach(([oldField, newField]) => {
        const oldValue = item.oldData?.[oldField] ?? "N/A";
        const newValue = item.newData?.[newField] ?? "N/A";

        row[`${newField}_old`] = oldValue;
        row[`${newField}_new`] = newValue;
      });

      return row;
    });
  }, [comparisonResults.changed, fieldMapping]);

  console.log("fieldMapping", fieldMapping);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Diamond Data Comparison Tool</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          {/* <TabsTrigger
            value="mapping"
            disabled={!data?.old.headers.length || !data?.new.headers.length}
          >
            Field Mapping
          </TabsTrigger> */}
          <TabsTrigger value="comparison" disabled={!mappingConfirmed}>
            Comparison Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUploader
              title="Upload Old Diamonds File"
              description="Select the old_diamonds.xlsx file"
              onFileUpload={(file) => {
                const headerRowIndex = prompt(
                  "Enter header row number (0-based index)",
                  "0"
                );
                handleFileUpload(file, "old", Number(headerRowIndex));
              }}
              fileUploaded={!!data.old?.data?.length}
            />

            <FileUploader
              title="Upload New Diamonds File"
              description="Select the new_diamonds.xlsx file"
              onFileUpload={(file) => {
                const headerRowIndex = prompt(
                  "Enter header row number (0-based index)",
                  "0"
                );
                handleFileUpload(file, "new", Number(headerRowIndex));
              }}
              fileUploaded={!!data.new?.data?.length}
            />
          </div>

          {data?.old?.headers?.length > 0 && data?.new?.headers?.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button onClick={compareData}>Continue to Field Mapping</Button>
            </div>
          )}
        </TabsContent>

        {/* <TabsContent value="mapping">
          <Card>
            <CardHeader>
              <CardTitle>Field Mapping</CardTitle>
              <CardDescription>
                Review and adjust the automated field mapping between the old
                and new diamond files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldMapper
                oldFields={data.old?.headers || []}
                newFields={data.new?.headers || []}
                mapping={fieldMapping}
                onMappingChange={setFieldMapping}
                onConfirm={compareData}
              />
            </CardContent>
          </Card>
        </TabsContent> */}

        <TabsContent value="comparison">
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between p-4">
                <CardHeader>
                  <CardTitle>
                    Changed Diamonds ({comparisonResults.changed.length})
                  </CardTitle>
                  <CardDescription>
                    Diamonds with differences between the old and new files
                  </CardDescription>
                </CardHeader>
                <div className="flex gap-4 items-center">
                  <IgnoreFieldsSelect
                    options={data.new.headers}
                    selected={ignoredFields}
                    onChange={setIgnoredFields}
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="show-only-changed-columns"
                      checked={showOnlyChangedColumns}
                      onCheckedChange={(value) =>
                        setShowOnlyChangedColumns(!!value)
                      }
                    />
                    <label
                      htmlFor="show-only-changed-columns"
                      className="text-sm"
                    >
                      Show only changed columns
                    </label>
                  </div>
                </div>
              </div>
              <CardContent>
                <ComparisonView
                  changedDiamonds={comparisonTableData}
                  fieldMapping={fieldMapping}
                  ignoredFields={ignoredFields}
                  showOnlyChangedColumns={showOnlyChangedColumns}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Safe Diamonds ({comparisonResults.unchanged.length})
                </CardTitle>
                <CardDescription>
                  Diamonds with identical data in both files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SafeDiamondsTable diamonds={comparisonResults.unchanged} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
