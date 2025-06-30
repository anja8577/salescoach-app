"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, GripVertical } from "lucide-react";

// CollapsibleSection component with different colors
function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
 // Define colors for different sections
const getHeaderClasses = () => {
  if (title === "Proficiency Levels") return "bg-orange-500 text-white";      // Changed to orange
  if (title === "Framework Structure") return "bg-green-600 text-white";     // Changed to green
  return "bg-gray-50 text-gray-900"; // default
};
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-6 py-4 text-left hover:opacity-90 transition-colors duration-200 flex items-center justify-between ${getHeaderClasses()}`}
      >
        <h3 className="text-lg font-semibold font-lato">{title}</h3>
        {isOpen ? (
          <ChevronDown className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </button>
      {isOpen && (
        <div className="p-6 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}

// Proficiency Levels Section
function BehaviorLevelsSection({ levels, setLevels }) {
  const addLevel = () => {
    const newLevel = {
      id: Date.now(),
      name: "",
      points: levels.length + 1,
      color: "#3B82F6"
    };
    setLevels([...levels, newLevel]);
  };

  const removeLevel = (id) => {
    setLevels(levels.filter(level => level.id !== id));
  };

  const updateLevel = (id, field, value) => {
    setLevels(levels.map(level => 
      level.id === id ? { ...level, [field]: value } : level
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">Define the proficiency levels for your framework (e.g., Basic, Intermediate, Advanced)</p>
        <button
          onClick={addLevel}
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-lato font-medium transition-colors bg-blue-800 text-white hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800 focus-visible:ring-offset-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Level
        </button>
      </div>
      
      {levels.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p>No proficiency levels defined yet. Click "Add Level" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {levels.map((level, index) => (
            <div key={level.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: level.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700 font-lato">Level {index + 1}</span>
                </div>
                <button
                  onClick={() => removeLevel(level.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-lato">Level Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Basic, Intermediate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={level.name}
                    onChange={(e) => updateLevel(level.id, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-lato">Points</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={level.points}
                    onChange={(e) => updateLevel(level.id, 'points', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-lato">Color</label>
                  <input
                    type="color"
                    className="w-full h-10 border border-gray-300 rounded-lg"
                    value={level.color}
                    onChange={(e) => updateLevel(level.id, 'color', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple Behavior Item
function BehaviorItem({ behavior, onUpdate, onRemove }) {
  return (
    <div className="flex items-center justify-between group bg-white border border-gray-200 rounded px-3 py-2">
      <input
        type="text"
        placeholder="Enter behavior description"
        className="flex-1 border-0 bg-transparent focus:outline-none focus:ring-0 text-sm"
        value={behavior.description || ""}
        onChange={(e) => onUpdate({ ...behavior, description: e.target.value })}
      />
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 transition-opacity ml-2 text-lg font-bold"
      >
        ×
      </button>
    </div>
  );
}

// Sub-step Component with grouped behaviors by level
function SubStepItem({ subStep, levels, onUpdate, onRemove, stepPosition, subStepIndex }) {
  const addBehaviorToLevel = (levelId) => {
    const newBehavior = {
      id: Date.now(),
      description: "",
      behavior_level_id: levelId
    };
    onUpdate({
      ...subStep,
      behaviors: [...(subStep.behaviors || []), newBehavior]
    });
  };

  const updateBehavior = (behaviorIndex, updatedBehavior) => {
    const newBehaviors = [...(subStep.behaviors || [])];
    newBehaviors[behaviorIndex] = updatedBehavior;
    onUpdate({ ...subStep, behaviors: newBehaviors });
  };

  const removeBehavior = (behaviorIndex) => {
    const newBehaviors = subStep.behaviors.filter((_, index) => index !== behaviorIndex);
    onUpdate({ ...subStep, behaviors: newBehaviors });
  };

  // Group behaviors by level
  const behaviorsByLevel = {};
  levels.forEach(level => {
    behaviorsByLevel[level.id] = (subStep.behaviors || []).filter(b => b.behavior_level_id === level.id);
  });

  return (
    <div className="border border-gray-200 rounded bg-white">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium font-lato">{stepPosition}.{subStepIndex + 1}</span>
          <input
            type="text"
            placeholder="Sub-step name"
            className="border-0 bg-transparent focus:outline-none focus:ring-0 font-medium font-lato"
            value={subStep.name || ""}
            onChange={(e) => onUpdate({ ...subStep, name: e.target.value })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 font-lato">
            Edit
          </button>
          <button
            onClick={onRemove}
            className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {levels.map((level) => (
          <div key={level.id}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium font-lato" style={{ color: level.color }}>
                Level {level.points}: {level.name}
              </h4>
              <button
                onClick={() => addBehaviorToLevel(level.id)}
                className="px-2 py-1 text-xs text-white bg-blue-800 rounded hover:bg-blue-900 font-lato"
              >
                + Add Behavior
              </button>
            </div>
            <div className="space-y-1">
              {behaviorsByLevel[level.id]?.map((behavior) => {
                const actualIndex = (subStep.behaviors || []).findIndex(b => b.id === behavior.id);
                return (
                  <BehaviorItem
                    key={behavior.id}
                    behavior={behavior}
                    onUpdate={(updatedBehavior) => updateBehavior(actualIndex, updatedBehavior)}
                    onRemove={() => removeBehavior(actualIndex)}
                  />
                );
              })}
              {(!behaviorsByLevel[level.id] || behaviorsByLevel[level.id].length === 0) && (
                <div className="text-center py-2 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded">
                  No behaviors defined for this level
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Step Component
function StepItem({ step, levels, onUpdate, onRemove }) {
  const addSubStep = () => {
    const newSubStep = {
      id: Date.now(),
      name: "",
      position: (step.subSteps?.length || 0) + 1,
      behaviors: []
    };
    onUpdate({
      ...step,
      subSteps: [...(step.subSteps || []), newSubStep]
    });
  };

  const updateSubStep = (subStepIndex, updatedSubStep) => {
    const newSubSteps = [...(step.subSteps || [])];
    newSubSteps[subStepIndex] = updatedSubStep;
    onUpdate({ ...step, subSteps: newSubSteps });
  };

  const removeSubStep = (subStepIndex) => {
    const newSubSteps = step.subSteps.filter((_, index) => index !== subStepIndex);
    onUpdate({ ...step, subSteps: newSubSteps });
  };

  // Count total behaviors
  const totalBehaviors = (step.subSteps || []).reduce((total, subStep) => {
    return total + (subStep.behaviors?.length || 0);
  }, 0);

  return (
    <div className="border border-gray-300 rounded bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="font-semibold text-lg font-lato">
            Step {step.position}: {step.name || 'Untitled Step'}
          </h3>
          <p className="text-sm text-gray-600 font-lato">
            {step.subSteps?.length || 0} substeps, {totalBehaviors} behaviors
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 font-lato">
            Edit
          </button>
          <button
            onClick={onRemove}
            className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600 font-lato"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter step name"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-lato"
            value={step.name || ""}
            onChange={(e) => onUpdate({ ...step, name: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          {(!step.subSteps || step.subSteps.length === 0) ? (
            <div className="text-center py-4 text-gray-500 bg-gray-50 rounded border-2 border-dashed border-gray-300">
              <p className="font-lato">No sub-steps defined yet.</p>
            </div>
          ) : (
            step.subSteps.map((subStep, subStepIndex) => (
              <SubStepItem
                key={subStep.id}
                subStep={subStep}
                levels={levels}
                stepPosition={step.position}
                subStepIndex={subStepIndex}
                onUpdate={(updatedSubStep) => updateSubStep(subStepIndex, updatedSubStep)}
                onRemove={() => removeSubStep(subStepIndex)}
              />
            ))
          )}
          
          <button
            onClick={addSubStep}
            className="w-full py-2 border-2 border-dashed border-blue-800 text-blue-800 rounded hover:border-blue-900 hover:text-blue-900 font-lato"
          >
            + Add Sub-step
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Structure Section
function StructureSection({ steps, setSteps, levels }) {
  const addStep = () => {
    const newStep = {
      id: Date.now(),
      name: "",
      position: steps.length + 1,
      subSteps: []
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (stepIndex, updatedStep) => {
    const newSteps = [...steps];
    newSteps[stepIndex] = updatedStep;
    setSteps(newSteps);
  };

  const removeStep = (stepIndex) => {
    const newSteps = steps.filter((_, index) => index !== stepIndex);
    // Update positions
    const reorderedSteps = newSteps.map((step, index) => ({
      ...step,
      position: index + 1
    }));
    setSteps(reorderedSteps);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 font-lato">Define the structure of your sales framework</p>
          <p className="text-sm text-gray-500 mt-1 font-lato">Steps → Sub-steps → Behaviors (linked to levels)</p>
        </div>
        <button
          onClick={addStep}
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-lato font-medium transition-colors bg-blue-800 text-white hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800 focus-visible:ring-offset-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Step
        </button>
      </div>
      
      {steps.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="font-lato">No steps defined yet. Click "Add Step" to get started.</p>
          <p className="text-sm mt-2 font-lato">Each step can contain multiple sub-steps, and each sub-step can have multiple behaviors.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, stepIndex) => (
            <StepItem
              key={step.id}
              step={step}
              levels={levels}
              onUpdate={(updatedStep) => updateStep(stepIndex, updatedStep)}
              onRemove={() => removeStep(stepIndex)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
    const frameworkData = {
      name: frameworkName,
      description: frameworkDesc,
      levels,
      steps
    };

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

    // Success message (we'll improve this later)
    alert('Framework saved successfully!');
    
    // TODO: Later we'll redirect to the framework list page
    
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
          <BehaviorLevelsSection levels={levels} setLevels={setLevels} />
        </CollapsibleSection>

        <CollapsibleSection title="Framework Structure" defaultOpen={false}>
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
