// jest.setup.js
import '@testing-library/jest-dom';

// Mock the next/router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useParams: () => ({}),
  usePathname: () => '',
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    forEach: jest.fn(),
    entries: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
  }),
}));

// Mock the next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock the UI components
jest.mock('@/components/ui/button', () => ({
  __esModule: true,
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  buttonVariants: jest.fn(() => 'button-variants-mock'),
}));

jest.mock('@/components/ui/dialog', () => ({
  __esModule: true,
  Dialog: ({ children }) => <div>{children}</div>,
  DialogTrigger: ({ children }) => <div>{children}</div>,
  DialogContent: ({ children }) => <div>{children}</div>,
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <div>{children}</div>,
  DialogDescription: ({ children }) => <div>{children}</div>,
  DialogFooter: ({ children }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  __esModule: true,
  DropdownMenu: ({ children }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <div>Separator</div>,
}));

jest.mock('@/lib/utils', () => ({
  __esModule: true,
  cn: jest.fn((...args) => args.filter(Boolean).join(' ')),
  formatDate: jest.fn((date) => date ? 'Formatted Date' : '-'),
  formatDateTime: jest.fn((date) => date ? 'Formatted DateTime' : '-'),
  formatCurrency: jest.fn((amount) => amount ? 'Rp 100.000' : 'Rp -'),
  formatNumber: jest.fn((num) => num ? '100.000' : '-'),
  getInitials: jest.fn((name) => name ? 'AB' : '--'),
  truncateText: jest.fn((text) => text ? text.substring(0, 10) + '...' : ''),
  isValidPhoneNumber: jest.fn(() => true),
  snakeToTitleCase: jest.fn((text) => text ? 'Title Case' : ''),
  parseQueryParam: jest.fn((param) => param),
  buildQueryParams: jest.fn((params) => params),
  sleep: jest.fn(() => Promise.resolve()),
  generateId: jest.fn(() => 'abc123'),
  downloadBlob: jest.fn(),
  truncateString: jest.fn((str) => str ? str.substring(0, 10) + '...' : ''),
  shortId: jest.fn(() => 'ABC123'),
  stringToColor: jest.fn(() => '#123456'),
  formatPhoneNumber: jest.fn(() => '0812 3456 7890'),
  toSlug: jest.fn(() => 'slug-text'),
  getErrorMessage: jest.fn(() => 'Error message'),
  getStatusLabel: jest.fn(() => 'Status Label'),
  debounce: jest.fn((fn) => fn),
  getStatusColor: jest.fn(() => 'bg-blue-100 text-blue-800'),
}));

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
      args[0].includes('Warning: React.createElement') ||
      args[0].includes('Warning: React does not recognize'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});