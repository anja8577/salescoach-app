// Backend routes for Tenant, Framework creation and retrieval using Express

const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { v4: uuidv4 } = require('uuid');

// Route to create a new tenant
router.post('/tenants', async (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: 'Tenant name is required' });

  const { data, error } = await supabase
    .from('tenants')
    .insert([{ id: uuidv4(), name }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data[0]);
});

// Route to create a new framework for a tenant
router.post('/sales-frameworks', async (req, res) => {
  const { tenant_id, name, language, use_default_levels } = req.body;

  if (!tenant_id || !name) return res.status(400).json({ error: 'tenant_id and framework name are required' });

  const frameworkId = uuidv4();
  const { data: framework, error } = await supabase
    .from('sales_frameworks')
    .insert([{ id: frameworkId, tenant_id, name, language: language || 'en', is_builtin: false }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  if (use_default_levels) {
    const { data: globalLevels, error: levelError } = await supabase
      .from('behavior_levels')
      .select()
      .is('framework_id', null);

    if (levelError) return res.status(500).json({ error: levelError.message });

    const levelsToInsert = globalLevels.map(level => ({
      id: uuidv4(),
      framework_id: frameworkId,
      level_name: level.level_name,
      point_value: level.point_value,
      display_order: level.display_order
    }));

    const { error: insertError } = await supabase
      .from('behavior_levels')
      .insert(levelsToInsert);

    if (insertError) return res.status(500).json({ error: insertError.message });
  }

  res.status(201).json(framework[0]);
});

// Route to get frameworks for a tenant
router.get('/sales-frameworks', async (req, res) => {
  const { tenant_id } = req.query;

  if (!tenant_id) return res.status(400).json({ error: 'tenant_id is required' });

  const { data, error } = await supabase
    .from('sales_frameworks')
    .select()
    .eq('tenant_id', tenant_id);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// Route to get steps for a framework
router.get('/framework-steps', async (req, res) => {
  const { framework_id } = req.query;

  if (!framework_id) return res.status(400).json({ error: 'framework_id is required' });

  const { data, error } = await supabase
    .from('framework_steps')
    .select()
    .eq('framework_id', framework_id)
    .order('step_number');

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// Route to get substeps for a framework
router.get('/framework-substeps', async (req, res) => {
  const { framework_id } = req.query;

  if (!framework_id) return res.status(400).json({ error: 'framework_id is required' });

  const { data, error } = await supabase
    .from('framework_substeps')
    .select()
    .eq('framework_id', framework_id);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// Route to get behaviors for a framework
router.get('/framework-behaviors', async (req, res) => {
  const { framework_id } = req.query;

  if (!framework_id) return res.status(400).json({ error: 'framework_id is required' });

  const { data, error } = await supabase
    .from('framework_behaviors')
    .select()
    .eq('framework_id', framework_id);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

module.exports = router;
