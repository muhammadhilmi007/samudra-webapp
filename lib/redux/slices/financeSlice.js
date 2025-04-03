// lib/redux/slices/financeSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { accountAPI, journalAPI, cashAPI, bankAPI } from "@/lib/api";

// Async thunks for accounts
export const fetchAccounts = createAsyncThunk(
  "finance/fetchAccounts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await accountAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data akun"
      );
    }
  }
);

export const fetchAccountById = createAsyncThunk(
  "finance/fetchAccountById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await accountAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data akun"
      );
    }
  }
);

export const createAccount = createAsyncThunk(
  "finance/createAccount",
  async (accountData, { rejectWithValue }) => {
    try {
      const response = await accountAPI.create(accountData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal membuat akun baru"
      );
    }
  }
);

export const updateAccount = createAsyncThunk(
  "finance/updateAccount",
  async ({ id, accountData }, { rejectWithValue }) => {
    try {
      const response = await accountAPI.update(id, accountData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal memperbarui akun"
      );
    }
  }
);

export const deleteAccount = createAsyncThunk(
  "finance/deleteAccount",
  async (id, { rejectWithValue }) => {
    try {
      await accountAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal menghapus akun"
      );
    }
  }
);

// Async thunks for journals
export const fetchJournals = createAsyncThunk(
  "finance/fetchJournals",
  async (_, { rejectWithValue }) => {
    try {
      const response = await journalAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data jurnal"
      );
    }
  }
);

export const fetchJournalById = createAsyncThunk(
  "finance/fetchJournalById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await journalAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data jurnal"
      );
    }
  }
);

export const createJournal = createAsyncThunk(
  "finance/createJournal",
  async (journalData, { rejectWithValue }) => {
    try {
      const response = await journalAPI.create(journalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal membuat jurnal baru"
      );
    }
  }
);

export const updateJournal = createAsyncThunk(
  "finance/updateJournal",
  async ({ id, journalData }, { rejectWithValue }) => {
    try {
      const response = await journalAPI.update(id, journalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal memperbarui jurnal"
      );
    }
  }
);

export const deleteJournal = createAsyncThunk(
  "finance/deleteJournal",
  async (id, { rejectWithValue }) => {
    try {
      await journalAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal menghapus jurnal"
      );
    }
  }
);

// Async thunks for cash transactions
export const fetchBranchCashTransactions = createAsyncThunk(
  "finance/fetchBranchCashTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cashAPI.getBranchTransactions();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data kas cabang"
      );
    }
  }
);

export const createBranchCashTransaction = createAsyncThunk(
  "finance/createBranchCashTransaction",
  async (cashData, { rejectWithValue }) => {
    try {
      const response = await cashAPI.createBranchTransaction(cashData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal membuat transaksi kas cabang"
      );
    }
  }
);

export const fetchHQCashTransactions = createAsyncThunk(
  "finance/fetchHQCashTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cashAPI.getHQTransactions();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data kas pusat"
      );
    }
  }
);

export const createHQCashTransaction = createAsyncThunk(
  "finance/createHQCashTransaction",
  async (cashData, { rejectWithValue }) => {
    try {
      const response = await cashAPI.createHQTransaction(cashData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal membuat transaksi kas pusat"
      );
    }
  }
);

// Async thunks for bank statements
export const fetchBankStatements = createAsyncThunk(
  "finance/fetchBankStatements",
  async (_, { rejectWithValue }) => {
    try {
      const response = await bankAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data mutasi bank"
      );
    }
  }
);

export const createBankStatement = createAsyncThunk(
  "finance/createBankStatement",
  async (bankData, { rejectWithValue }) => {
    try {
      const response = await bankAPI.create(bankData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal membuat mutasi bank"
      );
    }
  }
);

// Initial state
const initialState = {
  accounts: [],
  currentAccount: null,
  journals: [],
  currentJournal: null,
  branchCashTransactions: [],
  hqCashTransactions: [],
  bankStatements: [],
  loading: false,
  error: null,
  success: false,
};

// Finance slice
const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCurrentAccount: (state, action) => {
      state.currentAccount = action.payload;
    },
    clearCurrentAccount: (state) => {
      state.currentAccount = null;
    },
    setCurrentJournal: (state, action) => {
      state.currentJournal = action.payload;
    },
    clearCurrentJournal: (state) => {
      state.currentJournal = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch account by ID
      .addCase(fetchAccountById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAccount = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAccountById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create account
      .addCase(createAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts.push(action.payload.data);
        state.error = null;
        state.success = true;
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update account
      .addCase(updateAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = state.accounts.map((account) =>
          account._id === action.payload.data._id
            ? action.payload.data
            : account
        );
        state.currentAccount = action.payload.data;
        state.error = null;
        state.success = true;
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Delete account
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = state.accounts.filter(
          (account) => account._id !== action.payload
        );
        state.error = null;
        state.success = true;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Fetch all journals
      .addCase(fetchJournals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJournals.fulfilled, (state, action) => {
        state.loading = false;
        state.journals = action.payload.data;
        state.error = null;
      })
      .addCase(fetchJournals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch journal by ID
      .addCase(fetchJournalById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJournalById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJournal = action.payload.data;
        state.error = null;
      })
      .addCase(fetchJournalById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create journal
      .addCase(createJournal.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createJournal.fulfilled, (state, action) => {
        state.loading = false;
        state.journals.push(action.payload.data);
        state.error = null;
        state.success = true;
      })
      .addCase(createJournal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update journal
      .addCase(updateJournal.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateJournal.fulfilled, (state, action) => {
        state.loading = false;
        state.journals = state.journals.map((journal) =>
          journal._id === action.payload.data._id
            ? action.payload.data
            : journal
        );
        state.currentJournal = action.payload.data;
        state.error = null;
        state.success = true;
      })
      .addCase(updateJournal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Delete journal
      .addCase(deleteJournal.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteJournal.fulfilled, (state, action) => {
        state.loading = false;
        state.journals = state.journals.filter(
          (journal) => journal._id !== action.payload
        );
        state.error = null;
        state.success = true;
      })
      .addCase(deleteJournal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Fetch branch cash transactions
      .addCase(fetchBranchCashTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranchCashTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.branchCashTransactions = action.payload.data;
        state.error = null;
      })
      .addCase(fetchBranchCashTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create branch cash transaction
      .addCase(createBranchCashTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      // Create branch cash transaction
      .addCase(createBranchCashTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.branchCashTransactions.push(action.payload.data);
        state.error = null;
        state.success = true;
      })
      .addCase(createBranchCashTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Fetch HQ cash transactions
      .addCase(fetchHQCashTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHQCashTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.hqCashTransactions = action.payload.data;
        state.error = null;
      })
      .addCase(fetchHQCashTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create HQ cash transaction
      .addCase(createHQCashTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createHQCashTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.hqCashTransactions.push(action.payload.data);
        state.error = null;
        state.success = true;
      })
      .addCase(createHQCashTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Fetch bank statements
      .addCase(fetchBankStatements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBankStatements.fulfilled, (state, action) => {
        state.loading = false;
        state.bankStatements = action.payload.data;
        state.error = null;
      })
      .addCase(fetchBankStatements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create bank statement
      .addCase(createBankStatement.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBankStatement.fulfilled, (state, action) => {
        state.loading = false;
        state.bankStatements.push(action.payload.data);
        state.error = null;
        state.success = true;
      })
      .addCase(createBankStatement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentAccount,
  clearCurrentAccount,
  setCurrentJournal,
  clearCurrentJournal,
} = financeSlice.actions;

export default financeSlice.reducer;
