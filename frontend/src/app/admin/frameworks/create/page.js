// src/app/admin/frameworks/create/page.js
"use client";

import { useState } from "react";
// Import the shared components from the frameworks sub-directory
import CollapsibleSection from "@/components/frameworks/CollapsibleSection";
import BehaviorLevelsSection from "@/components/frameworks/BehaviorLevelsSection";
import StructureSection from "@/components/frameworks/StructureSection";

// Main Component
export default function FrameworkCreationPage() {
  const [frameworkName, setFrameworkName] = useState("");
  const [frameworkDesc, setFrameworkDesc] = useState("");
  const [levels, setLevels] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Transform data to match backend expectations
      // Assuming backend assigns IDs for new entities,
      // so we might filter out frontend-generated IDs (like Date.now())
      // or ensure the backend can handle them for updates.
      // For creation, typically backend generates IDs.
      const transformedLevels = levels.map(level => ({
        // id: level.id, // Omit ID for new creations if backend assigns it
        name: level.name,
        points: level.points,
        color: level.color
      }));

      const transformedSteps = steps.map((step, index) => ({
        // id: step.id, // Omit ID for new creations if backend assigns it
        name: step.name,
        position: index + 1,
        // Frontend uses 'subSteps', backend expects 'substeps'
        substeps: (step.subSteps || []).map((substep, subIndex) => ({
          // id: substep.id, // Omit ID for new creations if backend assigns it
          name: substep.name,
          position: subIndex + 1,
          behaviors: (substep.behaviors || []).map(behavior => ({
            // id: behavior.id, // Omit ID for new creations if backend assigns it
            description: behavior.description,
            behavior_level_id: behavior.behavior_level_id // Backend expects this
          }))
        }))
      }));

      const frameworkData = {
        name: frameworkName,
        description: frameworkDesc,
        levels: transformedLevels,
        steps: transformedSteps
      };

      console.log('Sending framework data for creation:', frameworkData);

      const response = await fetch('http://localhost:5000/api/frameworks', {
        method: 'POST', // Use POST for creating new frameworks
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(frameworkData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save framework');
      }

      const savedFramework = await response.json();
      console.log('Framework saved successfully:', savedFramework);

      alert('Framework saved successfully!');
      
      // Redirect to the framework list page after successful creation
      // import { useRouter } from "next/navigation"; (add this import if you uncomment the line below)
      // router.push('/admin/frameworks');
      
    } catch (error) {
      console.error('Save error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const canSave = frameworkName.trim() && levels.length > 0 && steps.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Collapsible Sections */}
        <CollapsibleSection title="Proficiency Levels" defaultOpen={true}>
          {/* Moved the intro text from here into BehaviorLevelsSection for encapsulation */}
          <BehaviorLevelsSection levels={levels} setLevels={setLevels} />
        </CollapsibleSection>

        <CollapsibleSection title="Framework Structure" defaultOpen={false}>
          {/* Moved the intro text from here into StructureSection for encapsulation */}
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
            <button className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-lato font-medium transition-colors border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave || loading}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-lato font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800 focus-visible:ring-offset-2 shadow-md ${
                canSave && !loading
                  ? 'bg-blue-800 text-white hover:bg-blue-900'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? 'Saving...' : 'Save Framework'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}