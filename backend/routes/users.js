// Create new user
router.post('/', async (req, res) => {
  const { name, email, password_hash, system_role } = req.body;

  if (!name || !email || !password_hash || !system_role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, password_hash, system_role }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data[0]);
});

module.exports = router;
