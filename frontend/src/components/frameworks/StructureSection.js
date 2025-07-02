// src/components/frameworks/StructureSection.js
"use client";

import { Plus } from "lucide-react";
import StepItem from "./StepItem";
import InlineEditableText from "@/components/InlineEditableText";

export default function StructureSection({ steps, setSteps, levels }) {
  const addStep = () => {
    const newStep = {
      id: Date.now(),
      name: "",
      position: steps.length + 1,
      subSteps: []
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (stepId, updatedStep) => {
    const newSteps = steps.map(s =>
      s.id === stepId ? updatedStep : s
    );
    setSteps(newSteps);
  };

  const removeStep = (stepId) => {
    const newSteps = steps.filter(s => s.id !== stepId);
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
              onUpdate={(updatedStep) => updateStep(step.id, updatedStep)}
              onRemove={() => removeStep(step.id)}
            />
          ))}
          
          {/* IMPROVEMENT 1: Add Step button below the last step */}
          <div className="flex justify-center pt-4">
            <button
              onClick={addStep}
              className="inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-lato font-medium transition-colors bg-blue-800 text-white hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800 focus-visible:ring-offset-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Step Below
            </button>
          </div>
        </div>
      )}
    </div>
  );
}