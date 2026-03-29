import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { fetchPromoterProfile } from "./authSlice"

export interface PaymentDetails {
  _id: string
  bankName: string
  accNo: string
  ifscCode: string
  accHolderName: string
  upiId?: string
  branch?: string
  branchAdress?: string
}

interface PaymentState {
  details: PaymentDetails | null
  isLoading: boolean
  error: string | null
}

const initialState: PaymentState = {
  details: null,
  isLoading: false,
  error: null,
}

export const addPaymentDetails = createAsyncThunk(
  "payment/addPaymentDetails",
  async (paymentDetails: Omit<PaymentDetails, "_id">, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.token
    const seasonId = state.season.currentSeason?._id

    if (!token || !seasonId) {
      return rejectWithValue("Authentication token or season ID is missing.")
    }

    try {
      const response = await fetch(`/api/promoter/add-payment-details?seasonId=${seasonId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
          seasonid: seasonId,
        },
        body: JSON.stringify(paymentDetails),
      })
      const data = await response.json()
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to add payment details")
      }
      // The backend doesn't return the details, so we optimistically update
      return paymentDetails as PaymentDetails
    } catch (error) {
      if(error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue("An error occurred while adding payment details")
    }
  },
)

export const removePaymentDetails = createAsyncThunk(
  "payment/removePaymentDetails",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.token
    const seasonId = state.season.currentSeason?._id

    if (!token || !seasonId) {
      return rejectWithValue("Authentication token or season ID is missing.")
    }

    try {
      const response = await fetch(`/api/promoter/payment-details?seasonId=${seasonId}`, {
        method: "DELETE",
        headers: {
          token: token,
          seasonid: seasonId,
        },
      })
      const data = await response.json()
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to remove payment details")
      }
      return data
    } catch (error) {
      if(error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue("An error occurred while removing payment details")
    }
  },
)

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Listen for the fetchPromoterProfile action
      .addCase(fetchPromoterProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPromoterProfile.fulfilled, (state, action) => {
        state.isLoading = false
        // The payload from fetchPromoterProfile contains the whole promoter object
        state.details = action.payload.payment || null
      })
      .addCase(fetchPromoterProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || "Failed to fetch profile data"
      })
      .addCase(addPaymentDetails.fulfilled, (state, action: PayloadAction<PaymentDetails>) => {
        state.details = action.payload
      })
      .addCase(removePaymentDetails.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(removePaymentDetails.fulfilled, (state) => {
        state.isLoading = false
        state.details = null
      })
      .addCase(removePaymentDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || "Failed to remove payment details"
      })
  },
})

export default paymentSlice.reducer