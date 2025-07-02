"use client";

import { useState } from "react";
import CollapsibleSection from "@/components/frameworks/CollapsibleSection";
import BehaviorLevelsSection from "@/components/BehaviorLevelsSection";
import StructureSection from "@/components/StructureSection";

export default function FrameworkCreationPage() {
  const [frameworkName, setFrameworkName] = useState("");
  const [frameworkDesc, setFrameworkDesc] = useState("");
  const [levels, setLevels] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Transform data to match backend expectations
  const transformDataForBackend = () => {
    const transformedLevels = levels.map(level => ({
      id: level.id,
      name: level.name,
      points: level.points,
      color: "#3B82F6" // Default color since your component doesn't use colors
    }));

    const transformedSteps = steps.map((step, index) => ({
      id: step.id,
      name: step.name,
      position: index + 1,
      subSteps: step.substeps.map((substep, subIndex) => ({
        id: substep.id,
        name: substep.name,
        position: subIndex + 1,
        behaviors: substep.behaviors.map(behavior => ({
          id: behavior.id,
          description: behavior.description,
          behavior_level_id: behavior.levelId
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

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const frameworkData = transformDataForBackend();
      console.log('Sending framework data:', frameworkData);

      const response = await fetch('http://localhost:5000/api/frameworks', {
        method: 'POST',
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
      
      // Reset form or redirect
      setFrameworkName("");
      setFrameworkDesc("");
      setLevels([]);
      setSteps([]);
      
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-lato">Create New Framework</h1>
          <p className="text-gray-600 mt-2">Build a comprehensive sales coaching framework</p>
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

        {/* Collapsible Sections using your existing components */}
        <CollapsibleSection 
          title="Proficiency Levels" 
          defaultOpen={true} 
          status={levels.length > 0 ? 'complete' : 'empty'}
        >
          <div className="mb-4">
            <p className="text-gray-600 mb-4">Define the proficiency levels for your framework (e.g., Basic, Intermediate, Advanced)</p>
          </div>
          <BehaviorLevelsSection levels={levels} setLevels={setLevels} />
        </CollapsibleSection>

        <CollapsibleSection 
          title="Framework Structure" 
          defaultOpen={false} 
          status={steps.length > 0 ? 'complete' : 'empty'}
        >
          <div className="mb-4">
            <p className="text-gray-600 mb-2">Define the structure of your sales framework</p>
            <p className="text-sm text-gray-500">Steps → Sub-steps → Behaviors (linked to levels)</p>
          </div>
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
              onClick={() => {
                setFrameworkName("");
                setFrameworkDesc("");
                setLevels([]);
                setSteps([]);
              }}
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-lato font-medium transition-colors border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
            >
              Clear Form
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