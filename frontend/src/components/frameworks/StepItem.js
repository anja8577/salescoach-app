// src/components/frameworks/StepItem.js
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import SubStepItem from "./SubStepItem";
import InlineEditableText from "@/components/InlineEditableText";

export default function StepItem({ step, levels, onUpdate, onRemove }) {
  const [isExpanded, setIsExpanded] = useState(true); // Add collapsible state

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

  const updateSubStep = (subStepId, updatedSubStep) => {
    const newSubSteps = (step.subSteps || []).map(s =>
      s.id === subStepId ? updatedSubStep : s
    );
    onUpdate({ ...step, subSteps: newSubSteps });
  };

  const removeSubStep = (subStepId) => {
    const newSubSteps = (step.subSteps || []).filter(s => s.id !== subStepId);
    onUpdate({ ...step, subSteps: newSubSteps });
  };

  // Count total behaviors
  const totalBehaviors = (step.subSteps || []).reduce((total, subStep) => {
    return total + (subStep.behaviors?.length || 0);
  }, 0);

  return (
    <div className="border border-gray-300 rounded bg-white">
      <div 
        className="flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-700 text-base transition-transform duration-200" 
                style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
            ❯
          </span>
          <div>
            <h3 className="font-semibold text-lg font-lato">
              Step {step.position}: <InlineEditableText
                text={step.name}
                onSave={(newName) => onUpdate({ ...step, name: newName })}
                placeholder="Untitled Step"
              />
            </h3>
            <p className="text-sm text-gray-600 font-lato">
              {step.subSteps?.length || 0} substeps, {totalBehaviors} behaviors
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onRemove}
            className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600 font-lato"
          >
            Delete
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4">
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
                  onUpdate={(updatedSubStep) => updateSubStep(subStep.id, updatedSubStep)}
                  onRemove={() => removeSubStep(subStep.id)}
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
      )}
    </div>
  );
}