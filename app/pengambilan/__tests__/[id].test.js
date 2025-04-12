// app/pengambilan/__tests__/[id].test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PickupDetailPage from '../[id]/page';
import pickupReducer, {
  fetchPickupById,
  updatePickupStatus,
  deletePickup,
} from '@/lib/redux/slices/pickupSlice';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useParams: jest.fn(() => ({
    id: 'test-id',
  })),
}));

// Mock the hooks
jest.mock('@/lib/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

// Mock the components
jest.mock('@/components/layout/header', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-header">Header</div>,
}));

jest.mock('@/components/layout/sidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-sidebar">Sidebar</div>,
}));

jest.mock('@/components/shared/breadcrumbs', () => ({
  Breadcrumbs: () => <div data-testid="mock-breadcrumbs">Breadcrumbs</div>,
}));

jest.mock('@/components/shared/status-badge', () => ({
  __esModule: true,
  default: ({ status }) => <div data-testid="mock-status-badge">{status}</div>,
}));

// Mock UI components that use cn function
jest.mock('@/components/ui/card', () => ({
  __esModule: true,
  Card: ({ children, className, ...props }) => <div data-testid="mock-card" className={className} {...props}>{children}</div>,
  CardHeader: ({ children, className, ...props }) => <div data-testid="mock-card-header" className={className} {...props}>{children}</div>,
  CardFooter: ({ children, className, ...props }) => <div data-testid="mock-card-footer" className={className} {...props}>{children}</div>,
  CardTitle: ({ children, className, ...props }) => <div data-testid="mock-card-title" className={className} {...props}>{children}</div>,
  CardDescription: ({ children, className, ...props }) => <div data-testid="mock-card-description" className={className} {...props}>{children}</div>,
  CardContent: ({ children, className, ...props }) => <div data-testid="mock-card-content" className={className} {...props}>{children}</div>,
}));

jest.mock('@/components/ui/alert', () => ({
  __esModule: true,
  Alert: ({ children, className, ...props }) => <div data-testid="mock-alert" className={className} {...props}>{children}</div>,
  AlertTitle: ({ children, className, ...props }) => <div data-testid="mock-alert-title" className={className} {...props}>{children}</div>,
  AlertDescription: ({ children, className, ...props }) => <div data-testid="mock-alert-description" className={className} {...props}>{children}</div>,
}));

jest.mock('@/components/ui/skeleton', () => ({
  __esModule: true,
  Skeleton: ({ className, ...props }) => <div data-testid="mock-skeleton" className={className} {...props} />,
}));

// Mock the Redux actions
jest.mock('@/lib/redux/slices/pickupSlice', () => {
  const actual = jest.requireActual('@/lib/redux/slices/pickupSlice');
  return {
    ...actual,
    fetchPickupById: jest.fn(),
    updatePickupStatus: jest.fn(),
    deletePickup: jest.fn(),
  };
});

// Mock formatDate utility
jest.mock('@/lib/utils', () => ({
  formatDate: jest.fn((date) => date ? 'Formatted Date' : '-'),
}));

// Mock the useSelector hook
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(() => jest.fn()),
}));

