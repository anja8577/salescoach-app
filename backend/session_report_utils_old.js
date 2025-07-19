// Utility to generate PDF reports for coaching sessions
// Uses pdfkit (to be added to dependencies)
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a PDF report for a coaching session and save to disk.
 * @param {Object} sessionData - All session data (session, notes, scores, etc.)
 * @param {string} outputDir - Directory to save the PDF
 * @returns {Promise<string>} - Resolves to the PDF file path
 */
async function generateSessionReportPDF(sessionData, outputDir) {
  return new Promise((resolve, reject) => {
    const fileName = `session_report_${sessionData.id}.pdf`;
    const filePath = path.join(outputDir, fileName);
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // --- HEADER ---
    doc
      .fontSize(20)
      .fillColor('#1A73E8')
      .text('SalesCoach Report', { align: 'left' })
      .moveDown(0.2);
    doc
      .fontSize(10)
      .fillColor('black')
      .text(`Coach: ${sessionData.coach?.name || ''}    Coachee: ${sessionData.coachee?.name || ''}    Proficiency Level: ${sessionData.proficiencyLevel || ''}`, { align: 'left' })
      .moveDown(0.2);
    doc
      .text(`${sessionData.session_date || ''}    ${sessionData.created_at ? new Date(sessionData.created_at).toLocaleTimeString() : ''}`)
      .moveDown();

    // --- CONTEXT ---
    doc
      .fontSize(12)
      .fillColor('black')
      .text('Context:', { underline: true })
      .moveDown(0.2)
      .fontSize(10)
      .text(sessionData.context || '', { align: 'left' })
      .moveDown();

    // --- RADAR CHART PLACEHOLDER ---
    doc
      .fontSize(10)
      .fillColor('#888')
      .text('[Radar chart not rendered in PDF export]', { align: 'left' })
      .moveDown();

    // --- STEPS & PROFICIENCIES ---
    if (sessionData.step_proficiencies) {
      sessionData.step_proficiencies.forEach((step, idx) => {
        doc
          .fontSize(12)
          .fillColor('#222')
          .text(`${idx + 1}. ${step.name || 'Step'}`, { continued: true })
          .fontSize(10)
          .fillColor('#666')
          .text(` (${step.level || ''})`, { align: 'left' })
          .moveDown(0.1);
      });
      doc.moveDown();
    }

    // --- NOTES & OBSERVATIONS ---
    doc
      .fontSize(12)
      .fillColor('#222')
      .text('Key Observations:', { underline: true })
      .fontSize(10)
      .fillColor('black')
      .text(sessionData.notes?.key_observations || '', { align: 'left' })
      .moveDown();
    doc
      .fontSize(12)
      .fillColor('#222')
      .text('What Worked Well:', { underline: true })
      .fontSize(10)
      .fillColor('black')
      .text(sessionData.notes?.what_went_well || '', { align: 'left' })
      .moveDown();
    doc
      .fontSize(12)
      .fillColor('#222')
      .text('What Can Be Improved:', { underline: true })
      .fontSize(10)
      .fillColor('black')
      .text(sessionData.notes?.improvements || '', { align: 'left' })
      .moveDown();
    doc
      .fontSize(12)
      .fillColor('#222')
      .text('Next Steps:', { underline: true })
      .fontSize(10)
      .fillColor('black')
      .text(sessionData.notes?.next_steps || '', { align: 'left' })
      .moveDown();

    // --- SIGNATURES ---
    doc
      .fontSize(12)
      .fillColor('#222')
      .text('Electronic Signatures', { underline: true })
      .moveDown(0.2)
      .fontSize(10)
      .text('Coach: ___________________________', { continued: true })
      .text('    Date: ___________')
      .moveDown(0.2)
      .text('Coachee: _________________________', { continued: true })
      .text('    Date: ___________')
      .moveDown();

    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

module.exports = { generateSessionReportPDF };
