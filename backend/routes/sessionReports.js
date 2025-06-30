const express = require('express');
const router = express.Router();

router.get('/:sessionId', (req, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from('%PDF-1.4 Dummy PDF content...'));
});

module.exports = router;
