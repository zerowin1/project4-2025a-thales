"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Bookmark {
  id: string
  title: string
  description: string
  link: string
  tags: string[]
}

interface EditBookmarkDialogProps {
  bookmark: Bookmark
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditBookmarkDialog({ bookmark, open, onOpenChange, onSuccess }: EditBookmarkDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [link, setLink] = useState("")
  const [tags, setTags] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && bookmark) {
      setTitle(bookmark.title)
      setDescription(bookmark.description)
      setLink(bookmark.link)
      setTags(bookmark.tags.join(", "))
    }
  }, [open, bookmark])

  const handleSave = async () => {
    if (!title || !link) {
      toast({
        title: "Erro",
        description: "Título e URL são obrigatórios",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          link,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0),
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar bookmark")
      }

      toast({
        title: "Sucesso",
        description: "Bookmark atualizado com sucesso!",
      })

      onSuccess()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar bookmark. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Editar Bookmark</DialogTitle>
          <DialogDescription>Faça as alterações necessárias no seu bookmark.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Título</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-link">URL</Label>
            <Input id="edit-link" value={link} onChange={(e) => setLink(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-tags">Tags (separadas por vírgula)</Label>
            <Input
              id="edit-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="web, tecnologia, tutorial"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
