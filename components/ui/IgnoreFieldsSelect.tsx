/** @format */

import * as Popover from "@radix-ui/react-popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface IgnoreFieldsSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const IgnoreFieldsSelect: React.FC<IgnoreFieldsSelectProps> = ({
  options,
  selected,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>(selected);

  const handleToggle = (field: string) => {
    setTempSelected((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleApply = () => {
    onChange(tempSelected); // Only trigger the change here
    setOpen(false); // Close the popover
  };

  const handleOpenChange = (isOpen: boolean) => {
    // If closing without applying, reset selection
    if (!isOpen) {
      setTempSelected(selected);
    }
    setOpen(isOpen);
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <Button variant="outline" className="w-72 justify-start">
          {selected.length > 0
            ? `${selected.length} Ignored Field(s)`
            : "Ignore Fields..."}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="bg-white p-4 rounded-md shadow-md w-72 z-50">
        <p className="text-sm font-semibold mb-2">Select fields to ignore:</p>
        <ScrollArea className="h-60">
          <div className="space-y-2 mb-2">
            {options.map((field) => (
              <div key={field} className="flex items-center gap-2">
                <Checkbox
                  id={`ignore-${field}`}
                  checked={tempSelected.includes(field)}
                  onCheckedChange={() => handleToggle(field)}
                />
                <label htmlFor={`ignore-${field}`} className="text-sm">
                  {field}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-end pt-2">
          <Button size="sm" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};
