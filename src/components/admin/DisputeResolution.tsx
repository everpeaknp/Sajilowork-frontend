'use client';

/**
 * Dispute Resolution Component
 * 
 * Admin interface for managing and resolving disputes
 * Features:
 * - View all disputes
 * - Filter by status
 * - View dispute details
 * - Resolve disputes with actions
 * - Add admin notes
 */

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Eye, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Clock,
  User,
  FileText
} from 'lucide-react';

interface Dispute {
  id: string;
  task: {
    id: string;
    title: string;
  };
  complainant: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  respondent: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  dispute_type: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  resolved_at?: string;
  resolution?: string;
  admin_notes?: string;
}

export function DisputeResolution() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('open');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [resolution, setResolution] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionType, setActionType] = useState<'resolve' | 'reject' | null>(null);

  useEffect(() => {
    fetchDisputes();
  }, [filter]);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/disputes/?status=${filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDisputes(data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setResolution(dispute.resolution || '');
    setAdminNotes(dispute.admin_notes || '');
    setShowModal(true);
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute || !resolution) return;

    try {
      const response = await fetch(`/api/admin/disputes/${selectedDispute.id}/resolve/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolution,
          admin_notes: adminNotes,
          action: actionType,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setSelectedDispute(null);
        setResolution('');
        setAdminNotes('');
        setActionType(null);
        fetchDisputes();
      }
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'investigating': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Dispute Resolution</h2>
        
        {/* Filters */}
        <div className="flex gap-2">
          {['open', 'investigating', 'resolved', 'closed', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Disputes List */}
      <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : disputes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p>No disputes found</p>
          </div>
        ) : (
          disputes.map((dispute) => (
            <div key={dispute.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Dispute Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                      {dispute.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                      {dispute.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(dispute.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Task Info */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {dispute.task.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {dispute.description}
                  </p>

                  {/* Parties */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Complainant: {dispute.complainant.first_name} {dispute.complainant.last_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Respondent: {dispute.respondent.first_name} {dispute.respondent.last_name}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleViewDetails(dispute)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dispute Details Modal */}
      {showModal && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Dispute Details</h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedDispute(null);
                    setResolution('');
                    setAdminNotes('');
                    setActionType(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status and Priority */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedDispute.priority)}`}>
                  {selectedDispute.priority} priority
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedDispute.status)}`}>
                  {selectedDispute.status}
                </span>
              </div>

              {/* Task Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Task</h4>
                <p className="text-gray-700">{selectedDispute.task.title}</p>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Complainant</h4>
                  <p className="text-gray-700">
                    {selectedDispute.complainant.first_name} {selectedDispute.complainant.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{selectedDispute.complainant.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Respondent</h4>
                  <p className="text-gray-700">
                    {selectedDispute.respondent.first_name} {selectedDispute.respondent.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{selectedDispute.respondent.email}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedDispute.description}</p>
              </div>

              {/* Resolution Form (if not resolved) */}
              {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'closed' && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Resolution
                    </label>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter resolution details..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Admin Notes (Internal)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Add internal notes..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setActionType('resolve');
                        handleResolveDispute();
                      }}
                      disabled={!resolution}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Resolve in Favor
                    </button>
                    <button
                      onClick={() => {
                        setActionType('reject');
                        handleResolveDispute();
                      }}
                      disabled={!resolution}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject Dispute
                    </button>
                  </div>
                </div>
              )}

              {/* Existing Resolution (if resolved) */}
              {(selectedDispute.status === 'resolved' || selectedDispute.status === 'closed') && selectedDispute.resolution && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Resolution</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedDispute.resolution}</p>
                  {selectedDispute.resolved_at && (
                    <p className="text-sm text-gray-500 mt-2">
                      Resolved on {new Date(selectedDispute.resolved_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Admin Notes (if exist) */}
              {selectedDispute.admin_notes && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Admin Notes</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedDispute.admin_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
