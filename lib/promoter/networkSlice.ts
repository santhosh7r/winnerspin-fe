import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { RootState } from "../store"

export interface Promoter {
  _id: string
  userid: string
  username: string
  email: string
  mobNo: string
  isActive?: boolean
  createdAt?: string
  parentPromoter?: {
    _id: string
    userid: string
    username: string
  }
}

export interface Customer {
  _id: string
  username: string
  email: string
  mobile: string
  cardNo: string
  status: string
  createdAt: string
  promoter?: {
    _id: string
    userid: string
    username: string
  }
}

export interface NetworkData {
  selfMadePromoters: Promoter[]
  networkPromoters: Promoter[]
  selfMadeCustomers: Customer[]
  networkCustomers: Customer[]
  counts: {
    selfMadePromoters: number
    totalNetworkPromoters: number
    selfMadeCustomers: number
    totalNetworkCustomers: number
  }
}

export interface NetworkState {
  data: NetworkData | null
  detailPromoter: {
    promoter: Promoter
    selfMadeCustomers: Customer[]
    networkCustomers: Customer[]
  } | null
  isLoading: boolean
  error: string | null
}

const initialState: NetworkState = {
  data: null,
  detailPromoter: null,
  isLoading: false,
  error: null,
}

export const fetchMyNetwork = createAsyncThunk(
  "network/fetchMyNetwork",
  async (seasonId: string | undefined, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    try {
      let url = "/api/promoter/my-network"
      if (seasonId) url += `?seasonId=${seasonId}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          token: state.auth.token!,
          ...(seasonId && { seasonid: seasonId })
        },
      })
      const data = await response.json()
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch network")
      }
      return data.network
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message)
      return rejectWithValue("An unknown error occurred")
    }
  }
)

export const fetchNetworkPromoter = createAsyncThunk(
  "network/fetchNetworkPromoter",
  async ({ id, seasonId }: { id: string, seasonId?: string }, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    try {
      let url = `/api/promoter/network-promoter/${id}`
      if (seasonId) url += `?seasonId=${seasonId}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          token: state.auth.token!,
          ...(seasonId && { seasonid: seasonId })
        },
      })
      const data = await response.json()
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch network promoter")
      }
      return data
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message)
      return rejectWithValue("An unknown error occurred")
    }
  }
)

export const createPromoter = createAsyncThunk(
  "network/createPromoter",
  async (promoterData: any, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    try {
      const response = await fetch("/api/promoter/create-promoter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: state.auth.token!,
        },
        body: JSON.stringify(promoterData),
      })
      const data = await response.json()
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to create promoter")
      }
      return data
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message)
      return rejectWithValue("An unknown error occurred")
    }
  }
)

const networkSlice = createSlice({
  name: "network",
  initialState,
  reducers: {
    clearNetworkError: (state) => {
      state.error = null
    },
    clearDetailPromoter: (state) => {
      state.detailPromoter = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyNetwork.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyNetwork.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(fetchMyNetwork.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || "Failed to fetch network"
      })
      .addCase(fetchNetworkPromoter.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchNetworkPromoter.fulfilled, (state, action) => {
        state.isLoading = false
        state.detailPromoter = action.payload
      })
      .addCase(fetchNetworkPromoter.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || "Failed to fetch network promoter details"
      })
      .addCase(createPromoter.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPromoter.fulfilled, (state, action) => {
        state.isLoading = false
        // optionally refetch or update network
      })
      .addCase(createPromoter.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || "Failed to create promoter"
      })
  },
})

export const { clearNetworkError, clearDetailPromoter } = networkSlice.actions
export default networkSlice.reducer
