interface User {
  id: string
  name: string
  email: string
}

interface Bookmark {
  id: string
  title: string
  description: string
  url: string
  createdAt: string
  updatedAt: string
  userId: string
  user: User
}

interface CreateBookmarkData {
  title: string
  description: string
  url: string
}

class BookmarkAPI {
  async getBookmarks(search?: string, userId?: string): Promise<Bookmark[]> {
    const url = new URL("/api/bookmarks", window.location.origin)
    if (search) {
      url.searchParams.set("search", search)
    }
    if (userId) {
      url.searchParams.set("userId", userId)
    }

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error("Erro ao buscar bookmarks")
    }

    return response.json()
  }

  async getMyBookmarks(userId: string, search?: string): Promise<Bookmark[]> {
    return this.getBookmarks(search, userId)
  }

  async createBookmark(data: CreateBookmarkData): Promise<Bookmark> {
    const response = await fetch("/api/bookmarks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Erro ao criar bookmark")
    }

    return response.json()
  }

  async updateBookmark(id: string, data: CreateBookmarkData): Promise<Bookmark> {
    const response = await fetch(`/api/bookmarks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Erro ao atualizar bookmark")
    }

    return response.json()
  }

  async deleteBookmark(id: string): Promise<void> {
    const response = await fetch(`/api/bookmarks/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Erro ao excluir bookmark")
    }
  }
}

export const bookmarkAPI = new BookmarkAPI()
