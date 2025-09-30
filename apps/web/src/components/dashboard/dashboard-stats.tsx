'use client'

interface DashboardStatsProps {
  data: any
}

export function DashboardStats({ data }: DashboardStatsProps) {
  const stats = [
    {
      name: 'Total Rate Requests',
      value: data?.totalRateRequests || 0,
      color: 'bg-primary-500',
    },
    {
      name: 'Total Customers',
      value: data?.totalCustomers || 0,
      color: 'bg-success-500',
    },
    {
      name: 'Total Bookings',
      value: data?.totalBookings || 0,
      color: 'bg-warning-500',
    },
  ]

  // Add role-specific stats
  if (data?.myRateRequests !== undefined) {
    stats.push({
      name: 'My Rate Requests',
      value: data.myRateRequests,
      color: 'bg-purple-500',
    })
  }

  if (data?.pendingRateRequests !== undefined) {
    stats.push({
      name: 'Pending Requests',
      value: data.pendingRateRequests,
      color: 'bg-orange-500',
    })
  }

  if (data?.pendingCustomerApprovals !== undefined) {
    stats.push({
      name: 'Pending Approvals',
      value: data.pendingCustomerApprovals,
      color: 'bg-red-500',
    })
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.name} className="card">
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-md ${stat.color}`}>
              <div className="w-6 h-6 text-white">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stat.value}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
