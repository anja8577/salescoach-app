// backend/routes/frameworks.js - UPDATED VERSION
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/frameworks - List all frameworks (existing)
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

// GET /api/frameworks/tenant/:tenantId/list - List frameworks for tenant with stats
router.get('/tenant/:tenantId/list', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const { data: frameworks, error } = await supabase
      .from('sales_frameworks')
      .select(`
        *,
        framework_steps(count),
        framework_behaviors(count)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(frameworks);
  } catch (error) {
    console.error('Error fetching tenant frameworks:', error);
    res.status(500).json({ error: 'Failed to fetch frameworks' });
  }
});

// NEW: GET /api/frameworks/:id - Get single framework with full structure
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get framework basic info
    const { data: framework, error: frameworkError } = await supabase
      .from('sales_frameworks')
      .select('*')
      .eq('id', id)
      .single();

    if (frameworkError) throw frameworkError;

    // Get levels
    const { data: levels, error: levelsError } = await supabase
      .from('behavior_levels')
      .select('*')
      .eq('framework_id', id)
      .order('display_order');

    if (levelsError) throw levelsError;

    // Get steps with substeps and behaviors
    const { data: steps, error: stepsError } = await supabase
      .from('framework_steps')
      .select(`
        *,
        framework_substeps (
          *,
          framework_behaviors (*)
        )
      `)
      .eq('framework_id', id)
      .order('step_number');

    if (stepsError) throw stepsError;

    // Transform the data to match frontend expectations
    const transformedSteps = steps.map(step => ({
      id: step.id,
      name: step.name,
      position: step.step_number,
      substeps: (step.framework_substeps || []).map(substep => ({
        id: substep.id,
        name: substep.name,
        position: substep.position || 1,
        behaviors: (substep.framework_behaviors || []).map(behavior => ({
          id: behavior.id,
          description: behavior.description,
          behavior_level_id: behavior.level_id, // Map level_id to behavior_level_id
          levelId: behavior.level_id // Also include levelId for compatibility
        }))
      }))
    }));

    // Transform levels to include color and match frontend format
    const transformedLevels = levels.map(level => ({
      id: level.id,
      name: level.level_name,
      points: level.point_value,
      color: level.color || '#3B82F6' // Default color if not set
    }));

    res.json({
      framework,
      levels: transformedLevels,
      steps: transformedSteps
    });

  } catch (error) {
    console.error('Error fetching framework:', error);
    res.status(500).json({ error: 'Failed to fetch framework' });
  }
});

// NEW: PUT /api/frameworks/:id - Update existing framework (FIXED DELETION ORDER)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, levels, steps } = req.body;

    console.log('=== UPDATE FRAMEWORK DEBUG ===');
    console.log('Framework ID:', id);
    console.log('Updating framework name:', name);
    console.log('Levels received:', levels?.length);
    console.log('Steps received:', steps?.length);

    // 1. Update the framework basic info
    const { data: updatedFramework, error: frameworkError } = await supabase
      .from('sales_frameworks')
      .update({
        name,
        description
      })
      .eq('id', id)
      .select()
      .single();

    if (frameworkError) {
      console.error('Framework update error:', frameworkError);
      throw frameworkError;
    }

    console.log('Framework basic info updated successfully');

    // 2. DELETE IN CORRECT ORDER (respecting foreign key constraints)
    
    // Step 1: Delete behaviors first (they reference levels and substeps)
    const { error: deleteBehaviorsError } = await supabase
      .from('framework_behaviors')
      .delete()
      .eq('framework_id', id);

    if (deleteBehaviorsError) {
      console.error('Delete behaviors error:', deleteBehaviorsError);
      throw deleteBehaviorsError;
    }
    console.log('Existing behaviors deleted');

    // Step 2: Delete substeps (they reference steps)
    const { error: deleteSubstepsError } = await supabase
      .from('framework_substeps')
      .delete()
      .eq('framework_id', id);

    if (deleteSubstepsError) {
      console.error('Delete substeps error:', deleteSubstepsError);
      throw deleteSubstepsError;
    }
    console.log('Existing substeps deleted');

    // Step 3: Delete steps (they reference framework)
    const { error: deleteStepsError } = await supabase
      .from('framework_steps')
      .delete()
      .eq('framework_id', id);

    if (deleteStepsError) {
      console.error('Delete steps error:', deleteStepsError);
      throw deleteStepsError;
    }
    console.log('Existing steps deleted');

    // Step 4: Delete levels last (they're referenced by behaviors, which we already deleted)
    const { error: deleteLevelsError } = await supabase
      .from('behavior_levels')
      .delete()
      .eq('framework_id', id);

    if (deleteLevelsError) {
      console.error('Delete levels error:', deleteLevelsError);
      throw deleteLevelsError;
    }
    console.log('Existing levels deleted');

    // 3. RECREATE IN CORRECT ORDER

    // Step 1: Create new levels first (they'll be referenced by behaviors)
    const levelsToInsert = levels.map((level, index) => ({
      framework_id: id,
      level_name: level.name,
      point_value: level.points,
      display_order: index + 1,
      color: level.color
    }));

    const { data: savedLevels, error: levelsError } = await supabase
      .from('behavior_levels')
      .insert(levelsToInsert)
      .select();

    if (levelsError) {
      console.error('Insert levels error:', levelsError);
      throw levelsError;
    }
    console.log('New levels created:', savedLevels.length);

    // Step 2: Create steps, substeps, and behaviors
    for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
      const step = steps[stepIndex];
      
      console.log(`Processing step ${stepIndex + 1}:`, step.name);

      const { data: savedStep, error: stepError } = await supabase
        .from('framework_steps')
        .insert({
          framework_id: id,
          name: step.name,
          step_number: step.position || (stepIndex + 1),
          tenant_id: updatedFramework.tenant_id
        })
        .select()
        .single();

      if (stepError) {
        console.error(`Step ${stepIndex + 1} creation error:`, stepError);
        throw stepError;
      }

      console.log(`Step ${stepIndex + 1} created with ID:`, savedStep.id);

      // Create substeps for this step
      if (step.substeps && step.substeps.length > 0) {
        console.log(`Processing ${step.substeps.length} substeps for step ${stepIndex + 1}`);
        
        for (let substepIndex = 0; substepIndex < step.substeps.length; substepIndex++) {
          const substep = step.substeps[substepIndex];
          
          console.log(`  Processing substep ${substepIndex + 1}:`, substep.name);

          const { data: savedSubstep, error: substepError } = await supabase
            .from('framework_substeps')
            .insert({
              step_id: savedStep.id,
              name: substep.name,
              framework_id: id,
              tenant_id: updatedFramework.tenant_id
            })
            .select()
            .single();

          if (substepError) {
            console.error(`Substep ${substepIndex + 1} creation error:`, substepError);
            throw substepError;
          }

          console.log(`  Substep ${substepIndex + 1} created with ID:`, savedSubstep.id);

          // Create behaviors for this substep
          if (substep.behaviors && substep.behaviors.length > 0) {
            console.log(`  Processing ${substep.behaviors.length} behaviors for substep ${substepIndex + 1}`);
            
            const behaviorsToInsert = substep.behaviors.map((behavior, behaviorIndex) => {
              // Find the corresponding saved level ID by matching names
              const originalLevel = levels.find(l => l.id === behavior.behavior_level_id);
              const savedLevel = savedLevels.find(level => 
                level.level_name === originalLevel?.name
              );

              if (!savedLevel) {
                console.warn(`Warning: Could not find level for behavior ${behaviorIndex + 1}:`, behavior.behavior_level_id);
                console.warn('Original level:', originalLevel);
                console.warn('Available saved levels:', savedLevels.map(l => ({ id: l.id, name: l.level_name })));
              }

              return {
                framework_id: id,
                substep_id: savedSubstep.id,
                level_id: savedLevel?.id,
                description: behavior.description,
                tenant_id: updatedFramework.tenant_id
              };
            });

            console.log(`  Behaviors to insert:`, behaviorsToInsert);

            const { error: behaviorsError } = await supabase
              .from('framework_behaviors')
              .insert(behaviorsToInsert);

            if (behaviorsError) {
              console.error(`Behaviors creation error for substep ${substepIndex + 1}:`, behaviorsError);
              throw behaviorsError;
            }

            console.log(`  ${behaviorsToInsert.length} behaviors created for substep ${substepIndex + 1}`);
          } else {
            console.log(`  No behaviors to create for substep ${substepIndex + 1}`);
          }
        }
      } else {
        console.log(`No substeps to create for step ${stepIndex + 1}`);
      }
    }

    console.log('=== FRAMEWORK UPDATE COMPLETED SUCCESSFULLY ===');
    res.json({ 
      id: updatedFramework.id, 
      message: 'Framework updated successfully',
      framework: updatedFramework 
    });

  } catch (error) {
    console.error('=== FRAMEWORK UPDATE FAILED ===');
    console.error('Error updating framework:', error);
    res.status(500).json({ 
      error: 'Failed to update framework', 
      details: error.message 
    });
  }
});
// POST /api/frameworks - Create new framework (existing - keep as is)
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
          step_number: step.position,
          tenant_id: 'cd663ebb-a679-4841-88b0-afe1eb13bec8'
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
              step_id: savedStep.id,
              name: subStep.name,
              framework_id: framework.id,
              tenant_id: 'cd663ebb-a679-4841-88b0-afe1eb13bec8'
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
                framework_id: framework.id,
                substep_id: savedSubStep.id,
                level_id: savedLevel?.id,
                description: behavior.description,
                tenant_id: 'cd663ebb-a679-4841-88b0-afe1eb13bec8'
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