'use client';

/**
 * Admin Dashboard Component
 * 
 * Overview dashboard with key metrics and statistics
 */

import { useEffect, useState } from 'react';
import { 
  Users, 
  ClipboardList, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';

interface DashboardStats {
  total_users: number;
  active_users: number;
  total_tasks: number;
  active_tasks: number;
  completed_tasks: number;
  total_revenue: number;
  pending_disputes: number;
  platform_fee_collected: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      change: '+12%',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Active Tasks',
      value: stats?.active_tasks || 0,
      change: '+8%',
      icon: ClipboardList,
      color: 'green',
    },
    {
      title: 'Total Revenue',
      value: `NPR ${(stats?.total_revenue || 0).toLocaleString()}`,
      change: '+23%',
      icon: DollarSign,
      color: 'purple',
    },
    {
      title: 'Pending Disputes',
      value: stats?.pending_disputes || 0,
      change: '-5%',
      icon: AlertTriangle,
      color: 'red',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-gray-700">Pending</span>
              </div>
              <span className="font-semibold text-gray-900">
                {stats?.active_tasks || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">In Progress</span>
              </div>
              <span className="font-semibold text-gray-900">
                {Math.floor((stats?.active_tasks || 0) * 0.6)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">Completed</span>
              </div>
              <span className="font-semibold text-gray-900">
                {stats?.completed_tasks || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Platform Fees</span>
              <span className="font-semibold text-gray-900">
                NPR {(stats?.platform_fee_collected || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Total Transactions</span>
              <span className="font-semibold text-gray-900">
                NPR {(stats?.total_revenue || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Average Task Value</span>
              <span className="font-semibold text-gray-900">
                NPR {stats?.completed_tasks 
                  ? Math.round((stats.total_revenue || 0) / stats.completed_tasks).toLocaleString()
                  : 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New user registered</p>
              <p className="text-xs text-gray-500">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New task posted</p>
              <p className="text-xs text-gray-500">15 minutes ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Payment completed</p>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
