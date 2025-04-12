// lib/redux/slices/__tests__/pickupSlice.test.js
import { configureStore } from '@reduxjs/toolkit';
import pickupReducer, {
  fetchPickups,
  fetchPickupById,
  createPickup,
  updatePickup,
  deletePickup,
  updatePickupStatus,
  resetPickupState,
  clearPickup,
  clearError,
} from '../pickupSlice';

// Mock API calls
jest.mock('@/lib/api', () => ({
  pickupAPI: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateStatus: jest.fn(),
  },
  pickupRequestAPI: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
  },
}));

// Import mocked API
import { pickupAPI, pickupRequestAPI } from '@/lib/api';

describe('Pickup Redux Slice', () => {
  let store;

  beforeEach(() => {
    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        pickup: pickupReducer,
      },
    });

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Reducers', () => {
    test('should handle initial state', () => {
      expect(store.getState().pickup).toEqual({
        pickups: [],
        pickup: null,
        todayPickups: {
          counts: {
            PENDING: 0,
            BERANGKAT: 0,
            SELESAI: 0,
            CANCELLED: 0,
            TOTAL: 0,
          },
          recent: [],
        },
        pickupRequests: [],
        pickupRequest: null,
        pagination: {
          currentPage: 1,
          totalPages: 0,
          total: 0,
        },
        loading: false,
        loadingRequest: false,
        submitting: false,
        error: null,
        success: false,
        loadingToday: false,
      });
    });

    test('should handle resetPickupState', () => {
      // First, modify the state
      store.dispatch(clearError());
      store.dispatch(resetPickupState());
      
      // Check that state is reset but preserves certain fields
      const state = store.getState().pickup;
      expect(state).toEqual({
        pickups: [],
        pickup: null,
        todayPickups: {
          counts: {
            PENDING: 0,
            BERANGKAT: 0,
            SELESAI: 0,
            CANCELLED: 0,
            TOTAL: 0,
          },
          recent: [],
        },
        pickupRequests: [],
        pickupRequest: null,
        pagination: {
          currentPage: 1,
          totalPages: 0,
          total: 0,
        },
        loading: false,
        loadingRequest: false,
        submitting: false,
        error: null,
        success: false,
        loadingToday: false,
      });
    });

    test('should handle clearPickup', () => {
      // Set pickup to a value
      store.dispatch({
        type: 'pickup/fetchPickupById/fulfilled',
        payload: { _id: '123', noPengambilan: 'PU001' },
      });
      
      // Clear pickup
      store.dispatch(clearPickup());
      
      // Check that pickup is null
      expect(store.getState().pickup.pickup).toBeNull();
    });

    test('should handle clearError', () => {
      // Set error to a value
      store.dispatch({
        type: 'pickup/fetchPickups/rejected',
        payload: 'Error message',
      });
      
      // Clear error
      store.dispatch(clearError());
      
      // Check that error is null
      expect(store.getState().pickup.error).toBeNull();
    });
  });

  describe('Async Thunks', () => {
    describe('fetchPickups', () => {
      test('should fetch pickups successfully', async () => {
        // Mock API response
        const mockResponse = {
          data: {
            data: [
              { _id: '1', noPengambilan: 'PU001' },
              { _id: '2', noPengambilan: 'PU002' },
            ],
          },
          pagination: {
            page: 1,
            totalPages: 1,
          },
          total: 2,
        };
        
        pickupAPI.getAll.mockResolvedValue({ data: mockResponse });
        
        // Dispatch the action
        await store.dispatch(fetchPickups());
        
        // Check that the API was called
        expect(pickupAPI.getAll).toHaveBeenCalledTimes(1);
        
        // Check that the state was updated correctly
        const state = store.getState().pickup;
        expect(state.loading).toBe(false);
        expect(state.pickups).toEqual(mockResponse.data.data);
        expect(state.pagination).toEqual({
          currentPage: 1,
          totalPages: 1,
          total: 2,
        });
        expect(state.error).toBeNull();
      });

      test('should handle fetchPickups error', async () => {
        // Mock API error
        const errorMessage = 'Failed to fetch pickups';
        pickupAPI.getAll.mockRejectedValue({
          response: { data: { message: errorMessage } },
        });
        
        // Dispatch the action
        await store.dispatch(fetchPickups());
        
        // Check that the API was called
        expect(pickupAPI.getAll).toHaveBeenCalledTimes(1);
        
        // Check that the state was updated correctly
        const state = store.getState().pickup;
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
    });

    describe('fetchPickupById', () => {
      test('should fetch a pickup by ID successfully', async () => {
        // Mock API response
        const mockPickup = { _id: '123', noPengambilan: 'PU001' };
        pickupAPI.getById.mockResolvedValue({ data: { data: mockPickup } });
        
        // Dispatch the action
        await store.dispatch(fetchPickupById('123'));
        
        // Check that the API was called with the correct ID
        expect(pickupAPI.getById).toHaveBeenCalledWith('123');
        
        // Check that the state was updated correctly
        const state = store.getState().pickup;
        expect(state.loading).toBe(false);
        expect(state.pickup).toEqual(mockPickup);
        expect(state.error).toBeNull();
      });

      test('should handle fetchPickupById error', async () => {
        // Mock API error
        const errorMessage = 'Pickup not found';
        pickupAPI.getById.mockRejectedValue({
          response: { data: { message: errorMessage } },
        });
        
        // Dispatch the action
        await store.dispatch(fetchPickupById('999'));
        
        // Check that the API was called
        expect(pickupAPI.getById).toHaveBeenCalledWith('999');
        
        // Check that the state was updated correctly
        const state = store.getState().pickup;
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
    });

    describe('createPickup', () => {
      test('should create a pickup successfully', async () => {
        // Mock data and API response
        const pickupData = {
          pengirimId: '123',
          alamatPengambilan: 'Test Address',
          jumlahColly: 5,
        };
        
        const createdPickup = {
          _id: 'new123',
          noPengambilan: 'PU003',
          ...pickupData,
        };
        
        pickupAPI.create.mockResolvedValue({ data: { data: createdPickup } });
        
        // Dispatch the action
        await store.dispatch(createPickup(pickupData));
        
        // Check that the API was called with the correct data
        expect(pickupAPI.create).toHaveBeenCalledWith(pickupData);
        
        // Check that the state was updated correctly
        const state = store.getState().pickup;
        expect(state.submitting).toBe(false);
        expect(state.pickup).toEqual(createdPickup);
        expect(state.success).toBe(true);
        expect(state.error).toBeNull();
      });

      test('should handle createPickup error', async () => {
        // Mock data and API error
        const pickupData = { pengirimId: '123' }; // Missing required fields
        const errorMessage = 'Validation failed';
        
        pickupAPI.create.mockRejectedValue({
          response: { data: { message: errorMessage } },
        });
        
        // Dispatch the action
        await store.dispatch(createPickup(pickupData));
        
        // Check that the API was called
        expect(pickupAPI.create).toHaveBeenCalledWith(pickupData);
        
        // Check that the state was updated correctly
        const state = store.getState().pickup;
        expect(state.submitting).toBe(false);
        expect(state.success).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
    });

    describe('updatePickup', () => {
      test('should update a pickup successfully', async () => {
        // Mock data and API response
        const id = '123';
        const updateData = {
          alamatPengambilan: 'Updated Address',
          jumlahColly: 10,
        };
        
        const updatedPickup = {
          _id: id,
          noPengambilan: 'PU001',
          pengirimId: '123',
          alamatPengambilan: 'Updated Address',
          jumlahColly: 10,
        };
        
        pickupAPI.update.mockResolvedValue({ data: { data: updatedPickup } });
        
        // Dispatch the action
        await store.dispatch(updatePickup({ id, data: updateData }));
        
        // Check that the API was called with the correct data
        expect(pickupAPI.update).toHaveBeenCalledWith(id, updateData);
        
        // Check that the state was updated correctly
        const state = store.getState().pickup;
        expect(state.submitting).toBe(false);
        expect(state.pickup).toEqual(updatedPickup);
        expect(state.success).toBe(true);
        expect(state.error).toBeNull();
      });

      test('should handle updatePickup error', async () => {
        // Mock data and API error
        const id = '123';
        const updateData = { jumlahColly: 'invalid' }; // Invalid data type
        const errorMessage = 'Validation failed';
        
        pickupAPI.update.mockRejectedValue({
          response: { data: { message: errorMessage } },
        });
        
        // Dispatch the action
        await store.dispatch(updatePickup({ id, data: updateData }));
        
        // Check that the API was called
        expect(pickupAPI.update).toHaveBeenCalledWith(id, updateData);
        
        // Check that the state was updated correctly
        const state = store.getState().pickup;
        expect(state.submitting).toBe(false);
        expect(state.success).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
    });

    describe('deletePickup', () => {
      test('should delete a pickup successfully', async () => {
        // Mock API response
        const id = '123';
        pickupAPI.delete.mockResolvedValue({ data: { success: true } });
        
        // First, add a pickup to the state
        store.dispatch({
          type: 'pickup/fetchPickupById/fulfilled',
          payload: { _id: id, noPengambilan: 'PU001' },
        });
        
        // Dispatch the delete action
        await store.dispatch(deletePickup(id));
        
        // Check that the API was called with the correct ID
        expect(pickupAPI.delete).toHaveBeenCalledWith(id);
        
        // Check that the state was updated correctly
        const state = store.getState().pickup;
        expect(state.submitting).toBe(false);
        expect(state.pickup).toBeNull(); // Pickup should be removed
        expect(state.success).toBe(true);
        expect(state.error).toBeNull();
      });

      test('should handle deletePickup error', async () => {
        // Mock API error
        const id = '123';
        const errorMessage = 'Cannot delete pickup';
        
        pickupAPI.delete.mockRejectedValue({
          response: { data: { message: errorMessage } },
        });
        
        // Dispatch the action
        await store.dispatch(deletePickup(id));
        
        // Check that the API was called
        expect(pickupAPI.delete).toHaveBeenCalledWith(id);
        
        // Check that the state was updated correctly
        const state = store.getState().pickup;
        expect(state.submitting).toBe(false);
        expect(state.success).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
    });

    describe('updatePickupStatus', () => {
      test('should update pickup status successfully', async () => {
        // Mock data and API response
        const id = '123';
        const status = 'SELESAI';
        const notes = 'Completed successfully';
        
        const updatedPickup = {
          _id: id,
          noPengambilan: 'PU001',
          status: 'SELESAI',
          notes: 'Completed successfully',
        };
        
        pickupAPI.updateStatus.mockResolvedValue({ data: { data: updatedPickup } });
        
        // Dispatch the action
        await store.dispatch(updatePickupStatus({ id, status, notes }));
        
        // Check that the API was called with the correct data
        expect(pickupAPI.updateStatus).toHaveBeenCalledWith(id, { status, notes });
        
        // Check that the state was updated correctly
        const state = store.getState().pickup;
        expect(state.submitting).toBe(false);
        expect(state.pickup).toEqual(updatedPickup);
        expect(state.success).toBe(true);
        expect(state.error).toBeNull();
      });

      test('should handle updatePickupStatus error', async () => {
        // Mock data and API error
        const id = '123';
        const status = 'INVALID_STATUS';
        const errorMessage = 'Invalid status';
        
        pickupAPI.updateStatus.mockRejectedValue({
          response: { data: { message: errorMessage } },
        });
        
        // Dispatch the action
        await store.dispatch(updatePickupStatus({ id, status }));
        
        // Check that the API was called
        expect(pickupAPI.updateStatus).toHaveBeenCalledWith(id, { status });
        
        // Check that the state was updated correctly
        const state = store.getState().pickup;
        expect(state.submitting).toBe(false);
        expect(state.success).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
    });
  });
});