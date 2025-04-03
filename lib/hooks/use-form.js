"use client";

import { useState, useCallback } from 'react';
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from './use-toast';

export function useForm(options = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const { toast } = useToast();
  
  // Setup React Hook Form
  const form = useReactHookForm({
    ...options,
    resolver: options.schema ? zodResolver(options.schema) : undefined,
  });
  
  // Handle form submission
  const handleSubmit = useCallback(
    async (submitHandler, errorHandler) => {
      return form.handleSubmit(async (data) => {
        setIsSubmitting(true);
        setServerErrors({});
        
        try {
          await submitHandler(data);
          
          if (options.showSuccessToast) {
            toast({
              title: options.successTitle || 'Berhasil',
              description: options.successMessage || 'Data berhasil disimpan',
              variant: 'success',
            });
          }
        } catch (error) {
          // Check if error contains field-specific validation errors
          if (error?.response?.data?.errors && typeof error.response.data.errors === 'object') {
            const fieldErrors = error.response.data.errors;
            setServerErrors(fieldErrors);
            
            // Register field errors with React Hook Form
            Object.entries(fieldErrors).forEach(([field, message]) => {
              form.setError(field, { type: 'server', message });
            });
          } else {
            // Show general error toast
            const errorMessage = error?.response?.data?.message || error.message || 'Terjadi kesalahan';
            
            if (options.showErrorToast !== false) {
              toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
              });
            }
          }
          
          if (errorHandler) {
            errorHandler(error);
          }
        } finally {
          setIsSubmitting(false);
        }
      })();
    },
    [form, options, toast]
  );
  
  return {
    form,
    isSubmitting,
    serverErrors,
    handleSubmit,
    register: form.register,
    formState: form.formState,
    setValue: form.setValue,
    getValues: form.getValues,
    reset: form.reset,
    watch: form.watch,
    control: form.control,
  };
}