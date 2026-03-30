import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../store"

interface Customer {
  id: string
  username: string
  email: string
  mobile: string
  cardNo: string
  state: string
  status: "approved" | "pending"| "rejected"
  city: string
  address: string
  pincode: string
  firstPayment: number
  paymentDate: string
  _id: string
  seasonId: string
  createdAt: string
}

interface CustomerState {
  customers: Customer[]
  selectedCustomer: Customer | null
  isLoading: boolean
  error: string | null
}

const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  error: null,
}

export const fetchCustomers = createAsyncThunk("customer/fetchCustomers", async (seasonId: string, { getState }) => {
  const state = getState() as { auth: { token: string } }
  const response = await fetch(`/api/promoter/all-customers?seasonId=${seasonId}`, {
    headers: {
      token: state.auth.token,
    },
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch customers")
  }

  return data.customers
})

export const fetchCustomerDetails = createAsyncThunk(
  "customer/fetchCustomerDetails",
  async (customerId: string, { getState }) => {
    const state = getState() as { auth: { token: string } }
    const response = await fetch(`/api/promoter/customer-details?id=${customerId}`, {
      headers: {
        token: state.auth.token,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch customer details")
    }

    const data = await response.json()
    return data.customer
  },
)

export const createCustomer = createAsyncThunk(
  "customer/createCustomer",
  async (customerData: Omit<Customer, "id" | "cardNo" | "_id" | "createdAt">, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.token

    if (!token) {
      return rejectWithValue("Authentication token is missing.")
    }

    try {
      const response = await fetch("/api/promoter/create-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
          seasonid: customerData.seasonId,
        },
        body: JSON.stringify(customerData),
      })

      const data = await response.json()
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to create customer")
      }
      return data
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message)
      return rejectWithValue("An error occurred while creating customer")
    }
  },
)

export const updateCustomerDetails = createAsyncThunk(
  "customer/updateCustomerDetails",
  async (
    { customerId, updateData }: { customerId: string; updateData: Partial<Customer> },
    { getState, rejectWithValue },
  ) => {
    const state = getState() as RootState
    const token = state.auth.token
    const seasonId = state.season.currentSeason?._id

    if (!token || !seasonId) {
      return rejectWithValue("Authentication token or season ID is missing.")
    }

    try {
      const response = await fetch(`/api/promoter/customer/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token: token,
          seasonid: seasonId,
        },
        body: JSON.stringify(updateData),
      })
      const data = await response.json()
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to update customer")
      }
      return data.customer
    } catch (error) {
      if(error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue("An error occurred while updating customer")
    }
  },
)

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false
        state.customers = action.payload
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to fetch customers"
      })
      .addCase(fetchCustomerDetails.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.selectedCustomer = action.payload
        state.isLoading = false
      })
      .addCase(fetchCustomerDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to fetch customer details"
      })
      .addCase(fetchCustomerDetails.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createCustomer.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createCustomer.fulfilled, (state) => {
        state.isLoading = false
        // Refresh customers list would be handled by refetching
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to create customer"
      })
      .addCase(updateCustomerDetails.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCustomerDetails.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.isLoading = false
        state.selectedCustomer = action.payload
      })
      .addCase(updateCustomerDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || "Failed to update customer"
      })
  },
})

export const { clearSelectedCustomer, clearError } = customerSlice.actions
export default customerSlice.reducer
