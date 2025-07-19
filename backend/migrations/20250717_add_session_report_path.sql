-- Add a column to store the PDF report path for each coaching session
ALTER TABLE coaching_sessions ADD COLUMN report_pdf_path TEXT;
