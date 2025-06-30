"use client";
import { useState } from 'react';

export default function BehaviorLevelsSection({ levels, setLevels }) {
  const [editingId, setEditingId] = useState(null);

  const addLevel = () => {
    const newLevel = {
      id: Date.now(), // Temporary ID
      name: `Level ${levels.length + 1}`,
      description: '',
      points: levels.length + 1,
      isNew: true
    };
    setLevels([...levels, newLevel]);
    setEditingId(newLevel.id);
  };

  const updateLevel = (id, field, value) => {
    setLevels(levels.map(level => 
      level.id === id ? { ...level, [field]: value } : level
    ));
  };

  const deleteLevel = (id) => {
    if (confirm('Delete this level? This will affect all associated behaviors.')) {
      setLevels(levels.filter(level => level.id !== id));
    }
  };

  const handleKeyDown = (e, id, field) => {
    if (e.key === 'Enter') {
      e.target.blur();
      setEditingId(null);
      // Save to backend here
      saveLevelToBackend(id);
    }
  };

  const saveLevelToBackend = async (id) => {
    const level = levels.find(l => l.id === id);
    // API call implementation would go here
    console.log('Saving level:', level);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {levels.map((level) => (
          <div key={level.id} className="relative p-3 bg-gray-50 border border-gray-200 rounded-lg group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={() => setEditingId(level.id)}
                className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Edit
              </button>
              <button
                onClick={() => deleteLevel(level.id)}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
            
            <input
              className="w-full bg-transparent border-none font-semibold text-gray-900 mb-2 focus:bg-white focus:border focus:border-blue-500 focus:rounded px-1 font-inter"
              value={level.name}
              onChange={(e) => updateLevel(level.id, 'name', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, level.id, 'name')}
              onFocus={() => setEditingId(level.id)}
            />
            <input
              className="w-full bg-transparent border-none text-sm text-gray-600 focus:bg-white focus:border focus:border-blue-500 focus:rounded px-1 font-inter"
              value={level.description}
              placeholder="Enter description..."
              onChange={(e) => updateLevel(level.id, 'description', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, level.id, 'description')}
              onFocus={() => setEditingId(level.id)}
            />
          </div>
        ))}
      </div>
      <button
        onClick={addLevel}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-inter"
      >
        + Add Level
      </button>
    </div>
  );
}