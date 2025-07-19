const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const fs = require('fs');
const path = require('path');

router.get('/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  console.log('🧪 === SESSIONREPORTS TEST - ROUTE HIT ===');
  console.log('🧪 Session ID:', sessionId);
  console.log('🧪 Request path:', req.path);
  console.log('🧪 Full URL:', req.url);
  
  try {
    // Get session data including coachee name and session date
    console.log('🧪 Checking database for session...');
    const { data: session, error } = await supabase
      .from('coaching_sessions')
      .select(`
        report_pdf_path, 
        status, 
        session_date,
        coachee:users!coachee_id(name)
      `)
      .eq('id', sessionId)
      .single();

    console.log('🧪 Database result:', {
      hasSession: !!session,
      hasPath: !!session?.report_pdf_path,
      status: session?.status,
      coacheeName: session?.coachee?.name,
      sessionDate: session?.session_date,
      path: session?.report_pdf_path
    });

    if (error) {
      console.log('🧪 Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!session?.report_pdf_path) {
      console.log('🧪 No PDF path found');
      return res.status(404).json({ error: 'No PDF found' });
    }

    // Check if file exists
    const pdfPath = session.report_pdf_path;
    console.log('🧪 Checking file existence:', pdfPath);
    
    if (!fs.existsSync(pdfPath)) {
      console.log('🧪 File does not exist');
      return res.status(404).json({ error: 'PDF file not found' });
    }

    console.log('🧪 File exists, attempting to serve...');
    
    // Generate custom filename
    const coacheeName = session.coachee?.name || 'Unknown';
    const sessionDate = session.session_date || 'Unknown-Date';
    
    // Format filename - remove spaces and special characters for file safety
    const safeCoacheeName = coacheeName.replace(/[^a-zA-Z0-9]/g, '-');
    const safeSessionDate = sessionDate.replace(/[^a-zA-Z0-9-]/g, '-');
    
    const customFilename = `Coaching-Session-Report-${safeCoacheeName}-${safeSessionDate}.pdf`;
    
    console.log('🧪 Generated filename:', customFilename);
    
    // Set headers with custom filename - using more robust format
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Try both filename formats for better browser compatibility
    const encodedFilename = encodeURIComponent(customFilename);
    res.setHeader('Content-Disposition', `attachment; filename="${customFilename}"; filename*=UTF-8''${encodedFilename}`);
    
    console.log('🧪 Content-Disposition header set to:', res.getHeader('Content-Disposition'));
    
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);
    fileStream.pipe(res);
    
    fileStream.on('end', () => {
      console.log('🧪 File served successfully with filename:', customFilename);
    });
    
    fileStream.on('error', (err) => {
      console.log('🧪 File stream error:', err);
    });

  } catch (error) {
    console.log('🧪 Catch block error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;