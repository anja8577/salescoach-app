"use client";

import { useState, useEffect } from 'react';
import LayoutApp from '@/components/LayoutApp';
import { Button } from '@/components/ui/button';

export default function NewCoachingSession() {
  const [context, setContext] = useState('');
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [expandedSubsteps, setExpandedSubsteps] = useState(new Set());
  const [checkedBehaviors, setCheckedBehaviors] = useState(new Set());
  const [stepScores, setStepScores] = useState({});
  const [autoSaveVisible, setAutoSaveVisible] = useState(false);
  const [notes, setNotes] = useState({
    keyObservations: '',
    whatWentWell: '',
    whatCouldBeImproved: '',
    actionPlan: ''
  });

  // Framework data state
  const [frameworkData, setFrameworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Session data - you can make this dynamic later
  const sessionData = {
    coach: "Sarah Johnson",
    coachee: "John Doe", 
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  // Framework ID - hardcoded for now, can be passed as prop later
  const FRAMEWORK_ID = '7b5dbd81-bc61-48d7-8d39-bb46d4d00d74';

  // Fetch framework data on component mount
  useEffect(() => {
    const fetchFrameworkData = async () => {
      try {
        setLoading(true);
        
        // First, let's try the existing endpoint to see what we get
        const response = await fetch(`http://localhost:5000/api/frameworks`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch framework data');
        }
        
        const frameworks = await response.json();
        console.log('Available frameworks:', frameworks);
        
        // Find our specific framework
        const targetFramework = frameworks.find(f => f.id === FRAMEWORK_ID);
        
        if (!targetFramework) {
          throw new Error(`Framework with ID ${FRAMEWORK_ID} not found`);
        }
        
        console.log('Target framework:', targetFramework);
        
        // Now we need to fetch the full structure
        // We'll need to make multiple API calls to get steps, substeps, behaviors, and levels
        const [stepsRes, levelsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/framework-steps?framework_id=${FRAMEWORK_ID}`),
          fetch(`http://localhost:5000/api/behavior-levels?framework_id=${FRAMEWORK_ID}`)
        ]);
        
        if (!stepsRes.ok || !levelsRes.ok) {
          throw new Error('Failed to fetch framework structure');
        }
        
        const [steps, levels] = await Promise.all([
          stepsRes.json(),
          levelsRes.json()
        ]);
        
        console.log('Steps:', steps);
        console.log('Levels:', levels);
        
        // Fetch substeps and behaviors for each step
        const stepsWithStructure = await Promise.all(
          steps.map(async (step) => {
            const [substepsRes, behaviorsRes] = await Promise.all([
              fetch(`http://localhost:5000/api/framework-substeps?framework_id=${FRAMEWORK_ID}`),
              fetch(`http://localhost:5000/api/framework-behaviors?framework_id=${FRAMEWORK_ID}`)
            ]);
            
            const [substeps, behaviors] = await Promise.all([
              substepsRes.json(),
              behaviorsRes.json()
            ]);
            
            // Filter substeps for this step
            const stepSubsteps = substeps.filter(ss => ss.step_id === step.id);
            
            // Build substeps with their behaviors grouped by level
            const substepsWithBehaviors = stepSubsteps.map(substep => {
              const substepBehaviors = behaviors.filter(b => b.substep_id === substep.id);
              
              // Group behaviors by level
              const behaviorsByLevel = {};
              levels.forEach(level => {
                behaviorsByLevel[level.level_name.toLowerCase()] = substepBehaviors
                  .filter(b => b.level_id === level.id)
                  .map(b => ({
                    id: b.id,
                    text: b.description
                  }));
              });
              
              return {
                id: substep.id,
                title: substep.name,
                behaviors: behaviorsByLevel
              };
            });
            
            return {
              id: step.id,
              title: step.name,
              substeps: substepsWithBehaviors
            };
          })
        );
        
        setFrameworkData({
          framework: targetFramework,
          steps: stepsWithStructure,
          levels: levels
        });
        
        console.log('Final framework data:', {
          framework: targetFramework,
          steps: stepsWithStructure,
          levels: levels
        });
        
      } catch (error) {
        console.error('Error fetching framework:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFrameworkData();
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

  const toggleSubstep = (substepId) => {
    const newExpanded = new Set(expandedSubsteps);
    if (newExpanded.has(substepId)) {
      newExpanded.delete(substepId);
    } else {
      newExpanded.add(substepId);
    }
    setExpandedSubsteps(newExpanded);
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
    }, 1500);
  };

  const getProficiencyBadgeClass = (level) => {
    const levelLower = level.toLowerCase();
    if (levelLower.includes('learner') || levelLower.includes('basic')) return 'bg-blue-100 text-blue-800 border-blue-500';
    if (levelLower.includes('qualified') || levelLower.includes('intermediate')) return 'bg-orange-100 text-orange-800 border-orange-500';
    if (levelLower.includes('experienced') || levelLower.includes('advanced')) return 'bg-green-100 text-green-800 border-green-500';
    if (levelLower.includes('master') || levelLower.includes('expert')) return 'bg-purple-100 text-purple-800 border-purple-500';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStepColorClass = (index) => {
    const colors = [
      'border-l-4 border-l-blue-600',
      'border-l-4 border-l-purple-600',
      'border-l-4 border-l-pink-600',
      'border-l-4 border-l-orange-600',
      'border-l-4 border-l-yellow-500',
      'border-l-4 border-l-yellow-300',
      'border-l-4 border-l-green-600'
    ];
    return colors[index % colors.length];
  };

  const getLevelHeaderClass = (level) => {
    const levelLower = level.toLowerCase();
    if (levelLower.includes('learner') || levelLower.includes('basic')) return 'text-blue-700 bg-blue-50';
    if (levelLower.includes('qualified') || levelLower.includes('intermediate')) return 'text-orange-700 bg-orange-50';
    if (levelLower.includes('experienced') || levelLower.includes('advanced')) return 'text-green-700 bg-green-50';
    if (levelLower.includes('master') || levelLower.includes('expert')) return 'text-purple-700 bg-purple-50';
    return 'text-gray-600 bg-gray-50';
  };

  // Calculate proficiency using correct threshold logic
  const getStepProficiency = (step) => {
    if (!frameworkData?.levels) return { level: 'Not Evaluated', isManual: false, percentage: 0 };
    
    const manualScore = stepScores[step.id];
    if (manualScore && manualScore !== 'Auto-Calculate') {
      return { level: manualScore, isManual: true };
    }
    
    // Calculate from behaviors using the level point values from database
    let pointsEarned = 0;
    const levelCounts = {};
    
    // Initialize level counts
    frameworkData.levels.forEach(level => {
      levelCounts[level.level_name.toLowerCase()] = 0;
    });
    
    step.substeps.forEach(substep => {
      // Count behaviors by level
      Object.keys(substep.behaviors).forEach(levelName => {
        levelCounts[levelName] += substep.behaviors[levelName]?.length || 0;
      });
      
      // Count checked behaviors and calculate points
      Object.keys(substep.behaviors).forEach(levelName => {
        const levelData = frameworkData.levels.find(l => l.level_name.toLowerCase() === levelName);
        const pointValue = levelData ? levelData.point_value : 1;
        
        const checkedCount = substep.behaviors[levelName]?.filter(behavior => 
          checkedBehaviors.has(behavior.id)
        ).length || 0;
        
        pointsEarned += checkedCount * pointValue;
      });
    });
    
    const allBehaviors = step.substeps.flatMap(substep => 
      Object.values(substep.behaviors).flat()
    );
    
    if (allBehaviors.length === 0) {
      return { level: 'Not Evaluated', isManual: false, percentage: 0 };
    }
    
    // Calculate total possible points and thresholds
    let totalPossible = 0;
    Object.keys(levelCounts).forEach(levelName => {
      const levelData = frameworkData.levels.find(l => l.level_name.toLowerCase() === levelName);
      const pointValue = levelData ? levelData.point_value : 1;
      totalPossible += levelCounts[levelName] * pointValue;
    });
    
    // Sort levels by point value to establish hierarchy
    const sortedLevels = frameworkData.levels.sort((a, b) => a.point_value - b.point_value);
    
    // Calculate thresholds based on your exact logic
    let maxLearnerPoints = 0;
    let maxQualifiedPoints = 0;
    let maxExperiencedPoints = 0;
    let maxMasterPoints = 0;
    
    // Calculate max points for each level
    sortedLevels.forEach(level => {
      const levelName = level.level_name.toLowerCase();
      const count = levelCounts[levelName] || 0;
      const points = count * level.point_value;
      
      if (level.point_value === 1) maxLearnerPoints += points;
      else if (level.point_value === 2) maxQualifiedPoints += points;
      else if (level.point_value === 3) maxExperiencedPoints += points;
      else if (level.point_value === 4) maxMasterPoints += points;
    });
    
    // Define thresholds
    const learnerThreshold = { min: 0, max: maxLearnerPoints };
    const qualifiedThreshold = { min: maxLearnerPoints + 1, max: maxLearnerPoints + maxQualifiedPoints };
    const experiencedThreshold = { min: maxLearnerPoints + maxQualifiedPoints + 1, max: maxLearnerPoints + maxQualifiedPoints + maxExperiencedPoints };
    const masterThreshold = { min: maxLearnerPoints + maxQualifiedPoints + maxExperiencedPoints + 1, max: totalPossible };
    
    // Determine level based on points earned
    let level;
    if (pointsEarned === 0) {
      level = sortedLevels[0].level_name;
    } else if (pointsEarned >= masterThreshold.min) {
      level = sortedLevels.find(l => l.point_value === 4)?.level_name || sortedLevels[sortedLevels.length - 1].level_name;
    } else if (pointsEarned >= experiencedThreshold.min) {
      level = sortedLevels.find(l => l.point_value === 3)?.level_name || sortedLevels[Math.max(0, sortedLevels.length - 2)].level_name;
    } else if (pointsEarned >= qualifiedThreshold.min) {
      level = sortedLevels.find(l => l.point_value === 2)?.level_name || sortedLevels[Math.max(0, sortedLevels.length - 3)].level_name;
    } else {
      level = sortedLevels[0].level_name;
    }
    
    const percentage = totalPossible > 0 ? Math.round((pointsEarned / totalPossible) * 100) : 0;
    
    return { 
      level, 
      isManual: false, 
      percentage, 
      pointsEarned, 
      totalPossible,
      thresholds: {
        learner: learnerThreshold,
        qualified: qualifiedThreshold,
        experienced: experiencedThreshold,
        master: masterThreshold
      }
    };
  };

  const calculateSubstepProficiency = (substep) => {
    if (!frameworkData?.levels) return { level: 'Not Evaluated', percentage: 0 };
    
    const allBehaviors = Object.values(substep.behaviors).flat();
    if (allBehaviors.length === 0) return { level: 'Not Evaluated', percentage: 0 };
    
    let pointsEarned = 0;
    const levelCounts = {};
    
    // Initialize level counts
    frameworkData.levels.forEach(level => {
      levelCounts[level.level_name.toLowerCase()] = 0;
    });
    
    // Count behaviors by level and calculate points
    Object.keys(substep.behaviors).forEach(levelName => {
      const levelData = frameworkData.levels.find(l => l.level_name.toLowerCase() === levelName);
      const pointValue = levelData ? levelData.point_value : 1;
      
      const behaviors = substep.behaviors[levelName] || [];
      levelCounts[levelName] = behaviors.length;
      
      const checkedCount = behaviors.filter(behavior => checkedBehaviors.has(behavior.id)).length;
      pointsEarned += checkedCount * pointValue;
    });
    
    // Calculate total possible points and thresholds
    let totalPossible = 0;
    let maxLearnerPoints = 0;
    let maxQualifiedPoints = 0;
    let maxExperiencedPoints = 0;
    let maxMasterPoints = 0;
    
    Object.keys(levelCounts).forEach(levelName => {
      const levelData = frameworkData.levels.find(l => l.level_name.toLowerCase() === levelName);
      const pointValue = levelData ? levelData.point_value : 1;
      const count = levelCounts[levelName];
      const points = count * pointValue;
      
      totalPossible += points;
      
      if (pointValue === 1) maxLearnerPoints += points;
      else if (pointValue === 2) maxQualifiedPoints += points;
      else if (pointValue === 3) maxExperiencedPoints += points;
      else if (pointValue === 4) maxMasterPoints += points;
    });
    
    // Define thresholds using your exact logic
    const learnerThreshold = { min: 0, max: maxLearnerPoints };
    const qualifiedThreshold = { min: maxLearnerPoints + 1, max: maxLearnerPoints + maxQualifiedPoints };
    const experiencedThreshold = { min: maxLearnerPoints + maxQualifiedPoints + 1, max: maxLearnerPoints + maxQualifiedPoints + maxExperiencedPoints };
    const masterThreshold = { min: maxLearnerPoints + maxQualifiedPoints + maxExperiencedPoints + 1, max: totalPossible };
    
    // Sort levels by point value
    const sortedLevels = frameworkData.levels.sort((a, b) => a.point_value - b.point_value);
    
    // Determine level based on points earned
    let level;
    if (pointsEarned === 0) {
      level = sortedLevels[0].level_name;
    } else if (pointsEarned >= masterThreshold.min) {
      level = sortedLevels.find(l => l.point_value === 4)?.level_name || sortedLevels[sortedLevels.length - 1].level_name;
    } else if (pointsEarned >= experiencedThreshold.min) {
      level = sortedLevels.find(l => l.point_value === 3)?.level_name || sortedLevels[Math.max(0, sortedLevels.length - 2)].level_name;
    } else if (pointsEarned >= qualifiedThreshold.min) {
      level = sortedLevels.find(l => l.point_value === 2)?.level_name || sortedLevels[Math.max(0, sortedLevels.length - 3)].level_name;
    } else {
      level = sortedLevels[0].level_name;
    }
    
    const percentage = totalPossible > 0 ? Math.round((pointsEarned / totalPossible) * 100) : 0;
    
    return { 
      level, 
      percentage, 
      pointsEarned, 
      totalPossible,
      thresholds: {
        learner: learnerThreshold,
        qualified: qualifiedThreshold,
        experienced: experiencedThreshold,
        master: masterThreshold
      }
    };
  };

  // Calculate overall proficiency for spider graph
  const getOverallProficiency = () => {
    if (!frameworkData?.steps || !frameworkData?.levels) return 'Not Evaluated';
    
    const stepProficiencies = frameworkData.steps.map(step => {
      const stepProf = getStepProficiency(step);
      const levelData = frameworkData.levels.find(l => l.level_name === stepProf.level);
      return levelData ? levelData.point_value : 1;
    });
    
    const avgLevel = stepProficiencies.reduce((sum, level) => sum + level, 0) / stepProficiencies.length;
    const sortedLevels = frameworkData.levels.sort((a, b) => a.point_value - b.point_value);
    
    // Find the closest level to the average
    let closestLevel = sortedLevels[0];
    let minDiff = Math.abs(avgLevel - closestLevel.point_value);
    
    sortedLevels.forEach(level => {
      const diff = Math.abs(avgLevel - level.point_value);
      if (diff < minDiff) {
        minDiff = diff;
        closestLevel = level;
      }
    });
    
    return closestLevel.level_name;
  };

  const renderBehaviorGroup = (behaviors, levelName, substepId) => {
    const isEmpty = behaviors.length === 0;
    
    return (
      <div key={levelName} className="border-t border-gray-100 first:border-t-0">
        <div className={`text-xs font-bold uppercase tracking-wide px-3 py-2 ${getLevelHeaderClass(levelName)} ${isEmpty ? 'opacity-50' : ''}`}>
          {levelName} Level
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

  // Loading state
  if (loading) {
    return (
      <LayoutApp>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading framework data...</p>
          </div>
        </div>
      </LayoutApp>
    );
  }

  // Error state
  if (error) {
    return (
      <LayoutApp>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Framework</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </LayoutApp>
    );
  }

  // No framework data
  if (!frameworkData) {
    return (
      <LayoutApp>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">No framework data available</p>
          </div>
        </div>
      </LayoutApp>
    );
  }

  return (
    <LayoutApp>
      {/* Session Info Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="text-xs text-gray-600">Coach: {sessionData.coach}</div>
            <div className="text-sm font-semibold text-gray-900">Coachee: {sessionData.coachee}</div>
            <div className="text-xs text-gray-500">Framework: {frameworkData.framework.name}</div>
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
            {frameworkData.steps.map((step, index) => {
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
                          {frameworkData.levels.sort((a, b) => a.point_value - b.point_value).map(level => (
                            <option key={level.id} value={level.level_name}>{level.level_name}</option>
                          ))}
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
                            {/* Substep Header - Now Clickable */}
                            <div 
                              className="bg-gray-50 px-3 py-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => toggleSubstep(substep.id)}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-700 text-sm transition-transform duration-200" 
                                        style={{ transform: expandedSubsteps.has(substep.id) ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                    ❯
                                  </span>
                                  <span className="font-medium text-sm text-gray-800">{substep.title}</span>
                                </div>
                                <span className="text-xs text-gray-600">
                                  Auto: {substepProf.level} ({substepProf.percentage}% - {substepProf.pointsEarned || 0}/{substepProf.totalPossible || 0}pts)
                                </span>
                              </div>
                            </div>
                            
                            {/* Behavior Groups - Now Collapsible */}
                            {expandedSubsteps.has(substep.id) && (
                              <div className="divide-y divide-gray-100">
                                {Object.keys(substep.behaviors).map(levelName => 
                                  renderBehaviorGroup(substep.behaviors[levelName] || [], levelName, substep.id)
                                )}
                              </div>
                            )}
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

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <Button variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={showAutoSave} className="flex-1">
            Save Draft
          </Button>
          <Button className="flex-1 bg-green-600 hover:bg-green-700">
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