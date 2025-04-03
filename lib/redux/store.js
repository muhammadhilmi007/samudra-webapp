import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import divisiReducer from './slices/divisiSlice'
import cabangReducer from './slices/cabangSlice'
import pegawaiReducer from './slices/pegawaiSlice'
import customerReducer from './slices/customerSlice'
import vehicleReducer from './slices/vehicleSlice'
import pickupReducer from './slices/pickupSlice'
import sttReducer from './slices/sttSlice'
import loadingReducer from './slices/loadingSlice'
import deliveryReducer from './slices/deliverySlice'
import returnReducer from './slices/returnSlice'
import collectionReducer from './slices/collectionSlice'
import financeReducer from './slices/financeSlice'
import vehicleQueueReducer from './slices/vehicleQueueSlice';
import truckQueueReducer from './slices/truckQueueSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    divisi: divisiReducer,
    cabang: cabangReducer,
    pegawai: pegawaiReducer,
    customer: customerReducer,
    vehicle: vehicleReducer,
    pickup: pickupReducer,
    stt: sttReducer,
    loading: loadingReducer,
    delivery: deliveryReducer,
    retur: returnReducer,
    collection: collectionReducer,
    dashboard: dashboardReducer,
    finance: financeReducer,
    vehicleQueue: vehicleQueueReducer,
    truckQueue: truckQueueReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export default store