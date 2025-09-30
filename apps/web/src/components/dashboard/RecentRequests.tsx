'use client'

import Link from 'next/link'
import { format } from 'date-fns'

interface RecentRequestsProps {
  data?: Array<{
    id: string
    refNo: string
    status: string
    createdAt: string
    customer: {
      companyName: string
    }
  }>
}

export function RecentRequests({ data }: RecentRequestsProps) {
  if (!data) {
    return (
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Rate Requests</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending'
      case 'processing':
        return 'status-processing'
      case 'completed':
        return 'status-completed'
      case 'rejected':
        return 'status-rejected'
      default:
        return 'status-pending'
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Recent Rate Requests</h3>
        <Link href="/rate-requests" className="text-sm text-primary-600 hover:text-primary-500">
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {data.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent requests</p>
        ) : (
          data.map((request) => (
            <div key={request.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{request.refNo}</p>
                <p className="text-sm text-gray-500">{request.customer.companyName}</p>
                <p className="text-xs text-gray-400">
                  {format(new Date(request.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              <span className={`status-badge ${getStatusColor(request.status)}`}>
                {request.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}