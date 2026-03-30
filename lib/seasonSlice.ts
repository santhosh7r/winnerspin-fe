import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"


interface Season {
  _id: string
  season: string
  amount: number
  duration: string
  startDate: string
  endDate: string
}

interface SeasonState {
  seasons: Season[]
  currentSeason: Season | null
  globalCurrentSeason: Season | null
  hasFetched: boolean
  isLoading: boolean
  error: string | null
}

const initialState: SeasonState = {
  seasons: [],
  currentSeason: null,
  globalCurrentSeason: null,
  hasFetched: false,
  isLoading: false,
  error: null,
}

export const fetchSeasons = createAsyncThunk("season/fetchSeasons", async (_, { getState }) => {
  const state = getState() as { auth: { token: string } }
  const response = await fetch("/api/promoter/my-seasons", {
    headers: {
      token: state.auth.token,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch seasons")
  }

  const data = await response.json()
  return data // Return the whole payload
})

const seasonSlice = createSlice({
  name: "season",
  initialState,
  reducers: {
    setCurrentSeason: (state, action: PayloadAction<Season>) => {
      state.currentSeason = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSeasons.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSeasons.fulfilled, (state, action: any) => {
        state.isLoading = false
        state.hasFetched = true
        
        let fetchedSeasons: Season[] = []
        let curSeason: Season | null = null
        if (Array.isArray(action.payload)) {
          fetchedSeasons = action.payload
        } else if (action.payload) {
          fetchedSeasons = (action.payload.approvedSeasons?.length > 0) ? action.payload.approvedSeasons : (action.payload.seasons || action.payload.approvedSeasons || [])
          curSeason = action.payload.curSeason || null
        }

        state.seasons = fetchedSeasons
        state.globalCurrentSeason = curSeason

        if (curSeason) {
          state.currentSeason = curSeason
        } else if (fetchedSeasons && fetchedSeasons.length > 0) {
          state.currentSeason = fetchedSeasons[0]
        } else {
          state.currentSeason = null
        }
      })
      .addCase(fetchSeasons.rejected, (state, action) => {  
        state.isLoading = false
        state.hasFetched = true
        state.seasons = []
        state.error = action.error.message || "Failed to fetch seasons"
      })
  },
})

export const { setCurrentSeason } = seasonSlice.actions
export default seasonSlice.reducer
