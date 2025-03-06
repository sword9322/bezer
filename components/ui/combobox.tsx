"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  searchPlaceholder?: string
  maxDropdownHeight?: string
  portal?: boolean
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  searchPlaceholder = "Search...",
  className,
  maxDropdownHeight = "200px",
  portal = true,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [options, searchQuery])

  const currentValue = React.useMemo(() => 
    options.find((option) => option.value === value)?.label || placeholder,
    [options, value, placeholder]
  )

  const handleSelect = React.useCallback((optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
    setSearchQuery("");
  }, [onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-white dark:bg-slate-900 text-left font-normal",
            className
          )}
        >
          <span className="truncate">{currentValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        portal={portal}
        className="w-[var(--radix-popover-trigger-width)] p-0 z-50" 
        align="start" 
        sideOffset={4}
        alignOffset={0}
        avoidCollisions={true}
        collisionPadding={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        <Command className="w-full">
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-9"
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className={`overflow-auto overscroll-contain -webkit-overflow-scrolling-touch`} style={{ maxHeight: maxDropdownHeight }}>
            {filteredOptions.map((option) => (
              <div 
                key={option.value}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(option.value);
                }}
                className="cursor-pointer touch-manipulation"
              >
                <CommandItem
                  className={cn(
                    "cursor-pointer min-h-[40px] flex items-center",
                    "text-slate-900 dark:text-slate-100",
                    "hover:bg-slate-100 dark:hover:bg-slate-700"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              </div>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 