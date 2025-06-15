import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"

const prisma = new PrismaClient()

// GET - Buscar bookmark específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!bookmark) {
      return NextResponse.json({ error: "Bookmark não encontrado" }, { status: 404 })
    }

    return NextResponse.json(bookmark)
  } catch (error) {
    console.error("Erro ao buscar bookmark:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Atualizar bookmark
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const existingBookmark = await prisma.bookmark.findUnique({
      where: { id: params.id },
    })

    if (!existingBookmark) {
      return NextResponse.json({ error: "Bookmark não encontrado" }, { status: 404 })
    }

    if (existingBookmark.userId !== session.user.id) {
      return NextResponse.json({ error: "Você só pode editar seus próprios bookmarks" }, { status: 403 })
    }

    const { title, description, url } = await request.json()

    if (!title || !description || !url) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 })
    }

    const bookmark = await prisma.bookmark.update({
      where: { id: params.id },
      data: {
        title,
        description,
        url,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(bookmark)
  } catch (error) {
    console.error("Erro ao atualizar bookmark:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Excluir bookmark
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const existingBookmark = await prisma.bookmark.findUnique({
      where: { id: params.id },
    })

    if (!existingBookmark) {
      return NextResponse.json({ error: "Bookmark não encontrado" }, { status: 404 })
    }

    if (existingBookmark.userId !== session.user.id) {
      return NextResponse.json({ error: "Você só pode excluir seus próprios bookmarks" }, { status: 403 })
    }

    await prisma.bookmark.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Bookmark excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir bookmark:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
