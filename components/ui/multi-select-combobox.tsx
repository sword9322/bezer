"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"

export type ComboboxOption = {
  value: string
  label: string
}

interface MultiSelectComboboxProps {
  options: ComboboxOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
}

export function MultiSelectCombobox({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className,
  disabled = false,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Filtra as opções com base na consulta de pesquisa
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    return options.filter(option => 
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const handleSelect = (value: string) => {
    // Evitar re-renderização desnecessária se já estiver selecionado
    if (selectedValues.includes(value)) {
      // Remove da seleção
      const newValues = selectedValues.filter(v => v !== value);
      console.log("Deselecting", value, "New values:", newValues);
      onChange(newValues);
    } else {
      // Adiciona à seleção
      const newValues = [...selectedValues, value];
      console.log("Selecting", value, "New values:", newValues);
      onChange(newValues);
    }
    
    // Mantenha o popover aberto após a seleção para permitir múltiplas seleções
  }

  const handleRemove = (value: string) => {
    onChange(selectedValues.filter(v => v !== value));
  }

  const clearAll = () => {
    onChange([]);
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  }

  // Função auxiliar para verificar se um valor está selecionado
  const isSelected = (value: string) => {
    return selectedValues.includes(value);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between border-slate-200 dark:border-slate-700 rounded-xl",
            "hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
            "min-h-[2.5rem]",
            className
          )}
          disabled={disabled}
          onClick={() => setOpen(!open)}
        >
          <div className="flex flex-wrap gap-1 items-center max-w-full">
            {selectedValues.length > 0 ? (
              <>
                {selectedValues.slice(0, 3).map((value) => {
                  const option = options.find(opt => opt.value === value)
                  return option ? (
                    <Badge 
                      key={value} 
                      variant="secondary"
                      className="px-2 py-1 flex items-center gap-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      {option.label}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove(value)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ) : null
                })}
                {selectedValues.length > 3 && (
                  <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    +{selectedValues.length - 3}
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center">
            {selectedValues.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mr-1 h-4 w-4 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
                onClick={(e) => {
                  e.stopPropagation()
                  clearAll()
                }}
              >
                <X className="h-3 w-3 text-slate-500" />
              </Button>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={searchQuery}
            onValueChange={handleSearchChange}
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {filteredOptions.map((option) => {
              const isItemSelected = isSelected(option.value);
              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    "hover:bg-slate-100 dark:hover:bg-slate-700",
                    isItemSelected ? "bg-slate-50 dark:bg-slate-800" : "",
                    "relative z-50"
                  )}
                >
                  <div 
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border",
                      isItemSelected
                        ? "bg-blue-600 border-blue-600"
                        : "border-slate-300 dark:border-slate-600 bg-transparent"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option.value);
                    }}
                  >
                    {isItemSelected && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="block truncate">{option.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 