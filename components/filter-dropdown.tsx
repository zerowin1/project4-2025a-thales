"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Filter, X, ChevronDown } from "lucide-react"

interface FilterDropdownProps {
  availableTags: string[]
  selectedTags: string[]
  onTagSelect: (tag: string) => void
  onTagRemove: (tag: string) => void
  onClearAll: () => void
}

export function FilterDropdown({
  availableTags,
  selectedTags,
  onTagSelect,
  onTagRemove,
  onClearAll,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/80">
          <Filter className="mr-2 h-4 w-4" />
          Filtrar por Tags
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
              {selectedTags.length}
            </Badge>
          )}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Filtrar por Tags</span>
          {selectedTags.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs h-6 px-2">
              Limpar
            </Button>
          )}
        </DropdownMenuLabel>

        {selectedTags.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Tags Selecionadas:</p>
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="default"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer transition-colors text-xs"
                    onClick={() => onTagRemove(tag)}
                  >
                    {tag}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        <DropdownMenuSeparator />
        <div className="p-2">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Tags Disponíveis ({availableTags.length}):</p>
          <ScrollArea className="h-48">
            <div className="flex flex-wrap gap-1 pr-2">
              {availableTags.slice(0, 50).map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "secondary"}
                  className={`cursor-pointer transition-all hover:scale-105 text-xs ${
                    selectedTags.includes(tag)
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => onTagSelect(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
