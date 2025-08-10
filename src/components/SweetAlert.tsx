'use client';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const ReactSwal = withReactContent(Swal);

interface AlertOptions {
  title?: string;
  text?: string;
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  timer?: number;
}

export const showAlert = async (options: AlertOptions) => {
  return await ReactSwal.fire({
    ...options,
    background: '#ffffff',
    confirmButtonColor: '#4f46e5', // brand-500
    cancelButtonColor: '#ef4444', // red-500
  });
};

export const showConfirmation = async (options: AlertOptions) => {
  return await showAlert({
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    ...options,
  });
};

export const showSuccess = async (message: string, title = 'Success!') => {
  return await showAlert({
    title,
    text: message,
    icon: 'success',
    timer: 2000,
  });
};

export const showError = async (message: string, title = 'Error!') => {
  return await showAlert({
    title,
    text: message,
    icon: 'error',
  });
};

export const showLoading = (title = 'Loading...') => {
  ReactSwal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      ReactSwal.showLoading();
    },
  });
  return ReactSwal;
};

export const closeAlert = () => {
  ReactSwal.close();
};