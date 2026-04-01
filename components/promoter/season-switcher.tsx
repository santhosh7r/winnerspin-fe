"use client"
import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchSeasons, setCurrentSeason } from "@/lib/seasonSlice"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchPromoterProfile } from "@/lib/promoter/authSlice"

export function SeasonSwitcher() {
  const dispatch = useDispatch<AppDispatch>()
  const { seasons, currentSeason, isLoading } = useSelector((state: RootState) => state.season)

  useEffect(() => {
    if(!currentSeason) dispatch(fetchSeasons())

  }, [currentSeason, dispatch])

  useEffect(() => {
    // console.log("currentSeason", currentSeason);
    // console.log("All seasons ----", seasons);
  }, [currentSeason, seasons])

  const handleSeasonChange = (seasonId: string) => {
    const season = seasons.find((s) => s._id === seasonId)
    if (season) {
      dispatch(setCurrentSeason(season))
      dispatch(fetchPromoterProfile(season?._id))
    }
  }

  if (isLoading) {
    return <div className="w-48 h-10 bg-muted animate-pulse rounded-md" />
  }

  return (
    <Select value={currentSeason?._id || ""} onValueChange={handleSeasonChange}>
      <SelectTrigger className="w-[150px] sm:w-48">
        <SelectValue placeholder="Select season" />
      </SelectTrigger>
      <SelectContent>
        {seasons.map((season) => (
          <SelectItem key={season._id} value={season._id}>
            {season.season || `Season ${season.amount}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