describe('PickupDetailPage', () => {
  // Sample pickup data
  const mockPickup = {
    _id: 'test-id',
    noPengambilan: 'PU001',
    tanggal: '2023-01-01',
    pengirimId: {
      _id: 'sender-id',
      nama: 'Test Sender',
    },
    alamatPengambilan: 'Test Address',
    tujuan: 'Test Destination',
    jumlahColly: 5,
    supirId: {
      _id: 'driver-id',
      nama: 'Test Driver',
    },
    kendaraanId: {
      _id: 'vehicle-id',
      namaKendaraan: 'Test Vehicle',
      noPolisi: 'B 1234 CD',
    },
    estimasiPengambilan: '2023-01-02T10:00:00',
    status: 'PENDING',
    notes: 'Test notes',
    createdAt: '2023-01-01T08:00:00',
    updatedAt: '2023-01-01T09:00:00',
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock useSelector to return the data we want
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      // Create a mock state
      const state = {
        pickup: {
          pickup: mockPickup,
          loading: false,
          error: null
        },
        auth: {
          currentUser: {
            nama: 'Test User',
            jabatan: 'Admin',
            email: 'test@example.com',
          }
        }
      };
      return selector(state);
    });
    
    // Mock the fetchPickupById action
    fetchPickupById.mockImplementation(() => ({
      type: 'pickup/fetchPickupById/fulfilled',
      payload: mockPickup,
    }));
  });

  test('renders loading state initially', () => {
    // Mock useSelector to return loading state
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      // Create a mock state with loading=true
      const state = {
        pickup: {
          pickup: null,
          loading: true,
          error: null
        },
        auth: {
          currentUser: {
            nama: 'Test User',
            jabatan: 'Admin',
            email: 'test@example.com',
          }
        }
      };
      return selector(state);
    });
    
    render(<PickupDetailPage />);
    
    // Check that loading elements are rendered
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-breadcrumbs')).toBeInTheDocument();
    expect(screen.queryAllByRole('button', { name: /batal/i })).toHaveLength(0); // No buttons in loading state
  });

  test('renders error state when pickup not found', () => {
    // Mock useSelector to return error state
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      // Create a mock state with error
      const state = {
        pickup: {
          pickup: null,
          loading: false,
          error: 'Pickup not found'
        },
        auth: {
          currentUser: {
            nama: 'Test User',
            jabatan: 'Admin',
            email: 'test@example.com',
          }
        }
      };
      return selector(state);
    });
    
    render(<PickupDetailPage />);
    
    // Check that error elements are rendered
    expect(screen.getByText(/pengambilan tidak ditemukan atau telah dihapus/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /kembali ke daftar pengambilan/i })).toBeInTheDocument();
  });

  test('renders pickup details correctly', async () => {
    // Mock useSelector to return pickup data
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      // Create a mock state with pickup data
      const state = {
        pickup: {
          pickup: mockPickup,
          loading: false,
          error: null
        },
        auth: {
          currentUser: {
            nama: 'Test User',
            jabatan: 'Admin',
            email: 'test@example.com',
          }
        }
      };
      return selector(state);
    });
    
    render(<PickupDetailPage />);
    
    // Check that pickup details are rendered
    expect(screen.getByText(`Detail Pengambilan ${mockPickup.noPengambilan}`)).toBeInTheDocument();
    expect(screen.getByTestId('mock-status-badge')).toBeInTheDocument();
    expect(screen.getByText(mockPickup.pengirimId.nama)).toBeInTheDocument();
    expect(screen.getByText(mockPickup.alamatPengambilan)).toBeInTheDocument();
    expect(screen.getByText(mockPickup.tujuan)).toBeInTheDocument();
    expect(screen.getByText(mockPickup.jumlahColly.toString())).toBeInTheDocument();
    expect(screen.getByText(mockPickup.supirId.nama)).toBeInTheDocument();
    expect(screen.getByText(`${mockPickup.kendaraanId.namaKendaraan} - ${mockPickup.kendaraanId.noPolisi}`)).toBeInTheDocument();
    expect(screen.getByText(mockPickup.notes)).toBeInTheDocument();
    
    // Check that action buttons are rendered
    expect(screen.getByRole('button', { name: /ubah status/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
  });

  test('opens status dialog when status button is clicked', async () => {
    // Mock useSelector to return pickup data
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      // Create a mock state with pickup data
      const state = {
        pickup: {
          pickup: mockPickup,
          loading: false,
          error: null
        },
        auth: {
          currentUser: {
            nama: 'Test User',
            jabatan: 'Admin',
            email: 'test@example.com',
          }
        }
      };
      return selector(state);
    });
    
    render(<PickupDetailPage />);
    
    // Click the status button
    fireEvent.click(screen.getByRole('button', { name: /ubah status/i }));
    
    // Click on a status option (e.g., Berangkat)
    fireEvent.click(screen.getByText(/berangkat/i));
    
    // Check that the status dialog is opened
    expect(screen.getByText(/konfirmasi keberangkatan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /konfirmasi/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /batal/i })).toBeInTheDocument();
  });

  test('opens delete dialog when delete button is clicked', async () => {
    // Mock useSelector to return pickup data
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      // Create a mock state with pickup data
      const state = {
        pickup: {
          pickup: mockPickup,
          loading: false,
          error: null
        },
        auth: {
          currentUser: {
            nama: 'Test User',
            jabatan: 'Admin',
            email: 'test@example.com',
          }
        }
      };
      return selector(state);
    });
    
    render(<PickupDetailPage />);
    
    // Click the delete button
    fireEvent.click(screen.getByTestId('delete-button'));
    
    // Check that the delete dialog is opened
    expect(screen.getByText(/konfirmasi penghapusan/i)).toBeInTheDocument();
    expect(screen.getByText(/apakah anda yakin ingin menghapus pengambilan/i)).toBeInTheDocument();
    expect(screen.getByTestId('confirm-delete-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-delete-button')).toBeInTheDocument();
  });

  test('dispatches updatePickupStatus when status is confirmed', async () => {
    // Mock the updatePickupStatus action
    updatePickupStatus.mockReturnValue({
      type: 'pickup/updatePickupStatus/fulfilled',
      payload: { ...mockPickup, status: 'BERANGKAT' },
    });
    
    // Mock useDispatch to return a mock function we can track
    const mockDispatch = jest.fn();
    const { useDispatch } = require('react-redux');
    useDispatch.mockReturnValue(mockDispatch);
    
    // Mock useSelector to return pickup data
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      // Create a mock state with pickup data
      const state = {
        pickup: {
          pickup: mockPickup,
          loading: false,
          error: null
        },
        auth: {
          currentUser: {
            nama: 'Test User',
            jabatan: 'Admin',
            email: 'test@example.com',
          }
        }
      };
      return selector(state);
    });
    
    render(<PickupDetailPage />);
    
    // Click the status button
    fireEvent.click(screen.getByRole('button', { name: /ubah status/i }));
    
    // Click on a status option (e.g., Berangkat)
    fireEvent.click(screen.getByText(/berangkat/i));
    
    // Verify the dialog is open
    expect(screen.getByRole('button', { name: /konfirmasi/i })).toBeInTheDocument();
    
    // Click the confirm button
    fireEvent.click(screen.getByRole('button', { name: /konfirmasi/i }));
    
    // Check that updatePickupStatus was created with correct arguments
    expect(updatePickupStatus).toHaveBeenCalledWith({
      id: 'test-id',
      status: 'BERANGKAT',
      notes: '',
    });
    
    // Check that dispatch was called with the result of updatePickupStatus
    expect(mockDispatch).toHaveBeenCalled();
  });

  test('dispatches deletePickup when delete is confirmed', async () => {
    // Mock the deletePickup action
    deletePickup.mockImplementation(() => ({
      type: 'pickup/deletePickup/fulfilled',
      payload: 'test-id',
    }));
    
    // Mock useSelector to return pickup data
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      // Create a mock state with pickup data
      const state = {
        pickup: {
          pickup: mockPickup,
          loading: false,
          error: null
        },
        auth: {
          currentUser: {
            nama: 'Test User',
            jabatan: 'Admin',
            email: 'test@example.com',
          }
        }
      };
      return selector(state);
    });
    
    render(<PickupDetailPage />);
    
    // Click the delete button
    fireEvent.click(screen.getByTestId('delete-button'));
    
    // Click the confirm button
    fireEvent.click(screen.getByTestId('confirm-delete-button'));
    
    // Check that deletePickup was dispatched
    expect(deletePickup).toHaveBeenCalledWith('test-id');
  });
});