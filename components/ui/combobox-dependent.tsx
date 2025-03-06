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

interface ComboboxDependentProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  searchPlaceholder?: string
  maxDropdownHeight?: string
  dependentId: string // ID do combobox pai (ex: ID da marca)
  fetchOptions: (dependentId: string) => Promise<{ value: string; label: string }[]>
  disabled?: boolean
}

export function ComboboxDependent({
  options: initialOptions,
  value,
  onChange,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  searchPlaceholder = "Search...",
  className,
  maxDropdownHeight = "200px",
  dependentId,
  fetchOptions,
  disabled = false,
}: ComboboxDependentProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [options, setOptions] = React.useState<{ value: string; label: string }[]>(initialOptions)
  const [loading, setLoading] = React.useState(false)

  // Carregar opções quando o dependentId mudar
  React.useEffect(() => {
    if (!dependentId) {
      setOptions([]);
      return;
    }

    async function loadOptions() {
      setLoading(true);
      try {
        const newOptions = await fetchOptions(dependentId);
        setOptions(newOptions);
        // Se o valor atual não estiver nas novas opções, redefina
        if (value && !newOptions.some(opt => opt.value === value)) {
          onChange('');
        }
      } catch (error) {
        console.error("Erro ao carregar opções dependentes:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }

    loadOptions();
  }, [dependentId, fetchOptions, onChange, value]);

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
          disabled={disabled || !dependentId}
        >
          {loading ? (
            <span className="text-muted-foreground">Carregando...</span>
          ) : (
            <span className="truncate">{currentValue}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
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
          <CommandEmpty>{loading ? "Carregando..." : emptyMessage}</CommandEmpty>
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