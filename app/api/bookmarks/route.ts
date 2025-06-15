import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"

const prisma = new PrismaClient()

// GET - Listar todos os bookmarks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const userId = searchParams.get("userId") || ""

    let whereClause = {}

    if (userId) {
      whereClause = { userId }
    }

    if (search) {
      whereClause = {
        ...whereClause,
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
        ],
      }
    }

    const bookmarks = await prisma.bookmark.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(bookmarks)
  } catch (error) {
    console.error("Erro ao buscar bookmarks:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Criar novo bookmark
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
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

    const bookmark = await prisma.bookmark.create({
      data: {
        title,
        description,
        url,
        userId: session.user.id,
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

    return NextResponse.json(bookmark, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar bookmark:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
