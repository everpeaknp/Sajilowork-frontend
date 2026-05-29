'use client';

/**
 * Admin Dashboard Main Page
 * 
 * Main admin dashboard with overview and navigation
 * Features:
 * - Platform statistics
 * - User management
 * - Task moderation
 * - Dispute resolution
 * - Analytics
 */

import { useState } from 'react';
import { Dashboard } from '@/components/admin/Dashboard';
import { UserManagement } from '@/components/admin/UserManagement';
import { TaskModeration } from '@/components/admin/TaskModeration';
import { DisputeResolution } from '@/components/admin/DisputeResolution';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  AlertTriangle,
  BarChart3,
  Settings
} from 'lucide-react';

type AdminTab = 'dashboard' | 'users' | 'tasks' | 'disputes' | 'analytics' | 'settings';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users' as AdminTab, label: 'Users', icon: Users },
    { id: 'tasks' as AdminTab, label: 'Tasks', icon: ClipboardList },
    { id: 'disputes' as AdminTab, label: 'Disputes', icon: AlertTriangle },
    { id: 'analytics' as AdminTab, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, Admin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'tasks' && <TaskModeration />}
        {activeTab === 'disputes' && <DisputeResolution />}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analytics Coming Soon
            </h3>
            <p className="text-gray-600">
              Advanced analytics and reporting features will be available here.
            </p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Settings Coming Soon
            </h3>
            <p className="text-gray-600">
              Platform settings and configuration options will be available here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
