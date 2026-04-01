import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store"

interface Poster {
  _id: string
  url: string
  season: string
  createdAt: string
}

interface PosterState {
  newPoster: Poster | null
  isLoading: boolean
  error: string | null
}

const initialState: PosterState = {
  newPoster: null,
  isLoading: false,
  error: null,
}

export const fetchNewPoster = createAsyncThunk("poster/fetchNewPoster", async (_, { getState, rejectWithValue }) => {
  const state = getState() as RootState
  const seasonId = state.season.currentSeason?._id
  const token = state.auth.token

  if (!seasonId || !token) {
    return rejectWithValue("Missing season or authentication token.")
  }

  try {
    const response = await fetch(`/api/promoter/new-poster?seasonId=${seasonId}`, {
      headers: { token },
    })
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.message || "Failed to fetch new poster")
    }
    return data.newPoster
  } catch (error) {
    if(error instanceof Error) return rejectWithValue(error.message);
    return rejectWithValue("An error occurred while fetching the new poster")
  }
})

const posterSlice = createSlice({
  name: "poster",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewPoster.fulfilled, (state, action: PayloadAction<Poster | null>) => {
        state.newPoster = action.payload
      })
  },
})

export default posterSlice.reducer