'use client'

import Link from 'next/link'

interface QuickActionsProps {
  userRole: string
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const getActionsForRole = (role: string) => {
    switch (role) {
      case 'SALES':
        return [
          { name: 'New Rate Request', href: '/rates/requests/new', icon: '📝' },
          { name: 'My Rate Requests', href: '/rates/requests?mine=true', icon: '📋' },
          { name: 'Predefined Rates', href: '/rates/predefined', icon: '💰' },
          { name: 'Create Booking', href: '/booking/new', icon: '🚢' },
          { name: 'My Itineraries', href: '/itineraries', icon: '🗓️' },
          { name: 'Sales Activities', href: '/activities', icon: '📊' },
        ]
      
      case 'PRICING':
        return [
          { name: 'Pending Requests', href: '/rates/requests?status=pending', icon: '⏳' },
          { name: 'Processing Requests', href: '/rates/requests?status=processing', icon: '⚙️' },
          { name: 'Manage Predefined Rates', href: '/rates/predefined', icon: '💰' },
          { name: 'Line Quotes', href: '/rates/quotes', icon: '📄' },
        ]
      
      case 'CSE':
        return [
          { name: 'RO Documents', href: '/booking/ro', icon: '📄' },
          { name: 'Open ERP Jobs', href: '/jobs/open', icon: '🔧' },
          { name: 'Complete Jobs', href: '/jobs/complete', icon: '✅' },
        ]
      
      case 'SBU_HEAD':
        return [
          { name: 'Approve Itineraries', href: '/itineraries/approve', icon: '✅' },
          { name: 'Team Reports', href: '/reports/team', icon: '📊' },
          { name: 'Dashboard', href: '/dashboard', icon: '📈' },
        ]
      
      case 'ADMIN':
        return [
          { name: 'User Management', href: '/admin/users', icon: '👥' },
          { name: 'Customer Approvals', href: '/customers?status=pending', icon: '✅' },
          { name: 'Master Data', href: '/admin/masters', icon: '⚙️' },
          { name: 'System Settings', href: '/admin/settings', icon: '🔧' },
        ]
      
      case 'MGMT':
        return [
          { name: 'Executive Dashboard', href: '/dashboard', icon: '📈' },
          { name: 'KPI Reports', href: '/reports/kpi', icon: '📊' },
          { name: 'Export Dashboard', href: '/dashboard/export', icon: '📤' },
        ]
      
      default:
        return []
    }
  }

  const actions = getActionsForRole(userRole)

  if (actions.length === 0) {
    return null
  }

  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">{action.icon}</span>
            <span className="text-sm font-medium text-gray-900">
              {action.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
