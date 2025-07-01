"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Filter } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TagFilterProps {
  availableTags: string[]
  selectedTags: string[]
  onTagSelect: (tag: string) => void
  onTagRemove: (tag: string) => void
  onClearAll: () => void
}

export function TagFilter({ availableTags, selectedTags, onTagSelect, onTagRemove, onClearAll }: TagFilterProps) {
  const popularTags = availableTags.slice(0, 20) // Mostrar até 20 tags mais populares

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Filtrar por Tags</h3>
        </div>
        {selectedTags.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs">
            Limpar Filtros
          </Button>
        )}
      </div>

      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Tags Selecionadas:</p>
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="default"
                className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer transition-colors"
                onClick={() => onTagRemove(tag)}
              >
                {tag}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Tags Disponíveis:</p>
        <ScrollArea className="h-32">
          <div className="flex flex-wrap gap-1 pr-4">
            {popularTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "secondary"}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  selectedTags.includes(tag) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => onTagSelect(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
