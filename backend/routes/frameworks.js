// backend/routes/frameworks.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/frameworks - List all frameworks
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sales_frameworks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching frameworks:', error);
    res.status(500).json({ error: 'Failed to fetch frameworks' });
  }
});

// POST /api/frameworks - Create new framework
router.post('/', async (req, res) => {
  try {
    const { name, description, levels, steps } = req.body;

    console.log('Received framework data:', { name, description, levels: levels?.length, steps: steps?.length });

    // 1. Create the framework
    const { data: framework, error: frameworkError } = await supabase
      .from('sales_frameworks')
      .insert({
        name,
        description,
        tenant_id: 'cd663ebb-a679-4841-88b0-afe1eb13bec8' // TODO: Get from authenticated user
      })
      .select()
      .single();

    if (frameworkError) throw frameworkError;

    console.log('Created framework:', framework);

    // 2. Create behavior levels
const levelsToInsert = levels.map((level, index) => ({
  framework_id: framework.id,
  level_name: level.name,
  point_value: level.points,
  display_order: index + 1
}));

const { data: savedLevels, error: levelsError } = await supabase
  .from('behavior_levels')
  .insert(levelsToInsert)
  .select();

if (levelsError) throw levelsError;

console.log('Created levels:', savedLevels);

    // 3. Create steps and sub-steps
    for (const step of steps) {
    const { data: savedStep, error: stepError } = await supabase
      .from('framework_steps')
      .insert({
        framework_id: framework.id,
        name: step.name,
        step_number: step.position,     // ← Fixed
        tenant_id: 'cd663ebb-a679-4841-88b0-afe1eb13bec8'  // ← Added (required)
  })
        .select()
        .single();

      if (stepError) throw stepError;

      // 4. Create sub-steps for this step
      if (step.subSteps && step.subSteps.length > 0) {
        for (const subStep of step.subSteps) {
          const { data: savedSubStep, error: subStepError } = await supabase
  .from('framework_substeps')
  .insert({
    step_id: savedStep.id,                               // ← Fixed
    name: subStep.name,
    framework_id: framework.id,                          // ← Added (required in your table)
    tenant_id: 'cd663ebb-a679-4841-88b0-afe1eb13bec8'   // ← Added (required in your table)
  })
            .select()
            .single();

          if (subStepError) throw subStepError;

          // 5. Create behaviors for this sub-step
          if (subStep.behaviors && subStep.behaviors.length > 0) {
            const behaviorsToInsert = subStep.behaviors.map(behavior => {
  // Find the corresponding saved level ID
  const savedLevel = savedLevels.find(level => 
    level.level_name === levels.find(l => l.id === behavior.behavior_level_id)?.name
  );

  return {
    framework_id: framework.id,                          // ← Added (required)
    substep_id: savedSubStep.id,                         // ← Fixed (was framework_substep_id)
    level_id: savedLevel?.id,                            // ← Fixed (was behavior_level_id)  
    description: behavior.description,
    tenant_id: 'cd663ebb-a679-4841-88b0-afe1eb13bec8'   // ← Added (required)
  };
});

            const { error: behaviorsError } = await supabase
              .from('framework_behaviors')
              .insert(behaviorsToInsert);

            if (behaviorsError) throw behaviorsError;
          }
        }
      }
    }

    console.log('Framework created successfully!');
    res.status(201).json({ 
      id: framework.id, 
      message: 'Framework created successfully',
      framework 
    });

  } catch (error) {
    console.error('Error creating framework:', error);
    res.status(500).json({ 
      error: 'Failed to create framework', 
      details: error.message 
    });
  }
});

module.exports = router;