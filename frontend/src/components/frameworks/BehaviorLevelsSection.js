"use client";

import { Plus } from "lucide-react";

export default function BehaviorLevelsSection({ levels, setLevels }) {
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