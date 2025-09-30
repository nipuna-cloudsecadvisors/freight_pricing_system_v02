import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'status-pending'
    case 'processing':
      return 'status-processing'
    case 'completed':
      return 'status-completed'
    case 'rejected':
      return 'status-rejected'
    case 'approved':
      return 'status-approved'
    case 'cancelled':
      return 'status-cancelled'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getRoleDisplayName(role: string) {
  switch (role) {
    case 'ADMIN':
      return 'Administrator'
    case 'SBU_HEAD':
      return 'SBU Head'
    case 'SALES':
      return 'Sales Person'
    case 'CSE':
      return 'Customer Service Executive'
    case 'PRICING':
      return 'Pricing Team'
    case 'MGMT':
      return 'Top Management'
    default:
      return role
  }
}
