import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(bookmarks)
  } catch (error) {
    console.error("Error fetching bookmarks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, link, tags, aiGenerated } = await request.json()

    const bookmark = await prisma.bookmark.create({
      data: {
        title,
        description,
        link,
        tags,
        userId: session.user.id,
        // Salvar dados da IA como JSON
        aiGenerated: aiGenerated ? JSON.stringify(aiGenerated) : null,
      },
    })

    return NextResponse.json(bookmark)
  } catch (error) {
    console.error("Error creating bookmark:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
