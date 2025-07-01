"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, ExternalLink, Calendar, Sparkles, Code } from "lucide-react"
import { EditBookmarkDialog } from "./edit-bookmark-dialog"
import { DeleteBookmarkDialog } from "./delete-bookmark-dialog"

interface Bookmark {
  id: string
  title: string
  description: string
  link: string
  tags: string[]
  createdAt: string
  aiGenerated?: string
}

interface BookmarkCardProps {
  bookmark: Bookmark
  onUpdate: () => void
}

export function BookmarkCard({ bookmark, onUpdate }: BookmarkCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Parse dos dados da IA
  let aiData = null
  try {
    if (bookmark.aiGenerated && bookmark.aiGenerated !== "null") {
      aiData = JSON.parse(bookmark.aiGenerated)
    }
  } catch (error) {
    console.log("Erro ao fazer parse dos dados da IA:", error)
  }

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "")
    } catch {
      return "Link"
    }
  }

  // Obter metadados da tag
  const getTagMetadata = (tag: string) => {
    if (!aiData?.tagsWithConfidence) {
      return { type: "unknown", confidence: 0 }
    }

    const tagWithMeta = aiData.tagsWithConfidence.find((t: any) => t.tag === tag)
    if (tagWithMeta) {
      return {
        type: tagWithMeta.source,
        confidence: tagWithMeta.confidence,
      }
    }

    // Fallback para lógica anterior
    if (aiData.tags && Array.isArray(aiData.tags) && aiData.tags.includes(tag)) {
      return { type: "ai", confidence: 0 }
    }

    if (aiData.backupTags && Array.isArray(aiData.backupTags) && aiData.backupTags.includes(tag)) {
      return { type: "backup", confidence: 0 }
    }

    return { type: "unknown", confidence: 0 }
  }

  // Estilos das tags baseados no tipo
  const getTagStyle = (tagType: string, confidence: number) => {
    switch (tagType) {
      case "ai-high":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400 hover:from-green-600 hover:to-emerald-600 shadow-md font-medium"
      case "ai-medium":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400 hover:from-blue-600 hover:to-cyan-600 shadow-md font-medium"
      case "ai-low":
      case "ai-best":
        return "bg-gradient-to-r from-purple-400 to-pink-400 text-white border-purple-300 hover:from-purple-500 hover:to-pink-500 shadow-sm"
      case "backup":
        return "bg-gradient-to-r from-gray-400 to-slate-400 text-white border-gray-300 hover:from-gray-500 hover:to-slate-500 shadow-sm"
      case "ai":
        return "bg-gradient-to-r from-purple-500 to-blue-500 text-white border-purple-400 hover:from-purple-600 hover:to-blue-600 shadow-md font-medium"
      default:
        return "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
    }
  }

  // Ícone da tag
  const getTagIcon = (tagType: string) => {
    switch (tagType) {
      case "ai-high":
      case "ai-medium":
      case "ai-low":
      case "ai-best":
      case "ai":
        return <Sparkles className="h-3 w-3 mr-1" />
      case "backup":
        return <Code className="h-3 w-3 mr-1" />
      default:
        return null
    }
  }

  // Tooltip simplificado da tag
  const getTagTitle = (tagType: string) => {
    switch (tagType) {
      case "ai-high":
      case "ai-medium":
      case "ai-low":
      case "ai-best":
      case "ai":
        return "Tag de IA"
      case "backup":
        return "Tag de Backup"
      default:
        return "Tag padrão"
    }
  }

  return (
    <>
      <Card className="h-full group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                {bookmark.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {getDomainFromUrl(bookmark.link)}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(bookmark.createdAt).toLocaleDateString("pt-BR")}
                </div>
                {aiData?.success && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-300"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    IA Ativa
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEditDialog(true)}
                className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookmark.description && (
            <div className="space-y-1">
              <CardDescription className="line-clamp-3 text-sm leading-relaxed">{bookmark.description}</CardDescription>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full justify-start bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200 text-blue-700 hover:text-blue-800 transition-all"
            onClick={() => window.open(bookmark.link, "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Abrir Link
          </Button>

          {bookmark.tags.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {bookmark.tags.slice(0, 6).map((tag, index) => {
                  const tagMeta = getTagMetadata(tag)
                  return (
                    <Badge
                      key={index}
                      variant="secondary"
                      className={`text-xs transition-all hover:scale-105 cursor-default ${getTagStyle(tagMeta.type, tagMeta.confidence)}`}
                      title={getTagTitle(tagMeta.type)}
                    >
                      {getTagIcon(tagMeta.type)}
                      {tag}
                      {tagMeta.confidence > 0 && <span className="ml-1 opacity-75">({tagMeta.confidence}%)</span>}
                    </Badge>
                  )
                })}
                {bookmark.tags.length > 6 && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500">
                    +{bookmark.tags.length - 6}
                  </Badge>
                )}
              </div>

              {/* Contador de tags */}
              {aiData?.tagsWithConfidence && (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      {aiData.tagsWithConfidence.filter((t: any) => t.source.startsWith("ai")).length > 0 && (
                        <div className="flex items-center gap-1 text-purple-700 font-medium">
                          <Sparkles className="h-3 w-3" />
                          <span>
                            IA: {aiData.tagsWithConfidence.filter((t: any) => t.source.startsWith("ai")).length}
                          </span>
                        </div>
                      )}
                      {aiData.tagsWithConfidence.filter((t: any) => t.source === "backup").length > 0 && (
                        <div className="flex items-center gap-1 text-gray-600 font-medium">
                          <Code className="h-3 w-3" />
                          <span>
                            Backup: {aiData.tagsWithConfidence.filter((t: any) => t.source === "backup").length}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-gray-500 font-medium">Total: {bookmark.tags.length}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <EditBookmarkDialog
        bookmark={bookmark}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={() => {
          setShowEditDialog(false)
          onUpdate()
        }}
      />

      <DeleteBookmarkDialog
        bookmark={bookmark}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onSuccess={() => {
          setShowDeleteDialog(false)
          onUpdate()
        }}
      />
    </>
  )
}
