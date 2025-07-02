// src/app/admin/frameworks/view/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Download, Edit } from "lucide-react";

export default function ViewFrameworkPage() {
  const params = useParams();
  const router = useRouter();
  const frameworkId = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [framework, setFramework] = useState(null);
  const [levels, setLevels] = useState([]);
  const [steps, setSteps] = useState([]);
  const [expandedSteps, setExpandedSteps] = useState({});

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
      
      // Ensure substeps and behaviors are arrays for safety
      const processedSteps = (data.steps || []).map(step => ({
        ...step,
        substeps: (step.substeps || []).map(substep => ({
          ...substep,
          behaviors: substep.behaviors || []
        }))
      }));

      setFramework(data.framework);
      setLevels(data.levels);
      setSteps(processedSteps);

      console.log('Framework loaded for viewing:', data);
    } catch (error) {
      console.error('Error fetching framework:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleStep = (stepId) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading framework...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Hide non-print elements */
          .no-print { display: none !important; }
          
          /* Page structure and background */
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          .print-page {
            margin: 0;
            padding: 15px !important;
            background: white !important;
          }
          .print-break { page-break-before: always; }
          
          /* Force all collapsible content to be displayed */
          .print-force-display {
            display: block !important;
          }

          /* Ensure colors and backgrounds print correctly */
          .print-header-orange,
          .print-header-green,
          .print-color-blue,
          .print-text-blue {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-header-orange {
            background: #f97316 !important;
            color: white !important;
          }
          
          .print-header-green {
            background: #059669 !important;
            color: white !important;
          }
          
          .print-color-blue {
            background: #3b82f6 !important;
          }
          
          .print-text-blue {
            color: #1d4ed8 !important;
          }

          /* Remove shadows and effects for print, ensure borders */
          .print-clean {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }

          /* Framework Header Adjustments */
          .framework-header {
            margin-bottom: 20px !important;
          }
          
          /* Make framework title bigger and reduce top margin */
          .framework-header h1 {
            font-size: 2.5rem !important;
            margin-bottom: 15px !important;
            margin-top: 0 !important;
          }
          
          /* Reduce margins above framework header */
          .max-w-6xl.mx-auto.px-6.py-8 {
            padding-top: 10px !important;
            padding-bottom: 15px !important;
            padding-left: 15px !important;
            padding-right: 15px !important;
          }

          /* Force proficiency levels to single row */
          .proficiency-levels-grid {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 10px !important;
          }
          
          /* Adjust level card sizing for single row */
          .proficiency-level-card {
            padding: 8px !important;
            text-align: center !important;
          }
          
          .proficiency-level-card h4 {
            font-size: 0.9rem !important;
            margin-bottom: 5px !important;
          }
          
          .proficiency-level-card .level-indicator {
            font-size: 0.75rem !important;
          }
          
          .proficiency-level-card .points-badge {
            font-size: 0.7rem !important;
            padding: 2px 6px !important;
          }

          /* General text size adjustments */
          h1 { font-size: 2.5rem !important; }
          h2 { font-size: 1.3rem !important; }
          h3 { font-size: 1.1rem !important; }
          h4 { font-size: 1rem !important; }
          h5 { font-size: 0.9rem !important; }
          p, span, div, li { font-size: 0.85rem !important; }

          /* Reduce section spacing */
          .mb-8 {
            margin-bottom: 15px !important;
          }
          .mb-6 {
            margin-bottom: 10px !important;
          }
          .mb-4 {
            margin-bottom: 8px !important;
          }
          .mb-3 {
            margin-bottom: 6px !important;
          }
          .mb-2 {
            margin-bottom: 4px !important;
          }

          /* Adjust padding within sections */
          .p-6 {
            padding: 12px !important;
          }
          .p-4 {
            padding: 8px !important;
          }
          .p-3 {
            padding: 6px !important;
          }
          .px-6.py-4 {
            padding: 8px 12px !important;
          }

          /* Make behavior lists more compact */
          .space-y-3 > div {
            margin-top: 6px !important;
            margin-bottom: 6px !important;
          }
          .space-y-1 li {
            margin-top: 2px !important;
            margin-bottom: 2px !important;
          }

          /* Compact bullet points */
          ul.space-y-1 {
            padding-left: 12px !important;
          }
          ul.space-y-1 li .w-1\\.5.h-1\\.5 {
            margin-top: 4px !important;
            margin-right: 6px !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 print:bg-white print-page">
        {/* Header - Hidden on Print */}
        <div className="no-print bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/frameworks')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Frameworks
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Framework View</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={() => router.push(`/admin/frameworks/edit/${frameworkId}`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                Edit Framework
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8 print:px-0 print:py-0">
          
          {/* Framework Header */}
          <div className="mb-8 framework-header">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{framework.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Version {framework.version}</span>
                  <span>•</span>
                  <span>Created {formatDate(framework.created_at)}</span>
                  {framework.is_active && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {framework.description && (
              <div className="bg-blue-50 p-4 rounded-lg print-clean">
                <h3 className="font-medium text-blue-900 mb-2">Description</h3>
                <p className="text-blue-800">{framework.description}</p>
              </div>
            )}
          </div>

          {/* Proficiency Levels */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden print-clean">
              <div className="px-6 py-4 bg-orange-500 text-white print-header-orange">
                <h2 className="text-lg font-semibold font-lato">Proficiency Levels</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 proficiency-levels-grid">
                  {levels.map((level, index) => (
                    <div key={level.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center print-clean proficiency-level-card">
                      <div className="flex items-center justify-center gap-2 mb-3 level-indicator">
                        <div 
                          className="w-4 h-4 rounded-full print-color-blue"
                          style={{ backgroundColor: level.color || '#3B82F6' }}
                        ></div>
                        <span className="text-sm font-medium text-gray-600">Level {index + 1}</span>
                      </div>
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">{level.name}</h4>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium points-badge">
                        {level.points} points
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Framework Structure */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden print-clean">
              <div className="px-6 py-4 bg-green-600 text-white print-header-green">
                <h2 className="text-lg font-semibold font-lato">Framework Structure</h2>
              </div>
              <div className="p-6">
                {steps.map((step, stepIndex) => {
                  const isStepExpanded = expandedSteps[step.id];
                  return (
                    <div key={step.id} className="mb-6 border border-gray-300 rounded bg-white print-clean">
                      {/* Step Header */}
                      <div 
                        className="flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 print-no-hover"
                        onClick={() => toggleStep(step.id)}
                      >
                        <div>
                          <h3 className="font-semibold text-lg font-lato">
                            Step {stepIndex + 1}: {step.name}
                          </h3>
                          <p className="text-sm text-gray-600 font-lato">
                            {step.substeps?.length || 0} substeps, {' '}
                            {step.substeps?.reduce((total, sub) => total + (sub.behaviors?.length || 0), 0)} behaviors
                          </p>
                        </div>
                        <div className="text-gray-400 text-xl no-print">
                          {isStepExpanded ? '−' : '+'}
                        </div>
                      </div>

                      {/* Sub-steps (Show in print regardless of expanded state) */}
                      <div className={`p-4 ${!isStepExpanded ? 'hidden' : ''} print-force-display`}>
                        {step.substeps && step.substeps.length > 0 ? (
                          <div className="space-y-3">
                            {step.substeps.map((substep, substepIndex) => {
                              const isSubstepExpanded = expandedSteps[`${step.id}-${substep.id}`];
                              return (
                                <div key={substep.id} className="border border-gray-200 rounded bg-white print-clean">
                                  {/* Substep Header */}
                                  <div 
                                    className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 print-no-hover"
                                    onClick={() => setExpandedSteps(prev => ({
                                      ...prev,
                                      [`${step.id}-${substep.id}`]: !prev[`${step.id}-${substep.id}`]
                                    }))}
                                  >
                                    <h4 className="font-medium text-lg font-lato">
                                      {stepIndex + 1}.{substepIndex + 1} {substep.name}
                                    </h4>
                                    <div className="text-gray-400 no-print">
                                      {isSubstepExpanded ? '−' : '+'}
                                    </div>
                                  </div>

                                  {/* Behaviors (Show in print regardless of expanded state) */}
                                  <div className={`p-3 space-y-3 ${!isSubstepExpanded ? 'hidden' : ''} print-force-display`}>
                                    {levels.map(level => {
                                      const levelBehaviors = substep.behaviors?.filter(b => b.levelId === level.id) || [];
                                      if (levelBehaviors.length === 0) return null;

                                      return (
                                        <div key={level.id}>
                                          <h5 className="font-medium text-sm text-blue-700 mb-2 print-text-blue">
                                            {level.name} ({level.points} points)
                                          </h5>
                                          <ul className="space-y-1 ml-4">
                                            {levelBehaviors.map(behavior => (
                                              <li key={behavior.id} className="text-gray-700 text-sm flex items-start">
                                                <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0 print-color-blue"></span>
                                                {behavior.description}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      );
                                    })}

                                    {(!substep.behaviors || substep.behaviors.length === 0) && (
                                      <div className="text-center py-2 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded print-clean">
                                        No behaviors defined for this substep
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 bg-gray-50 rounded border-2 border-dashed border-gray-300 print-clean">
                            <p className="font-lato">No sub-steps defined yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {steps.length === 0 && (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 print-clean">
                    <p>No steps defined in this framework</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 mt-8 no-print">
            <div className="text-center text-sm text-gray-500">
              <p>SalesCoach Framework • Generated on {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}