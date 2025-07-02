"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Eye, Clock, CheckCircle } from "lucide-react";

export default function FrameworksPage() {
  const router = useRouter();
  const [frameworks, setFrameworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Hard-coded tenant ID for pilot phase
  const tenantId = 'cd663ebb-a679-4841-88b0-afe1eb13bec8';

  useEffect(() => {
    fetchFrameworks();
  }, []);

  const fetchFrameworks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/frameworks/tenant/${tenantId}/list`);
      if (!response.ok) {
        throw new Error('Failed to fetch frameworks');
      }
      const data = await response.json();
      setFrameworks(data);
    } catch (error) {
      console.error('Error fetching frameworks:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading frameworks...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-lato">Manage Frameworks</h1>
            <p className="text-gray-600 mt-2 font-lato">
              Manage your sales coaching frameworks and versions
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/frameworks/create')}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-lato font-medium transition-colors bg-blue-800 text-white hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800 focus-visible:ring-offset-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Create New Framework
          </button>
        </div>

        {/* Frameworks List */}
        {frameworks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 font-lato">No frameworks yet</h3>
            <p className="text-gray-500 mb-4 font-lato">
              Get started by creating your first sales framework
            </p>
            <button
              onClick={() => router.push('/admin/frameworks/create')}
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-lato font-medium transition-colors bg-blue-800 text-white hover:bg-blue-900"
            >
              <Plus className="w-4 h-4" />
              Create Framework
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {frameworks.map((framework) => (
              <div key={framework.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 font-lato">
                        {framework.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        v{framework.version}
                      </span>
                      {framework.is_active && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </div>
                    {framework.description && (
                      <p className="text-gray-600 mb-3 font-lato">{framework.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Created {formatDate(framework.created_at)}
                      </span>
                      {framework.total_steps && (
                        <span>{framework.total_steps} steps</span>
                      )}
                      {framework.total_behaviors && (
                        <span>{framework.total_behaviors} behaviors</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/admin/frameworks/view/${framework.id}`)}
                      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-lato font-medium transition-colors border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/admin/frameworks/edit/${framework.id}`)}
                      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-lato font-medium transition-colors bg-orange-500 text-white hover:bg-orange-600"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}