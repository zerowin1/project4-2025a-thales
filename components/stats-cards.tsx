"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BookmarkIcon, Tags, Calendar, TrendingUp } from "lucide-react"

interface StatsCardsProps {
  totalBookmarks: number
  totalTags: number
  bookmarksThisMonth: number
  mostUsedTag: string
}

export function StatsCards({ totalBookmarks, totalTags, bookmarksThisMonth, mostUsedTag }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total de Bookmarks</p>
              <p className="text-2xl font-bold text-blue-900">{totalBookmarks}</p>
            </div>
            <BookmarkIcon className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Tags Únicas</p>
              <p className="text-2xl font-bold text-purple-900">{totalTags}</p>
            </div>
            <Tags className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Este Mês</p>
              <p className="text-2xl font-bold text-green-900">{bookmarksThisMonth}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Tag Popular</p>
              <p className="text-lg font-bold text-orange-900 truncate">{mostUsedTag || "Nenhuma"}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
