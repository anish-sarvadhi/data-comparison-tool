/// <reference lib="webworker" />

self.onmessage = (e) => {
    const { oldData, newData, fieldMapping, ignoredFields }: { 
      oldData: any[], 
      newData: any[], 
      fieldMapping: Record<string, string>, 
      ignoredFields: string[] 
    } = e.data;
  
    const changed: any[] = [];
    const unchanged: any[] = [];
    const notFound: any[] = [];
  
    const oldSpecialNumberField = "Finish No";
    const newSpecialNumberField = "Finish No";
  
    const oldMap = new Map(
      oldData.map((item: any) => [String(item[oldSpecialNumberField]), item])
    );
  
    for (const newItem of newData) {
      const specialNumber = String(newItem[newSpecialNumberField]);
      const oldItem = oldMap.get(specialNumber) as { [key: string]: any };
  
      if (!specialNumber || specialNumber === "undefined" || specialNumber === "null") {
        notFound.push(newItem);
        continue;
      }
  
      if (!oldItem) {
        changed.push({
          newData: newItem,
          oldData: null,
          changes: ["New entry"],
        });
        continue;
      }
  
      const differences = Object.entries(fieldMapping)
        .filter(([_, newField]) => !ignoredFields.includes(newField))
        .map(([oldField, newField]) => {
          const oldVal = String(oldItem[oldField] || "").trim();
          const newVal = String(newItem[newField] || "").trim();
          return oldVal !== newVal
            ? { field: oldField, oldValue: oldVal, newValue: newVal }
            : null;
        })
        .filter(Boolean);
  
      if (differences.length > 0) {
        changed.push({ newData: newItem, oldData: oldItem, changes: differences });
      } else {
        unchanged.push(newItem);
      }
    }
  
    self.postMessage({ changed, unchanged, notFound });
  };
  