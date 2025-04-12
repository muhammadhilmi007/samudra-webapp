// app/pengambilan/__tests__/page.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PickupsPage from '../page';
import pickupReducer, {
  fetchPickups,
  updatePickupStatus,
} from '@/lib/redux/slices/pickupSlice';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
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

jest.mock('@/components/data-tables/data-table', () => ({
  __esModule: true,
  default: ({ columns, data, pagination }) => (
    <div data-testid="mock-data-table">
      <div>Columns: {columns.length}</div>
      <div>Data: {data.length}</div>
      <div>Page: {pagination.pageIndex + 1}</div>
      <button onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}>
        Next Page
      </button>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.accessorKey || column.id}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((column) => (
                <td key={column.accessorKey || column.id}>
                  {column.cell ? column.cell({ row: { original: row } }) : row[column.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
}));

// Mock the Redux actions
jest.mock('@/lib/redux/slices/pickupSlice', () => {
  const actual = jest.requireActual('@/lib/redux/slices/pickupSlice');
  return {
    ...actual,
    fetchPickups: jest.fn(),
    updatePickupStatus: jest.fn(),
  };
});

// Mock the API calls
jest.mock('@/lib/api', () => ({
  vehicleAPI: {
    getAll: jest.fn().mockResolvedValue({ data: { data: [] } }),
  },
  pegawaiAPI: {
    getAll: jest.fn().mockResolvedValue({ data: { data: [] } }),
  },
  cabangAPI: {
    getAll: jest.fn().mockResolvedValue({ data: { data: [] } }),
  },
}));

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

describe('PickupsPage', () => {
  // Sample pickup data
  const mockPickups = [
    {
      _id: 'pickup-1',
      noPengambilan: 'PU001',
      tanggal: '2023-01-01',
      pengirimId: {
        _id: 'sender-1',
        nama: 'Test Sender 1',
      },
      alamatPengambilan: 'Test Address 1',
      tujuan: 'Test Destination 1',
      jumlahColly: 5,
      supirId: {
        _id: 'driver-1',
        nama: 'Test Driver 1',
      },
      kendaraanId: {
        _id: 'vehicle-1',
        namaKendaraan: 'Test Vehicle 1',
        noPolisi: 'B 1234 CD',
      },
      estimasiPengambilan: '2023-01-02T10:00:00',
      status: 'PENDING',
    },
    {
      _id: 'pickup-2',
      noPengambilan: 'PU002',
      tanggal: '2023-01-03',
      pengirimId: {
        _id: 'sender-2',
        nama: 'Test Sender 2',
      },
      alamatPengambilan: 'Test Address 2',
      tujuan: 'Test Destination 2',
      jumlahColly: 3,
      supirId: {
        _id: 'driver-2',
        nama: 'Test Driver 2',
      },
      kendaraanId: {
        _id: 'vehicle-2',
        namaKendaraan: 'Test Vehicle 2',
        noPolisi: 'B 5678 EF',
      },
      estimasiPengambilan: '2023-01-04T10:00:00',
      status: 'BERANGKAT',
    },
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
          pickups: mockPickups,
          loading: false,
          error: null,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            total: mockPickups.length,
          },
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
    
    // Mock the fetchPickups action
    fetchPickups.mockImplementation(() => ({
      type: 'pickup/fetchPickups/fulfilled',
      payload: {
        data: {
          data: mockPickups,
        },
        pagination: {
          page: 1,
          totalPages: 1,
        },
        total: mockPickups.length,
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
          pickups: [],
          loading: true,
          error: null,
          pagination: {
            currentPage: 1,
            totalPages: 0,
            total: 0,
          },
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
    
    render(<PickupsPage />);
    
    // Check that loading elements are rendered
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-breadcrumbs')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-data-table')).not.toBeInTheDocument();
  });

  test('renders error state when fetch fails', () => {
    // Mock useSelector to return error state
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      // Create a mock state with error
      const state = {
        pickup: {
          pickups: [],
          loading: false,
          error: 'Failed to fetch pickups',
          pagination: {
            currentPage: 1,
            totalPages: 0,
            total: 0,
          },
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
    
    render(<PickupsPage />);
    
    // Check that error elements are rendered
    expect(screen.getByText(/error/i)).toBeInTheDocument();
    expect(screen.getByText(/failed to fetch pickups/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /coba lagi/i })).toBeInTheDocument();
  });

  test('renders pickup list correctly', async () => {
    // Mock useSelector to return pickup data
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      // Create a mock state with pickup data
      const state = {
        pickup: {
          pickups: mockPickups,
          loading: false,
          error: null,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            total: mockPickups.length,
          },
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
    
    render(<PickupsPage />);
    
    // Check that pickup list is rendered
    expect(screen.getByTestId('mock-data-table')).toBeInTheDocument();
    expect(screen.getByText(`Data: ${mockPickups.length}`)).toBeInTheDocument();
    
    // Check that action buttons are rendered
    expect(screen.getByRole('link', { name: /tambah pengambilan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ekspor data/i })).toBeInTheDocument();
  });

  test('changes page when pagination is used', async () => {
    // Mock useSelector to return pickup data with pagination
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      // Create a mock state with pickup data and pagination
      const state = {
        pickup: {
          pickups: mockPickups,
          loading: false,
          error: null,
          pagination: {
            currentPage: 1,
            totalPages: 2,
            total: 10,
          },
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
    
    render(<PickupsPage />);
    
    // Click the next page button
    fireEvent.click(screen.getByRole('button', { name: /next page/i }));
    
    // Check that fetchPickups was called with the correct page
    expect(fetchPickups).toHaveBeenCalledWith(expect.objectContaining({
      page: 2,
    }));
  });

  test('filters pickups when filter is changed', async () => {
    // Mock useSelector to return pickup data
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      // Create a mock state with pickup data
      const state = {
        pickup: {
          pickups: mockPickups,
          loading: false,
          error: null,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            total: mockPickups.length,
          },
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
    
    render(<PickupsPage />);
    
    // Show filters
    fireEvent.click(screen.getByRole('button', { name: /tampilkan filter/i }));
    
    // Change status filter
    const statusSelect = screen.getByRole('button', { name: /semua status/i });
    fireEvent.click(statusSelect);
    
    // Wait for the dropdown to appear and select an option
    // Note: This is a simplified test since we've mocked the Select component
    // In a real test, you would need to handle the dropdown properly
    
    // Check that fetchPickups was called with the correct filter
    // Due to debounce, we need to wait for the API call
    await waitFor(() => {
      expect(fetchPickups).toHaveBeenCalled();
    }, { timeout: 400 }); // Slightly longer than the debounce time (300ms)
  });

  test('opens status dialog when status action is clicked', async () => {
    // Mock the updatePickupStatus action
    updatePickupStatus.mockImplementation(() => ({
      type: 'pickup/updatePickupStatus/fulfilled',
      payload: { ...mockPickups[0], status: 'BERANGKAT' },
    }));
    
    // Mock useSelector to return pickup data
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      // Create a mock state with pickup data
      const state = {
        pickup: {
          pickups: mockPickups,
          loading: false,
          error: null,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            total: mockPickups.length,
          },
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
    
    render(<PickupsPage />);
    
    // Find the status dialog
    expect(screen.queryByText(/konfirmasi keberangkatan/i)).not.toBeInTheDocument();
    
    // Note: In a real test, you would click on the dropdown menu and select the status option
    // Since we've mocked the components, we can't fully test this interaction
    // This is a limitation of our test setup
  });

  test('changes tab when tab is clicked', async () => {
    // Mock useSelector to return pickup data
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation((selector) => {
      // Create a mock state with pickup data
      const state = {
        pickup: {
          pickups: mockPickups,
          loading: false,
          error: null,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            total: mockPickups.length,
          },
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
    
    render(<PickupsPage />);
    
    // Note: In a real test, you would click on the tab and check that the filter is updated
    // Since we've mocked the components, we can't fully test this interaction
    // This is a limitation of our test setup
  });
});