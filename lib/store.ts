import { configureStore } from "@reduxjs/toolkit";

// Promoter-related slices
import authSlice from "./promoter/authSlice";
import seasonSlice from "./seasonSlice";
import customerSlice from "./user/customerSlice";
import repaymentSlice from "./promoter/repaymentSlice";
import walletSlice from "./promoter/walletSlice";
import withdrawalSlice from "./promoter/withdrawalSlice";
import posterSlice from "./promoter/posterSlice";
import paymentReducer from "./promoter/paymentSlice";
import networkSlice from "./promoter/networkSlice";

// Customer-related slices
import customerAuthSlice from "./user/customerAuthSlice";
import customerProfileSlice from "./user/customerProfileSlice";
import installmentsSlice from "./user/installmentsSlice";
import promoterSlice from "./user/promoterSlice";
import customerPosterSlice from "./user/customerPosterSlice";

export const store = configureStore({
  reducer: {
    // Promoter reducers
    auth: authSlice,
    season: seasonSlice,
    customer: customerSlice,
    repayment: repaymentSlice,
    wallet: walletSlice,
    withdrawal: withdrawalSlice,
    payment: paymentReducer,
    poster: posterSlice,
    network: networkSlice,

    // Customer reducers
    customerAuth: customerAuthSlice,
    customerProfile: customerProfileSlice,
    installments: installmentsSlice,
    promoter: promoterSlice,
    customerPoster: customerPosterSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
