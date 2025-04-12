// app/pengambilan/__tests__/edit.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import EditPickupPage from '../edit/[id]/page';
import pickupReducer, {
  fetchPickupById,
  updatePickup,
} from '@/lib/redux/slices/pickupSlice';
import customerReducer, {
  fetchCustomersByBranch,
} from '@/lib/redux/slices/customerSlice';
import vehicleReducer, {
  fetchVehiclesByBranch,
} from '@/lib/redux/slices/vehicleSlice';
import pegawaiReducer, {
  fetchEmployeesByBranch,
} from '@/lib/redux/slices/pegawaiSlice';

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

jest.mock('@/components/forms/pickup-form', () => ({
  PickupForm: ({ onSubmit, initialData, isLoading, error }) => (
    <div data-testid="mock-pickup-form">
      <div>Initial Data: {initialData ? initialData.noPengambilan : 'None'}</div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>Error: {error || 'None'}</div>
      <button onClick={() => onSubmit({ ...initialData, alamatPengambilan: 'Updated Address' })}>
        Submit Form
      </button>
    </div>
  ),
}));

// Mock the Redux actions
jest.mock('@/lib/redux/slices/pickupSlice', () => {
  const actual = jest.requireActual('@/lib/redux/slices/pickupSlice');
  return {
    ...actual,
    fetchPickupById: jest.fn(),
    updatePickup: jest.fn(),
  };
});

jest.mock('@/lib/redux/slices/customerSlice', () => {
  const actual = jest.requireActual('@/lib/redux/slices/customerSlice');
  return {
    ...actual,
    fetchCustomersByBranch: jest.fn(),
  };
});

jest.mock('@/lib/redux/slices/vehicleSlice', () => {
  const actual = jest.requireActual('@/lib/redux/slices/vehicleSlice');
  return {
    ...actual,
    fetchVehiclesByBranch: jest.fn(),
  };
});

jest.mock('@/lib/redux/slices/pegawaiSlice', () => {
  const actual = jest.requireActual('@/lib/redux/slices/pegawaiSlice');
  return {
    ...actual,
    fetchEmployeesByBranch: jest.fn(),
  };
});

// Mock the useSelector hook
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(() => jest.fn()),
}));

