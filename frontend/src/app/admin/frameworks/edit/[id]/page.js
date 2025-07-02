// src/app/admin/frameworks/edit/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
// Import the shared components from the frameworks sub-directory
import CollapsibleSection from "@/components/frameworks/CollapsibleSection";
import BehaviorLevelsSection from "@/components/frameworks/BehaviorLevelsSection";
import StructureSection from "@/components/frameworks/StructureSection";

export default function EditFrameworkPage() {
  const params = useParams();
  const router = useRouter();
  const frameworkId = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Framework data state (aligned with shared components' expectations)
  const [frameworkName, setFrameworkName] = useState("");
  const [frameworkDesc, setFrameworkDesc] = useState("");
  const [levels, setLevels] = useState([]);
  const [steps, setSteps] = useState([]);
  const [originalFramework, setOriginalFramework] = useState(null); // To display current name/version in header

  useEffect(() => {
    fetchFramework();
  }, [frameworkId]);

  const fetchFramework = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/frameworks/${frameworkId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch framework');
      }

      const data = await response.json();
      
      // Populate the form with existing data from backend
      setOriginalFramework(data.framework);
      setFrameworkName(data.framework.name);
      setFrameworkDesc(data.framework.description || "");
      
      // Transform levels data from backend format to frontend state format
      setLevels(data.levels.map(level => ({
        id: level.id,
        name: level.name,
        points: level.points,
        color: level.color || "#3B82F6" // Use existing color or default
      })) || []);

// Transform steps and substeps data from backend format to frontend state format
setSteps((data.steps || []).map(step => ({
  id: step.id,
  name: step.name,
  position: step.position,
  subSteps: (step.substeps || []).map(substep => ({ // ✅ Changed from step.substeps to step.substeps (this was correct)
    id: substep.id,
    name: substep.name,
    position: substep.position,
    behaviors: (substep.behaviors || []).map(behavior => ({
      id: behavior.id,
      description: behavior.description,
      behavior_level_id: behavior.behavior_level_id || behavior.levelId 
    }))
  }))
})));

      console.log('Framework loaded for editing:', data);
    } catch (error) {
      console.error('Error fetching framework:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

//  Fix the transformDataForBackend function

const transformDataForBackend = () => {
  const transformedLevels = levels.map(level => ({
    id: level.id, // Preserve existing IDs for updates
    name: level.name,
    points: level.points,
    color: level.color // Send current color
  }));

  const transformedSteps = steps.map((step, index) => ({
    id: step.id, // Preserve existing IDs for updates
    name: step.name,
    position: index + 1, // Ensure position is correct on save
    // 🔥 KEY FIX: Frontend uses 'subSteps' (camelCase), backend expects 'substeps' (lowercase)
    substeps: (step.subSteps || []).map((substep, subIndex) => ({
      id: substep.id, // Preserve existing IDs for updates
      name: substep.name,
      position: subIndex + 1, // Ensure position is correct on save
      behaviors: (substep.behaviors || []).map(behavior => ({
        id: behavior.id, // Preserve existing IDs for updates
        description: behavior.description,
        behavior_level_id: behavior.behavior_level_id // Backend expects this
      }))
    }))
  }));

  return {
    name: frameworkName,
    description: frameworkDesc,
    levels: transformedLevels,
    steps: transformedSteps
  };
};

  const handleSave = async (saveAsNewVersion = false) => {
    setSaving(true);
    setError(null);

    try {
      const frameworkData = transformDataForBackend();
      
      let url = `http://localhost:5000/api/frameworks/${frameworkId}`;
      let method = 'PUT'; // Default for updating current version

      if (saveAsNewVersion) {
        url = `http://localhost:5000/api/frameworks`; // POST to create new framework
        method = 'POST';
      }

      console.log(`Sending framework data with method ${method} to ${url}:`, frameworkData);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(frameworkData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save framework');
      }

      const result = await response.json();
      console.log('Framework saved:', result);

      alert(saveAsNewVersion ? 'New version created successfully!' : 'Framework updated successfully!');
      
      router.push('/admin/frameworks');
      
    } catch (error) {
      console.error('Save error:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const canSave = frameworkName.trim() && levels.length > 0 && steps.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading framework...</div>
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
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <button 
              onClick={() => router.push('/admin/frameworks')}
              className="hover:text-blue-600"
            >
              Frameworks
            </button>
            <span>→</span>
            <span>Edit Framework</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 font-lato">
            Edit Framework: {originalFramework?.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Version {originalFramework?.version} • Make changes and save as update or new version
          </p>
        </div>

        {/* Framework Details Card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-8 overflow-hidden">
          <div className="px-6 py-4 bg-blue-800 text-white">
            <h2 className="text-xl font-semibold font-lato">Framework Details</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-lato">
                  Framework Name *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 transition-all duration-200 font-lato"
                  placeholder="e.g., SPIN Selling Framework"
                  value={frameworkName}
                  onChange={(e) => setFrameworkName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-lato">
                  Description (Optional)
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 transition-all duration-200 font-lato"
                  placeholder="Describe the purpose and scope of this framework"
                  rows={3}
                  value={frameworkDesc}
                  onChange={(e) => setFrameworkDesc(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Sections - Same as create page */}
        <CollapsibleSection
          title="Proficiency Levels"
          defaultOpen={true}
        >
          <BehaviorLevelsSection levels={levels} setLevels={setLevels} />
        </CollapsibleSection>

        <CollapsibleSection
          title="Framework Structure"
          defaultOpen={false}
        >
          <StructureSection steps={steps} setSteps={setSteps} levels={levels} />
        </CollapsibleSection>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8 p-6 bg-white rounded-lg border border-gray-200 shadow-lg">
          <div className="text-sm text-gray-600 font-lato">
            {!canSave && (
              <p>Complete framework name, proficiency levels, and at least one step to save.</p>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/admin/frameworks')}
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-lato font-medium transition-colors border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={!canSave || saving}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-lato font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 shadow-md ${
                canSave && !saving
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : 'Update Current Version'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={!canSave || saving}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-lato font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800 focus-visible:ring-offset-2 shadow-md ${
                canSave && !saving
                  ? 'bg-blue-800 text-white hover:bg-blue-900'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? 'Creating...' : 'Save as New Version'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}