"use client";

import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { useToast } from './use-toast';
import { getErrorMessage } from '@/lib/utils';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  
  const request = useCallback(async (
    apiFunc, 
    options = { 
      showSuccessToast: false,
      showErrorToast: true,
      successMessage: 'Operasi berhasil',
      errorMessage: 'Terjadi kesalahan',
      onSuccess: null,
      onError: null,
    }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFunc();
      
      if (options.showSuccessToast) {
        toast({
          title: 'Berhasil',
          description: options.successMessage,
          variant: 'success',
        });
      }
      
      if (options.onSuccess) {
        options.onSuccess(response.data);
      }
      
      setLoading(false);
      return response.data;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      
      if (options.showErrorToast) {
        toast({
          title: 'Error',
          description: options.errorMessage || errorMsg,
          variant: 'destructive',
        });
      }
      
      if (options.onError) {
        options.onError(err);
      }
      
      setLoading(false);
      throw err;
    }
  }, [toast]);
  
  return {
    loading,
    error,
    request,
    setError,
    clearError: () => setError(null),
  };
}