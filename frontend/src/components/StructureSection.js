import { useState } from "react";
import InlineEditableText from "./InlineEditableText";

export default function StructureSection({ steps, setSteps, levels }) {
  const addStep = () => {
    setSteps([...steps, { id: Date.now(), name: "New Step", substeps: [] }]);
  };

  const addSubstep = (stepId) => {
    setSteps(steps.map(step =>
      step.id === stepId
        ? { ...step, substeps: [...step.substeps, { id: Date.now(), name: "New Substep", behaviors: [] }] }
        : step
    ));
  };

  const addBehavior = (stepId, substepId, levelId) => {
    setSteps(steps.map(step =>
      step.id === stepId
        ? {
            ...step,
            substeps: step.substeps.map(sub =>
              sub.id === substepId
                ? {
                    ...sub,
                    behaviors: [...sub.behaviors, { id: Date.now(), description: "New Behavior", levelId }]
                  }
                : sub
            )
          }
        : step
    ));
  };

  const updateStepName = (stepId, newName) => {
    setSteps(steps.map(step =>
      step.id === stepId ? { ...step, name: newName } : step
    ));
  };

  const updateSubstepName = (stepId, substepId, newName) => {
    setSteps(steps.map(step =>
      step.id === stepId
        ? {
            ...step,
            substeps: step.substeps.map(sub =>
              sub.id === substepId ? { ...sub, name: newName } : sub
            )
          }
        : step
    ));
  };

  const updateBehaviorDesc = (stepId, substepId, behaviorId, newDesc) => {
    setSteps(steps.map(step =>
      step.id === stepId
        ? {
            ...step,
            substeps: step.substeps.map(sub =>
              sub.id === substepId
                ? {
                    ...sub,
                    behaviors: sub.behaviors.map(b =>
                      b.id === behaviorId ? { ...b, description: newDesc } : b
                    )
                  }
                : sub
            )
          }
        : step
    ));
  };

  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <div key={step.id} className="border rounded p-2 space-y-2">
          <div className="flex justify-between items-center">
            <InlineEditableText text={step.name} onSave={(val) => updateStepName(step.id, val)} />
            <button className="text-sm text-red-600" onClick={() => setSteps(steps.filter(s => s.id !== step.id))}>
              Delete Step
            </button>
          </div>

          {step.substeps.map((sub) => (
            <div key={sub.id} className="ml-4 border rounded p-2 space-y-2">
              <div className="flex justify-between items-center">
                <InlineEditableText text={sub.name} onSave={(val) => updateSubstepName(step.id, sub.id, val)} />
                <button className="text-sm text-red-600" onClick={() => {
                  setSteps(steps.map(s =>
                    s.id === step.id
                      ? { ...s, substeps: s.substeps.filter(sub2 => sub2.id !== sub.id) }
                      : s
                  ));
                }}>
                  Delete Substep
                </button>
              </div>

              {levels.map(level => (
                <div key={level.id} className="ml-4">
                  <p className="font-semibold text-sm">{level.name}</p>
                  {sub.behaviors.filter(b => b.levelId === level.id).map(beh => (
                    <div key={beh.id} className="flex items-center gap-2 ml-2">
                      <InlineEditableText
                        text={beh.description}
                        onSave={(val) => updateBehaviorDesc(step.id, sub.id, beh.id, val)}
                      />
                      <button className="text-sm text-red-600" onClick={() => {
                        setSteps(steps.map(s =>
                          s.id === step.id
                            ? {
                                ...s,
                                substeps: s.substeps.map(sub2 =>
                                  sub2.id === sub.id
                                    ? { ...sub2, behaviors: sub2.behaviors.filter(b2 => b2.id !== beh.id) }
                                    : sub2
                                )
                              }
                            : s
                        ));
                      }}>
                        Delete
                      </button>
                    </div>
                  ))}
                  <button className="text-sm text-[#11339b] ml-2" onClick={() => addBehavior(step.id, sub.id, level.id)}>
                    + Add Behavior
                  </button>
                </div>
              ))}
            </div>
          ))}

          <div className="ml-2">
            <button className="text-sm bg-gray-200 px-2 py-1 rounded" onClick={() => addSubstep(step.id)}>
              + Add Substep
            </button>
          </div>
        </div>
      ))}

      <button className="bg-[#11339b] text-white px-3 py-1 rounded" onClick={addStep}>+ Add Step</button>
    </div>
  );
}
