// SpiderGraph.js - Reusable Spider Graph Component
import React from 'react';

const SpiderGraph = ({ 
  steps, 
  getStepProficiency, 
  frameworkLevels,
  size = 400,
  className = ""
}) => {
  // Make responsive - use smaller size on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const graphSize = isMobile ? Math.min(size, 300) : size;
  const center = graphSize / 2;
  const maxRadius = graphSize * 0.28; // 28% of size for responsive scaling
  const stepCount = steps.length;
  
  // Calculate points for each step
  const stepPoints = steps.map((step, index) => {
    const stepProf = getStepProficiency(step);
    
    // Convert level name to point value using framework levels
    const levelData = frameworkLevels?.find(l => 
      l.level_name.toLowerCase() === stepProf.level.toLowerCase()
    );
    const levelValue = levelData ? levelData.point_value : 1;
    
    const angle = (index * 2 * Math.PI) / stepCount - Math.PI / 2;
    const radius = (levelValue / 4) * maxRadius; // Assuming max level is 4
    
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      labelX: center + (maxRadius + 40) * Math.cos(angle),
      labelY: center + (maxRadius + 40) * Math.sin(angle),
      title: step.title,
      level: stepProf.level,
      levelValue,
      angle
    };
  });

  // Create benchmark points (Level 3 = Experienced)
  const benchmarkPoints = steps.map((step, index) => {
    const angle = (index * 2 * Math.PI) / stepCount - Math.PI / 2;
    const radius = (3 / 4) * maxRadius; // Level 3 out of 4
    
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  });

  // Calculate overall proficiency level
  const getOverallProficiency = () => {
    const stepLevelValues = stepPoints.map(point => point.levelValue);
    const avgLevel = stepLevelValues.reduce((sum, level) => sum + level, 0) / stepLevelValues.length;
    
    // Find closest level name
    const sortedLevels = frameworkLevels?.sort((a, b) => a.point_value - b.point_value) || [];
    let closestLevel = sortedLevels[0];
    let minDiff = Math.abs(avgLevel - (closestLevel?.point_value || 1));
    
    sortedLevels.forEach(level => {
      const diff = Math.abs(avgLevel - level.point_value);
      if (diff < minDiff) {
        minDiff = diff;
        closestLevel = level;
      }
    });
    
    return closestLevel?.level_name || 'Not Evaluated';
  };

  const getProficiencyBadgeClass = (level) => {
    const levelLower = level.toLowerCase();
    if (levelLower.includes('learner') || levelLower.includes('basic')) return 'bg-blue-100 text-blue-800 border-blue-500';
    if (levelLower.includes('qualified') || levelLower.includes('intermediate')) return 'bg-orange-100 text-orange-800 border-orange-500';
    if (levelLower.includes('experienced') || levelLower.includes('advanced')) return 'bg-green-100 text-green-800 border-green-500';
    if (levelLower.includes('master') || levelLower.includes('expert')) return 'bg-purple-100 text-purple-800 border-purple-500';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const overallProficiency = getOverallProficiency();

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      {/* Overall Proficiency Header */}
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills Overview</h3>
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600">Overall Proficiency:</span>
          <span className={`px-3 py-1 rounded text-sm font-medium border ${getProficiencyBadgeClass(overallProficiency)}`}>
            {overallProficiency}
          </span>
        </div>
      </div>

      {/* Spider Graph SVG */}
      <svg 
        width={graphSize} 
        height={graphSize} 
        className="bg-white overflow-visible"
        viewBox={`0 0 ${graphSize} ${graphSize}`}
      >
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
        {steps.map((_, index) => {
          const angle = (index * 2 * Math.PI) / stepCount - Math.PI / 2;
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
        
        {/* Step labels - Responsive positioning */}
        {stepPoints.map((point, index) => {
          // Adjust text anchor based on position for better readability
          let textAnchor = 'middle';
          if (point.labelX > center + 10) textAnchor = 'start';
          else if (point.labelX < center - 10) textAnchor = 'end';
          
          return (
            <text
              key={index}
              x={point.labelX}
              y={point.labelY}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              className="text-xs font-medium fill-gray-700"
              style={{ fontSize: isMobile ? '10px' : '12px' }}
            >
              {/* Truncate long titles on mobile */}
              {isMobile && point.title.length > 15 
                ? point.title.substring(0, 12) + '...' 
                : point.title
              }
            </text>
          );
        })}

        {/* Level indicators at center */}
        <text
          x={center}
          y={center - maxRadius - 15}
          textAnchor="middle"
          className="text-xs fill-gray-500"
        >
          4 (Master)
        </text>
        <text
          x={center}
          y={center - (maxRadius * 0.75) - 5}
          textAnchor="middle"
          className="text-xs fill-gray-500"
        >
          3
        </text>
        <text
          x={center}
          y={center - (maxRadius * 0.5) - 5}
          textAnchor="middle"
          className="text-xs fill-gray-500"
        >
          2
        </text>
        <text
          x={center}
          y={center - (maxRadius * 0.25) - 5}
          textAnchor="middle"
          className="text-xs fill-gray-500"
        >
          1
        </text>
      </svg>
      
      {/* Legend */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-sm opacity-60"></div>
          <span className="text-xs sm:text-sm">Current Performance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-300 border-dashed rounded-sm bg-blue-100"></div>
          <span className="text-xs sm:text-sm">Benchmark (Level 3)</span>
        </div>
      </div>
    </div>
  );
};

export default SpiderGraph;