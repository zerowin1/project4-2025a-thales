"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState, useMemo } from "react"
import { Header } from "@/components/header"
import { BookmarkCard } from "@/components/bookmark-card"
import { AddBookmarkDialog } from "@/components/add-bookmark-dialog"
import { SearchBar } from "@/components/search-bar"
import { FilterDropdown } from "@/components/filter-dropdown"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, BookmarkIcon, Sparkles } from "lucide-react"
import Link from "next/link"

interface Bookmark {
  id: string
  title: string
  description: string
  link: string
  tags: string[]
  createdAt: string
  aiGenerated?: string
}

export default function Home() {
  const { data: session, status } = useSession()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const fetchBookmarks = async () => {
    try {
      const response = await fetch("/api/bookmarks")
      if (response.ok) {
        const data = await response.json()
        setBookmarks(data)
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchBookmarks()
    } else if (status !== "loading") {
      setIsLoading(false)
    }
  }, [session, status])

  // Filtrar bookmarks baseado na busca e tags selecionadas
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((bookmark) => {
      const matchesSearch =
        searchQuery === "" ||
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => bookmark.tags.includes(tag))

      return matchesSearch && matchesTags
    })
  }, [bookmarks, searchQuery, selectedTags])

  // Extrair todas as tags únicas dos bookmarks
  const allTags = useMemo(() => {
    const tagCount = new Map<string, number>()
    bookmarks.forEach((bookmark) => {
      bookmark.tags.forEach((tag) => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
      })
    })

    // Ordenar tags por frequência
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
  }, [bookmarks])

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleTagRemove = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  const clearAllTags = () => {
    setSelectedTags([])
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <BookmarkIcon className="h-20 w-20 mx-auto mb-6 text-blue-600" />
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bookmark Manager
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Organize seus links favoritos aqui! Análise automática, tags
                inteligentes (na medida do possível) e busca avançada.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-white/50 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">IA Integrada</h3>
                  <p className="text-sm text-gray-600">Análise automática de URLs com preenchimento inteligente</p>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <BookmarkIcon className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Busca Avançada</h3>
                  <p className="text-sm text-gray-600">Encontre rapidamente com filtros por tags e busca textual</p>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <BookmarkIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Organização</h3>
                  <p className="text-sm text-gray-600">Mantenha seus links organizados com tags automáticas</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Button
                asChild
                size="lg"
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
              >
                <Link href="/auth/signin">Entrar na Plataforma</Link>
              </Button>
              <div className="text-center">
                <span className="text-gray-500">Não tem conta? </span>
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Cadastre-se gratuitamente
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header com busca e total */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Meus Bookmarks
                </h1>
                <p className="text-gray-600 mt-1">
                  {filteredBookmarks.length} de {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
                  {searchQuery && ` encontrado${filteredBookmarks.length !== 1 ? "s" : ""} para "${searchQuery}"`}
                  {selectedTags.length > 0 &&
                    ` com ${selectedTags.length} filtro${selectedTags.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              {/* Total de bookmarks como badge */}
              {bookmarks.length > 0 && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 text-sm font-semibold"
                >
                  {bookmarks.length} total
                </Badge>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <SearchBar onSearch={setSearchQuery} />
              {allTags.length > 0 && (
                <FilterDropdown
                  availableTags={allTags}
                  selectedTags={selectedTags}
                  onTagSelect={handleTagSelect}
                  onTagRemove={handleTagRemove}
                  onClearAll={clearAllTags}
                />
              )}
              <AddBookmarkDialog onSuccess={fetchBookmarks} />
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Carregando seus bookmarks...</p>
              </div>
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="text-center py-12">
              <BookmarkIcon className="h-20 w-20 mx-auto mb-6 text-gray-400" />
              {bookmarks.length === 0 ? (
                <>
                  <h3 className="text-2xl font-semibold mb-4">Nenhum bookmark ainda!</h3>
                  <AddBookmarkDialog onSuccess={fetchBookmarks} />
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-semibold mb-4">Nenhum resultado encontrado</h3>
                  <p className="text-gray-600 mb-6">Tente ajustar sua busca ou remover alguns filtros.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedTags([])
                    }}
                  >
                    Limpar Filtros
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBookmarks.map((bookmark) => (
                <BookmarkCard key={bookmark.id} bookmark={bookmark} onUpdate={fetchBookmarks} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
