import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface SovereignSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}

export function SovereignSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select option",
  disabled,
}: SovereignSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="space-y-2 mb-3">
      <Label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between bg-secondary/50 border border-border/50 hover:bg-secondary text-sm font-medium h-10 px-3 transition-all",
              !value && "text-muted-foreground"
            )}
          >
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-0 bg-card border-border shadow-2xl" align="start">
          <Command className="bg-transparent">
            <div className="flex items-center border-b border-border/50 px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-primary" />
              <CommandInput 
                placeholder={`Search ${label}...`} 
                className="h-10 border-0 focus:ring-0 bg-transparent text-sm"
              />
            </div>
            <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar">
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground italic">
                No matching {label.toLowerCase()} found.
              </CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.label} // CommandItem value is used for filtering
                    onSelect={() => {
                      onValueChange(opt.value);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-primary/10 aria-selected:bg-primary/20 transition-colors"
                  >
                    <span className="text-sm truncate pr-4">{opt.label}</span>
                    <Check
                      className={cn(
                        "h-4 w-4 text-primary shrink-0",
                        value === opt.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
