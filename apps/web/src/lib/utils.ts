import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function getValidityStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'badge-green';
    case 'expiring':
      return 'badge-yellow';
    case 'expired':
      return 'badge-red';
    default:
      return 'badge-gray';
  }
}

export function getRoleDisplayName(role: string) {
  switch (role) {
    case 'ADMIN':
      return 'Administrator';
    case 'SBU_HEAD':
      return 'SBU Head';
    case 'SALES':
      return 'Sales Person';
    case 'CSE':
      return 'Customer Service Executive';
    case 'PRICING':
      return 'Pricing Team';
    case 'MGMT':
      return 'Management';
    default:
      return role;
  }
}