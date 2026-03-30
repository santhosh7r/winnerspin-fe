"use client"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchNewPoster } from "@/lib/promoter/posterSlice"
import { SeasonSwitcher } from "@/components/promoter/season-switcher"
import Image from "next/image"
import type { AppDispatch, RootState } from "@/lib/store"

export default function PostersPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { newPoster, isLoading } = useSelector((state: RootState) => state.poster)

  useEffect(() => {
    dispatch(fetchNewPoster())
  }, [dispatch])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Posters</h1>
          <p className="text-muted-foreground">View current promotional materials</p>
        </div>
        <div>
          <SeasonSwitcher />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Poster</CardTitle>
          <CardDescription>
            Use this poster for marketing and recruiting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 bg-muted animate-pulse rounded" />
          ) : newPoster?.url ? (
             <div className="relative w-full max-w-2xl mx-auto flex items-center justify-center">
                <Image
                  src={newPoster.url}
                  alt="Promotional Poster"
                  width={600}
                  height={800}
                  className="rounded border"
                  style={{ objectFit: "contain" }}
                />
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No new poster available at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
