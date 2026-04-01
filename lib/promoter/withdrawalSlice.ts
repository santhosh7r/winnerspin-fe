import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

interface Withdrawal {
  _id: string
  amount: string // Schema defines amount as String
  status: "approved" | "rejected" | "pending"
  createdAt: string
}

interface WithdrawalState {
  withdrawals: Withdrawal[]
  isLoading: boolean
  error: string | null
}

const initialState: WithdrawalState = {
  withdrawals: [],
  isLoading: false,
  error: null,
}

export const fetchWithdrawals = createAsyncThunk(
  "withdrawal/fetchWithdrawals",
  async (_, { getState }) => {
  const state = getState() as { auth: { token: string }; season: { currentSeason: { _id: string } } }
  const seasonId = state.season.currentSeason?._id
  const response = await fetch(`/api/promoter/all-withdrawals?seasonId=${seasonId}`, {
    headers: {
      token: state.auth.token,
      seasonid: seasonId,
    },
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch withdrawals")
  }

  return data.withdrawals
  },
)

export const requestWithdrawal = createAsyncThunk(
  "withdrawal/requestWithdrawal",
  async ({ amount, seasonId }: { amount: number; seasonId: string }, { getState }) => {
    const state = getState() as { auth: { token: string } }
    const response = await fetch(`/api/promoter/request-withdrawal?seasonId=${seasonId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: state.auth.token,
        seasonid: seasonId,
      },
      body: JSON.stringify({ amount }),
    })

    const data = await response.json()
    if (!response.ok) {
      
      throw new Error(data.message || "Server error")
    }

    return data
  },
)

const withdrawalSlice = createSlice({
  name: "withdrawal",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWithdrawals.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchWithdrawals.fulfilled, (state, action) => {
        state.isLoading = false
        state.withdrawals = action.payload
      })
      .addCase(fetchWithdrawals.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to fetch withdrawals"
      })
      .addCase(requestWithdrawal.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(requestWithdrawal.fulfilled, (state) => {
        state.isLoading = false

        // Refresh withdrawals list would be handled by refetching
      })
      .addCase(requestWithdrawal.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed  withdrawal"
      })
  },
})

export const { clearError } = withdrawalSlice.actions
export default withdrawalSlice.reducer
