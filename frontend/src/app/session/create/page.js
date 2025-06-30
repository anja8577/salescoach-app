"use client";

import { useState, useEffect } from 'react';
import LayoutApp from '@/components/LayoutApp';
import { Button } from '@/components/ui/button';

export default function NewCoachingSession() {
  const [context, setContext] = useState('');
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [checkedBehaviors, setCheckedBehaviors] = useState(new Set());
  const [stepScores, setStepScores] = useState({});
  const [autoSaveVisible, setAutoSaveVisible] = useState(false);
  const [notes, setNotes] = useState({
    keyObservations: '',
    whatWentWell: '',
    whatCouldBeImproved: '',
    actionPlan: ''
  });

  // Dummy data for testing - we'll replace with API calls later
  const sessionData = {
    coach: "Sarah Johnson",
    coachee: "John Doe", 
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const dummySteps = [
    {
      id: 1,
      title: "Opening & Rapport Building",
      substeps: [
        {
          id: 11,
          title: "Personal Connection",
          behaviors: {
            learner: [
              { id: 111, text: "Establishes personal connection" },
              { id: 112, text: "Uses appropriate greeting" },
              { id: 113, text: "Shows genuine interest" }
            ],
            qualified: [
              { id: 114, text: "Creates comfortable environment" },
              { id: 115, text: "Adapts communication style" }
            ],
            experienced: [
              { id: 116, text: "Builds instant rapport" },
              { id: 117, text: "Reads non-verbal cues effectively" }
            ],
            master: [
              { id: 118, text: "Creates emotional connection" }
            ]
          }
        },
        {
          id: 12,
          title: "Setting Agenda",
          behaviors: {
            learner: [
              { id: 121, text: "States meeting purpose" },
              { id: 122, text: "Mentions time allocation" }
            ],
            qualified: [
              { id: 123, text: "Confirms participant expectations" },
              { id: 124, text: "Sets clear objectives" },
              { id: 125, text: "Establishes ground rules" }
            ],
            experienced: [
              { id: 126, text: "Involves participants in agenda setting" },
              { id: 127, text: "Prioritizes topics effectively" }
            ],
            master: [
              { id: 128, text: "Creates dynamic, flexible agenda" },
              { id: 129, text: "Anticipates and addresses concerns" }
            ]
          }
        }
      ]
    },
    {
      id: 2,
      title: "Needs Discovery", 
      substeps: [
        {
          id: 21,
          title: "Initial Questions",
          behaviors: {
            learner: [
              { id: 211, text: "Asks basic open-ended questions", checked: true },
              { id: 212, text: "Listens to responses and takes notes" },
              { id: 213, text: "Shows interest in answers" }
            ],
            qualified: [
              { id: 214, text: "Asks follow-up questions to clarify" },
              { id: 215, text: "Summarizes what was heard" }
            ],
            experienced: [
              { id: 216, text: "Identifies pain points proactively" },
              { id: 217, text: "Uncovers underlying motivations" }
            ],
            master: [
              { id: 218, text: "Reads between the lines effectively" }
            ]
          }
        },
        {
          id: 22,
          title: "Deep Dive Questions",
          behaviors: {
            learner: [
              { id: 221, text: "Asks about current situation" },
              { id: 222, text: "Inquires about challenges" }
            ],
            qualified: [
              { id: 223, text: "Explores business impact of current situation", checked: true },
              { id: 224, text: "Uncovers decision criteria and process", checked: true },
              { id: 225, text: "Asks about timeline and urgency" }
            ],
            experienced: [
              { id: 226, text: "Identifies stakeholders and influencers" },
              { id: 227, text: "Explores budget and resources" }
            ],
            master: [
              { id: 228, text: "Uncovers implicit needs and future state vision" },
              { id: 229, text: "Anticipates future challenges" }
            ]
          }
        }
      ]
    },
    {
      id: 3,
      title: "Solution Presentation",
      substeps: [
        {
          id: 31,
          title: "Tailored Presentation",
          behaviors: {
            learner: [
              { id: 311, text: "Presents product features" },
              { id: 312, text: "Explains basic benefits" }
            ],
            qualified: [
              { id: 313, text: "Links features to customer needs" },
              { id: 314, text: "Provides relevant examples" },
              { id: 315, text: "Uses customer language" }
            ],
            experienced: [
              { id: 316, text: "Demonstrates ROI clearly", checked: true },
              { id: 317, text: "Addresses specific pain points", checked: true },
              { id: 318, text: "Customizes presentation flow", checked: true }
            ],
            master: [
              { id: 319, text: "Creates compelling vision of future state" }
            ]
          }
        }
      ]
    }
  ];

  // Initialize checked behaviors from dummy data
  useEffect(() => {
    const initialChecked = new Set();
    dummySteps.forEach(step => {
      step.substeps.forEach(substep => {
        Object.values(substep.behaviors).flat().forEach(behavior => {
          if (behavior.checked) {
            initialChecked.add(behavior.id);
          }
        });
      });
    });
    setCheckedBehaviors(initialChecked);
  }, []);

  const toggleStep = (stepId) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const handleBehaviorCheck = (behaviorId, checked) => {
    const newChecked = new Set(checkedBehaviors);
    if (checked) {
      newChecked.add(behaviorId);
    } else {
      newChecked.delete(behaviorId);
    }
    setCheckedBehaviors(newChecked);
    showAutoSave();
  };

  const handleStepScoreChange = (stepId, level) => {
    setStepScores(prev => ({ ...prev, [stepId]: level }));
    showAutoSave();
  };

  const handleNotesChange = (field, value) => {
    setNotes(prev => ({ ...prev, [field]: value }));
    showAutoSave();
  };

  const showAutoSave = () => {
    setAutoSaveVisible(true);
    setTimeout(() => {
      setAutoSaveVisible(false);
    }, 1500); // Reduced from 3000 to 1500ms
  };

  const getProficiencyBadgeClass = (level) => {
    switch (level.toLowerCase()) {
      case 'learner': return 'bg-blue-100 text-blue-800 border-blue-500';
      case 'qualified': return 'bg-orange-100 text-orange-800 border-orange-500';
      case 'experienced': return 'bg-green-100 text-green-800 border-green-500';
      case 'master': return 'bg-purple-100 text-purple-800 border-purple-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStepColorClass = (index) => {
    const colors = [
      'border-l-4 border-l-blue-600',      // Primary
      'border-l-4 border-l-purple-600',    // Purple  
      'border-l-4 border-l-pink-600',      // Pink
      'border-l-4 border-l-orange-600',    // Orange
      'border-l-4 border-l-yellow-500',    // Sun
      'border-l-4 border-l-yellow-300',    // Yellow
      'border-l-4 border-l-green-600'      // Green
    ];
    return colors[index % colors.length];
  };

  const getLevelHeaderClass = (level) => {
    switch (level) {
      case 'learner': return 'text-blue-700 bg-blue-50';
      case 'qualified': return 'text-orange-700 bg-orange-50';
      case 'experienced': return 'text-green-700 bg-green-50';
      case 'master': return 'text-purple-700 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get current step proficiency (manual override or calculated)
  const getStepProficiency = (step) => {
    const manualScore = stepScores[step.id];
    if (manualScore && manualScore !== 'Auto-Calculate') {
      return { level: manualScore, isManual: true };
    }
    
    // Calculate from behaviors using your exact formula
    let pointsEarned = 0;
    let a = 0, b = 0, c = 0, d = 0; // behavior counts across all substeps
    
    step.substeps.forEach(substep => {
      // Count behaviors by level
      a += substep.behaviors.learner?.length || 0;
      b += substep.behaviors.qualified?.length || 0;
      c += substep.behaviors.experienced?.length || 0;
      d += substep.behaviors.master?.length || 0;
      
      // Count checked behaviors and calculate points
      const learnerChecked = substep.behaviors.learner?.filter(behavior => checkedBehaviors.has(behavior.id)).length || 0;
      const qualifiedChecked = substep.behaviors.qualified?.filter(behavior => checkedBehaviors.has(behavior.id)).length || 0;
      const experiencedChecked = substep.behaviors.experienced?.filter(behavior => checkedBehaviors.has(behavior.id)).length || 0;
      const masterChecked = substep.behaviors.master?.filter(behavior => checkedBehaviors.has(behavior.id)).length || 0;
      
      pointsEarned += (learnerChecked * 1) + (qualifiedChecked * 2) + (experiencedChecked * 3) + (masterChecked * 4);
    });
    
    const allBehaviors = step.substeps.flatMap(substep => 
      Object.values(substep.behaviors).flat()
    );
    
    if (allBehaviors.length === 0) {
      return { level: 'Not Evaluated', isManual: false, percentage: 0 };
    }
    
    const totalPossible = (a * 1) + (b * 2) + (c * 3) + (d * 4);
    
    // Your exact formula for thresholds
    const learnerMax = a * 1;
    const qualifiedMax = (a * 1) + (b * 2);
    const experiencedMax = (a * 1) + (b * 2) + (c * 3);
    
    let level;
    if (pointsEarned === 0) {
      level = 'Learner';
    } else if (pointsEarned <= learnerMax) {
      level = 'Learner';
    } else if (pointsEarned <= qualifiedMax) {
      level = 'Qualified';
    } else if (pointsEarned <= experiencedMax) {
      level = 'Experienced';
    } else {
      level = 'Master';
    }
    
    const percentage = totalPossible > 0 ? Math.round((pointsEarned / totalPossible) * 100) : 0;
    
    return { level, isManual: false, percentage, pointsEarned, totalPossible };
  };

  const calculateSubstepProficiency = (substep) => {
    const allBehaviors = Object.values(substep.behaviors).flat();
    if (allBehaviors.length === 0) return { level: 'Not Evaluated', percentage: 0 };
    
    // Get behavior counts and calculate points earned
    const a = substep.behaviors.learner?.length || 0;
    const b = substep.behaviors.qualified?.length || 0;
    const c = substep.behaviors.experienced?.length || 0;
    const d = substep.behaviors.master?.length || 0;
    
    const learnerChecked = substep.behaviors.learner?.filter(behavior => checkedBehaviors.has(behavior.id)).length || 0;
    const qualifiedChecked = substep.behaviors.qualified?.filter(behavior => checkedBehaviors.has(behavior.id)).length || 0;
    const experiencedChecked = substep.behaviors.experienced?.filter(behavior => checkedBehaviors.has(behavior.id)).length || 0;
    const masterChecked = substep.behaviors.master?.filter(behavior => checkedBehaviors.has(behavior.id)).length || 0;
    
    const pointsEarned = (learnerChecked * 1) + (qualifiedChecked * 2) + (experiencedChecked * 3) + (masterChecked * 4);
    const totalPossible = (a * 1) + (b * 2) + (c * 3) + (d * 4);
    
    // Your exact formula for thresholds
    const learnerMax = a * 1;
    const qualifiedMax = (a * 1) + (b * 2);
    const experiencedMax = (a * 1) + (b * 2) + (c * 3);
    
    let level;
    if (pointsEarned === 0) {
      level = 'Learner';
    } else if (pointsEarned <= learnerMax) {
      level = 'Learner';
    } else if (pointsEarned <= qualifiedMax) {
      level = 'Qualified';
    } else if (pointsEarned <= experiencedMax) {
      level = 'Experienced';
    } else {
      level = 'Master';
    }
    
    const percentage = totalPossible > 0 ? Math.round((pointsEarned / totalPossible) * 100) : 0;
    
    return { level, percentage, pointsEarned, totalPossible };
  };

  // Calculate overall proficiency for spider graph
  const getOverallProficiency = () => {
    const stepProficiencies = dummySteps.map(step => {
      const stepProf = getStepProficiency(step);
      const levelValue = stepProf.level === 'Learner' ? 1 : 
                        stepProf.level === 'Qualified' ? 2 :
                        stepProf.level === 'Experienced' ? 3 :
                        stepProf.level === 'Master' ? 4 : 1;
      return levelValue;
    });
    
    const avgLevel = stepProficiencies.reduce((sum, level) => sum + level, 0) / stepProficiencies.length;
    
    if (avgLevel >= 3.5) return 'Master';
    else if (avgLevel >= 2.5) return 'Experienced';
    else if (avgLevel >= 1.5) return 'Qualified';
    else return 'Learner';
  };

  // Spider graph component
  const SpiderGraph = () => {
    const size = 500; // Increased from 400
    const center = size / 2;
    const maxRadius = 140; // Increased from 120
    const steps = dummySteps.length;
    
    // Calculate points for each step
    const stepPoints = dummySteps.map((step, index) => {
      const stepProf = getStepProficiency(step);
      const levelValue = stepProf.level === 'Learner' ? 1 : 
                        stepProf.level === 'Qualified' ? 2 :
                        stepProf.level === 'Experienced' ? 3 :
                        stepProf.level === 'Master' ? 4 : 1;
      
      const angle = (index * 2 * Math.PI) / steps - Math.PI / 2;
      const radius = (levelValue / 4) * maxRadius;
      
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        labelX: center + (maxRadius + 60) * Math.cos(angle), // Increased from 40 to 60
        labelY: center + (maxRadius + 60) * Math.sin(angle),
        title: step.title,
        level: stepProf.level,
        angle
      };
    });

    // Create benchmark points (Level 3 = Experienced)
    const benchmarkPoints = dummySteps.map((step, index) => {
      const angle = (index * 2 * Math.PI) / steps - Math.PI / 2;
      const radius = (3 / 4) * maxRadius;
      
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle)
      };
    });

    return (
      <div className="flex flex-col items-center w-full">
        <svg width={size} height={size} className="bg-white overflow-visible">
          {/* Grid circles */}
          {[1, 2, 3, 4].map(level => (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={(level / 4) * maxRadius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Grid lines */}
          {dummySteps.map((_, index) => {
            const angle = (index * 2 * Math.PI) / steps - Math.PI / 2;
            const endX = center + maxRadius * Math.cos(angle);
            const endY = center + maxRadius * Math.sin(angle);
            
            return (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={endX}
                y2={endY}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Benchmark polygon (Level 3) */}
          <polygon
            points={benchmarkPoints.map(p => `${p.x},${p.y}`).join(' ')}
            fill="rgba(56, 189, 248, 0.2)"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          
          {/* Actual performance polygon */}
          <polygon
            points={stepPoints.map(p => `${p.x},${p.y}`).join(' ')}
            fill="rgba(59, 130, 246, 0.3)"
            stroke="#3b82f6"
            strokeWidth="3"
          />
          
          {/* Step labels - Full names with better positioning */}
          {stepPoints.map((point, index) => (
            <text
              key={index}
              x={point.labelX}
              y={point.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-medium fill-gray-700"
              style={{
                textAnchor: point.labelX > center ? 'start' : point.labelX < center ? 'end' : 'middle'
              }}
            >
              {point.title}
            </text>
          ))}
        </svg>
        
        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-sm opacity-60"></div>
            <span>Actual Performance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-300 border-dashed rounded-sm bg-blue-100"></div>
            <span>Benchmark (Level 3)</span>
          </div>
        </div>
      </div>
    );
  };

  const renderBehaviorGroup = (behaviors, level, substepId) => {
    const isEmpty = behaviors.length === 0;
    
    return (
      <div key={level} className="border-t border-gray-100 first:border-t-0">
        <div className={`text-xs font-bold uppercase tracking-wide px-3 py-2 ${getLevelHeaderClass(level)} ${isEmpty ? 'opacity-50' : ''}`}>
          {level} Level
        </div>
        <div className="px-3 py-2 space-y-2">
          {isEmpty ? (
            <div className="text-sm text-gray-500 italic">No behaviors defined for this level</div>
          ) : (
            behaviors.map(behavior => (
              <div key={behavior.id} className="flex items-start gap-3 p-2 bg-white rounded border border-gray-100">
                <input
                  type="checkbox"
                  id={`behavior-${behavior.id}`}
                  checked={checkedBehaviors.has(behavior.id)}
                  onChange={(e) => handleBehaviorCheck(behavior.id, e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`behavior-${behavior.id}`} className="text-sm text-gray-700 flex-1 cursor-pointer">
                  {behavior.text}
                </label>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <LayoutApp>
      {/* Session Info Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="text-xs text-gray-600">Coach: {sessionData.coach}</div>
            <div className="text-sm font-semibold text-gray-900">Coachee: {sessionData.coachee}</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-xs text-gray-600">{sessionData.date} - {sessionData.time}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-600">Overall:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getProficiencyBadgeClass(getOverallProficiency())}`}>
                {getOverallProficiency()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Coaching Context */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">Coaching Context</h2>
          <div className="space-y-2">
            <label htmlFor="context" className="block text-sm font-medium text-gray-700">
              Session Context
            </label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Describe the context of this coaching session..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Skills Analysis */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Skills Analysis</h2>
          
          <div className="space-y-3">
            {dummySteps.map((step, index) => {
              const stepProf = getStepProficiency(step);
              return (
                <div key={step.id} className={`bg-white rounded-lg border-2 overflow-hidden ${getStepColorClass(index)}`}>
                  {/* Step Header */}
                  <div 
                    className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleStep(step.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-gray-700 text-base transition-transform duration-200" 
                              style={{ transform: expandedSteps.has(step.id) ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                          ❯
                        </span>
                        <span className="font-semibold text-gray-900 text-base truncate">
                          {step.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getProficiencyBadgeClass(stepProf.level)}`}>
                          {stepProf.level} {stepProf.isManual && '(Manual)'}
                        </span>
                        {!stepProf.isManual && stepProf.percentage !== undefined && (
                          <span className="text-xs text-gray-500">
                            Auto: {stepProf.percentage}% ({stepProf.pointsEarned || 0}/{stepProf.totalPossible || 0}pts)
                          </span>
                        )}
                        <select 
                          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                          value={stepScores[step.id] || 'Auto-Calculate'}
                          onChange={(e) => handleStepScoreChange(step.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option>Auto-Calculate</option>
                          <option>Learner</option>
                          <option>Qualified</option>
                          <option>Experienced</option>
                          <option>Master</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Step Content */}
                  {expandedSteps.has(step.id) && (
                    <div className="p-4 bg-gray-50 space-y-4">
                      {step.substeps.map(substep => {
                        const substepProf = calculateSubstepProficiency(substep);
                        return (
                          <div key={substep.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            {/* Substep Header */}
                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-sm text-gray-800">{substep.title}</span>
                                <span className="text-xs text-gray-600">
                                  Auto: {substepProf.level} ({substepProf.percentage}% - {substepProf.pointsEarned || 0}/{substepProf.totalPossible || 0}pts)
                                </span>
                              </div>
                            </div>
                            
                            {/* Behavior Groups */}
                            <div className="divide-y divide-gray-100">
                              {['learner', 'qualified', 'experienced', 'master'].map(level => 
                                renderBehaviorGroup(substep.behaviors[level] || [], level, substep.id)
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Spider Graph */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 text-center">Skills Overview</h2>
          <SpiderGraph />
        </div>

        {/* Coaching Notes */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Coaching Notes</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-2">
                Key Observations
              </label>
              <textarea
                id="observations"
                value={notes.keyObservations}
                onChange={(e) => handleNotesChange('keyObservations', e.target.value)}
                placeholder="What did you observe during this interaction?"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 mb-2">
                What Went Well
              </label>
              <textarea
                id="strengths"
                value={notes.whatWentWell}
                onChange={(e) => handleNotesChange('whatWentWell', e.target.value)}
                placeholder="Positive aspects and strengths demonstrated..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="improvements" className="block text-sm font-medium text-gray-700 mb-2">
                What Could Be Improved
              </label>
              <textarea
                id="improvements"
                value={notes.whatCouldBeImproved}
                onChange={(e) => handleNotesChange('whatCouldBeImproved', e.target.value)}
                placeholder="Areas for development and improvement..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="actionPlan" className="block text-sm font-medium text-gray-700 mb-2">
                Action Plan / Next Steps
              </label>
              <textarea
                id="actionPlan"
                value={notes.actionPlan}
                onChange={(e) => handleNotesChange('actionPlan', e.target.value)}
                placeholder="Recommended actions and follow-up..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons - At bottom of page */}
        <div className="flex gap-2 mt-6">
          <Button variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={showAutoSave} className="flex-1">
            Save Draft
          </Button>
          <Button color="green" className="flex-1">
            Submit
          </Button>
        </div>
      </div>

      {/* Auto-save Status */}
      {autoSaveVisible && (
        <div className="fixed bottom-24 left-4 right-4 bg-green-500 text-white px-4 py-2 rounded text-center text-sm z-50 transition-opacity duration-300">
          ✓ Auto-saved just now
        </div>
      )}
    </LayoutApp>
  );
}