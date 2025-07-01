"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AddBookmarkDialogProps {
  onSuccess: () => void
}

export function AddBookmarkDialog({ onSuccess }: AddBookmarkDialogProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const resetForm = () => {
    setUrl("")
    setTitle("")
    setDescription("")
    setTags("")
  }

  const handleAnalyze = async () => {
    if (!url) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL válida",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error("Falha ao analisar URL")
      }

      const data = await response.json()
      setTitle(data.title)
      setDescription(data.description)
      setTags(data.tags)

      toast({
        title: "Sucesso",
        description: "URL analisada com sucesso pela IA!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao analisar URL. Você pode preencher manualmente.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSave = async () => {
    if (!title || !url) {
      toast({
        title: "Erro",
        description: "Título e URL são obrigatórios",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/analyze-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      let aiGenerated = null
      if (response.ok) {
        const analysisData = await response.json()
        aiGenerated = analysisData.aiGenerated
      }

      const saveResponse = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          link: url,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0),
          aiGenerated, // Passar dados da IA
        }),
      })

      if (!saveResponse.ok) {
        throw new Error("Falha ao salvar bookmark")
      }

      toast({
        title: "Sucesso",
        description: "Bookmark salvo com sucesso!",
      })

      resetForm()
      setOpen(false)
      onSuccess()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar bookmark. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    resetForm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="mr-2 h-5 w-5" />
          Adicionar Bookmark
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Adicionar Novo Bookmark
          </DialogTitle>
          <DialogDescription className="text-base">
            Preencha os detalhes do seu bookmark ou use nossa IA para preenchimento automático.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label htmlFor="url" className="text-sm font-semibold">
              URL *
            </Label>
            <Input
              id="url"
              placeholder="https://exemplo.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="title" className="text-sm font-semibold">
              Título *
            </Label>
            <Input
              id="title"
              placeholder="Título do bookmark"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="description" className="text-sm font-semibold">
              Descrição
            </Label>
            <Textarea
              id="description"
              placeholder="Descrição do bookmark (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="tags" className="text-sm font-semibold">
              Tags
            </Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="web, tecnologia, tutorial, programação"
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">Separe as tags por vírgula</p>
          </div>

          <div className="flex gap-3 justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !url}
              className="flex-1 h-11 bg-transparent"
            >
              {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {isAnalyzing ? "Analisando..." : "Analisar com IA"}
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="h-11 bg-transparent">
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar Bookmark
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
