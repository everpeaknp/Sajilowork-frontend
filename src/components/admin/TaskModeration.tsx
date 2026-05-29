'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye } from 'lucide-react';

export function TaskModeration() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/admin/tasks/?status=${filter}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (taskId: string) => {
    try {
      await fetch(`/api/admin/tasks/${taskId}/approve/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
      });
      fetchTasks();
    } catch (error) {
      console.error('Failed to approve task:', error);
    }
  };

  const handleReject = async (taskId: string) => {
    try {
      await fetch(`/api/admin/tasks/${taskId}/reject/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
      });
      fetchTasks();
    } catch (error) {
      console.error('Failed to reject task:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Task Moderation</h2>
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
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

      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No tasks found</div>
        ) : (
          tasks.map((task: any) => (
            <div key={task.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Budget: NPR {task.budget?.toLocaleString()}</span>
                    <span>•</span>
                    <span>Posted by: {task.owner?.first_name} {task.owner?.last_name}</span>
                    <span>•</span>
                    <span>{new Date(task.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => window.open(`/task/${task.slug || task.id}`, '_blank')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    title="View Task"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  {task.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(task.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(task.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
