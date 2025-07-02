// src/components/frameworks/SubStepItem.js
"use client";

import { useState } from "react";
import BehaviorItem from "./BehaviorItem";
import InlineEditableText from "@/components/InlineEditableText";

export default function SubStepItem({ subStep, levels, onUpdate, onRemove, stepPosition, subStepIndex }) {
  const [isExpanded, setIsExpanded] = useState(true); // Add collapsible state

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

  const updateBehavior = (behaviorId, updatedBehavior) => {
    const newBehaviors = (subStep.behaviors || []).map(b =>
      b.id === behaviorId ? updatedBehavior : b
    );
    onUpdate({ ...subStep, behaviors: newBehaviors });
  };

  const removeBehavior = (behaviorId) => {
    const newBehaviors = (subStep.behaviors || []).filter(b => b.id !== behaviorId);
    onUpdate({ ...subStep, behaviors: newBehaviors });
  };

  // Group behaviors by level
  const behaviorsByLevel = {};
  levels.forEach(level => {
    behaviorsByLevel[level.id] = (subStep.behaviors || []).filter(b => b.behavior_level_id === level.id);
  });

  // Count total behaviors for display
  const totalBehaviors = (subStep.behaviors || []).length;

  return (
    <div className="border border-gray-200 rounded bg-white">
      <div 
        className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 text-sm transition-transform duration-200" 
                style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
            ❯
          </span>
          <span className="text-sm font-medium font-lato">{stepPosition}.{subStepIndex + 1}</span>
          <InlineEditableText
            text={subStep.name}
            onSave={(newName) => onUpdate({ ...subStep, name: newName })}
            placeholder="Sub-step name"
            className="border-0 bg-transparent focus:outline-none focus:ring-0 font-medium font-lato"
          />
          <span className="text-xs text-gray-500 font-lato">
            ({totalBehaviors} behaviors)
          </span>
        </div>
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onRemove}
            className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
          >
            ×
          </button>
        </div>
      </div>

      {isExpanded && (
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
                {behaviorsByLevel[level.id]?.map((behavior) => (
                  <BehaviorItem
                    key={behavior.id}
                    behavior={behavior}
                    onUpdate={(updatedBehavior) => updateBehavior(behavior.id, updatedBehavior)}
                    onRemove={() => removeBehavior(behavior.id)}
                  />
                ))}
                {(!behaviorsByLevel[level.id] || behaviorsByLevel[level.id].length === 0) && (
                  <div className="text-center py-2 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded">
                    No behaviors defined for this level
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}