describe('EditPickupPage', () => {
  // Sample pickup data
  const mockPickup = {
    _id: 'test-id',
    noPengambilan: 'PU001',
    tanggal: '2023-01-01',
    pengirimId: 'sender-id',
    alamatPengambilan: 'Test Address',
    tujuan: 'Test Destination',
    jumlahColly: 5,
    supirId: 'driver-id',
    kendaraanId: 'vehicle-id',
    estimasiPengambilan: '2023-01-02T10:00:00',
    status: 'PENDING',
    notes: 'Test notes',
  };

  // Sample reference data
  const mockCustomers = [
    { _id: 'sender-id', nama: 'Test Sender', tipe: 'pengirim' },
    { _id: 'sender-id-2', nama: 'Test Sender 2', tipe: 'pengirim' },
  ];

  const mockVehicles = [
    { _id: 'vehicle-id', namaKendaraan: 'Test Vehicle', noPolisi: 'B 1234 CD', tipe: 'lansir' },
    { _id: 'vehicle-id-2', namaKendaraan: 'Test Vehicle 2', noPolisi: 'B 5678 EF', tipe: 'lansir' },
  ];

  const mockEmployees = [
    { _id: 'driver-id', nama: 'Test Driver', jabatan: 'supir' },
    { _id: 'helper-id', nama: 'Test Helper', jabatan: 'kenek' },
  ];

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
          error: null,
        },
        customer: {
          customers: mockCustomers,
          loading: false,
        },
        vehicle: {
          vehicles: mockVehicles,
          loading: false,
        },
        pegawai: {
          employeesByBranch: {
            'branch-id': mockEmployees,
          },
          loading: false,
        },
        auth: {
          currentUser: {
            _id: 'user-id',
            nama: 'Test User',
            jabatan: 'Admin',
            email: 'test@example.com',
            cabangId: 'branch-id',
          },
        }
      };
      return selector(state);
    });
    
    // Mock the Redux actions
    fetchPickupById.mockImplementation(() => ({
      type: 'pickup/fetchPickupById/fulfilled',
      payload: mockPickup,
    }));
    
    fetchCustomersByBranch.mockImplementation(() => ({
      type: 'customer/fetchCustomersByBranch/fulfilled',
      payload: mockCustomers,
    }));
    
    fetchVehiclesByBranch.mockImplementation(() => ({
      type: 'vehicle/fetchVehiclesByBranch/fulfilled',
      payload: mockVehicles,
    }));
    
    fetchEmployeesByBranch.mockImplementation(() => ({
      type: 'pegawai/fetchEmployeesByBranch/fulfilled',
      payload: {
        branchId: 'branch-id',
        employees: mockEmployees,
      },
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
          error: null,
        },
        customer: {
          customers: [],
          loading: false,
        },
        vehicle: {
          vehicles: [],
          loading: false,
        },
        pegawai: {
          employeesByBranch: {},
          loading: false,
        },
        auth: {
          currentUser: {
            _id: 'user-id',
            nama: 'Test User',
            jabatan: 'Admin',
            email: 'test@example.com',
            cabangId: 'branch-id',
          },
        }
      };
      return selector(state);
    });
    
    render(<EditPickupPage />);
    
    // Check that loading elements are rendered
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-breadcrumbs')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-pickup-form')).not.toBeInTheDocument();
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
          error: 'Pickup not found',
        },
        customer: {
          customers: [],
          loading: false,
        },
        vehicle: {
          vehicles: [],
          loading: false,
        },
        pegawai: {
          employeesByBranch: {},
          loading: false,
        },
        auth: {
          currentUser: {
            _id: 'user-id',
            nama: 'Test User',
            jabatan: 'Admin',
            email: 'test@example.com',
            cabangId: 'branch-id',
          },
        }
      };
      return selector(state);
    });
    
    render(<EditPickupPage />);
    
    // Check that error elements are rendered
    expect(screen.getByText(/pengambilan tidak ditemukan atau telah dihapus/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /kembali ke daftar pengambilan/i })).toBeInTheDocument();
  });

  test('renders pickup form with initial data', async () => {
    // Mock useSelector to return pickup data
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      // Create a mock state with pickup data
      const state = {
        pickup: {
          pickup: mockPickup,
          loading: false,
          error: null,
        },
        customer: {
          customers: mockCustomers,
          loading: false,
        },
        vehicle: {
          vehicles: mockVehicles,
          loading: false,
        },
        pegawai: {
          employeesByBranch: {
            'branch-id': mockEmployees,
          },
          loading: false,
        },
        auth: {
          currentUser: {
            _id: 'user-id',
            nama: 'Test User',
            jabatan: 'Admin',
            email: 'test@example.com',
            cabangId: 'branch-id',
          },
        }
      };
      return selector(state);
    });
    
    render(<EditPickupPage />);
    
    // Check that pickup form is rendered with initial data
    expect(screen.getByTestId('mock-pickup-form')).toBeInTheDocument();
    expect(screen.getByText(`Initial Data: ${mockPickup.noPengambilan}`)).toBeInTheDocument();
    expect(screen.getByText('Loading: No')).toBeInTheDocument();
    expect(screen.getByText('Error: None')).toBeInTheDocument();
  });

  test('dispatches updatePickup when form is submitted', async () => {
    // Mock the updatePickup action
    updatePickup.mockImplementation(() => ({
      type: 'pickup/updatePickup/fulfilled',
      payload: { ...mockPickup, alamatPengambilan: 'Updated Address' },
    }));
    
    // Mock useSelector to return pickup data
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      // Create a mock state with pickup data
      const state = {
        pickup: {
          pickup: mockPickup,
          loading: false,
          error: null,
        },
        customer: {
          customers: mockCustomers,
          loading: false,
        },
        vehicle: {
          vehicles: mockVehicles,
          loading: false,
        },
        pegawai: {
          employeesByBranch: {
            'branch-id': mockEmployees,
          },
          loading: false,
        },
        auth: {
          currentUser: {
            _id: 'user-id',
            nama: 'Test User',
            jabatan: 'Admin',
            email: 'test@example.com',
            cabangId: 'branch-id',
          },
        }
      };
      return selector(state);
    });
    
    render(<EditPickupPage />);
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit form/i }));
    
    // Check that updatePickup was dispatched
    expect(updatePickup).toHaveBeenCalledWith({
      id: 'test-id',
      data: {
        ...mockPickup,
        alamatPengambilan: 'Updated Address',
        userId: 'user-id',
      },
    });
  });

  test('shows warning for cancelled pickup', async () => {
    // Create a cancelled pickup
    const cancelledPickup = { ...mockPickup, status: 'CANCELLED' };
    
    // Mock useSelector to return cancelled pickup data
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      // Create a mock state with cancelled pickup data
      const state = {
        pickup: {
          pickup: cancelledPickup,
          loading: false,
          error: null,
        },
        customer: {
          customers: mockCustomers,
          loading: false,
        },
        vehicle: {
          vehicles: mockVehicles,
          loading: false,
        },
        pegawai: {
          employeesByBranch: {
            'branch-id': mockEmployees,
          },
          loading: false,
        },
        auth: {
          currentUser: {
            _id: 'user-id',
            nama: 'Test User',
            jabatan: 'Admin',
            email: 'test@example.com',
            cabangId: 'branch-id',
          },
        }
      };
      return selector(state);
    });
    
    render(<EditPickupPage />);
    
    // Check that warning is displayed
    expect(screen.getByText(/pengambilan ini telah dibatalkan/i)).toBeInTheDocument();
  });

  test('shows warning for completed pickup', async () => {
    // Create a completed pickup
    const completedPickup = { ...mockPickup, status: 'SELESAI' };
    
    // Mock useSelector to return completed pickup data
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      // Create a mock state with completed pickup data
      const state = {
        pickup: {
          pickup: completedPickup,
          loading: false,
          error: null,
        },
        customer: {
          customers: mockCustomers,
          loading: false,
        },
        vehicle: {
          vehicles: mockVehicles,
          loading: false,
        },
        pegawai: {
          employeesByBranch: {
            'branch-id': mockEmployees,
          },
          loading: false,
        },
        auth: {
          currentUser: {
            _id: 'user-id',
            nama: 'Test User',
            jabatan: 'Admin',
            email: 'test@example.com',
            cabangId: 'branch-id',
          },
        }
      };
      return selector(state);
    });
    
    render(<EditPickupPage />);
    
    // Check that warning is displayed
    expect(screen.getByText(/pengambilan ini telah selesai/i)).toBeInTheDocument();
  });
});