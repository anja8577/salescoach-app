const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

// Helper function to get step color based on step number
function getStepColor(stepNumber) {
  switch (stepNumber) {
    case 1: return '#E91E63'; // Pink
    case 2: return '#3F51B5'; // Blue
    case 3: return '#4CAF50'; // Green
    case 4: return '#FF9800'; // Orange
    case 5: return '#F44336'; // Red
    case 6: return '#9C27B0'; // Purple
    case 7: return '#673AB7'; // Deep Purple
    default: return '#6B7280'; // Gray
  }
}

// Helper function to get proficiency level order for radar chart
function getProficiencyValue(levelName) {
  switch (levelName?.toLowerCase()) {
    case 'master': return 4;
    case 'experienced': return 3;
    case 'qualified': return 2;
    case 'learner': return 1;
    default: return 0;
  }
}

// NEW: Generate session report PDF with custom filename
async function generateSessionReportPDFWithCustomName(sessionData, reportsDir, customFilename) {
  try {
    console.log('🎯 Starting PDF generation for session:', sessionData.session.id);
    console.log('🎯 Using custom filename:', customFilename);
    
    // Ensure reports directory exists
    await fs.mkdir(reportsDir, { recursive: true });
    
    // Prepare radar chart data for all 7 steps
    const radarData = sessionData.stepProficiencies.map(step => ({
      step: step.step_name,
      value: getProficiencyValue(step.level_name),
      maxValue: 4
    }));
    
    // Prepare template data
    const templateData = {
      // Header information
      coach_name: sessionData.session.coach?.name || 'Unknown',
      coachee_name: sessionData.session.coachee?.name || 'Unknown',
      session_date: new Date(sessionData.session.session_date).toLocaleDateString('en-GB'),
      current_time: new Date().toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      overall_proficiency: sessionData.overallProficiency || 'Not Evaluated',
      context: sessionData.notes?.context || 'No context provided',
      
      // Radar chart data (as JSON string for JavaScript)
      radar_data: JSON.stringify(radarData),
      
      // Step-by-step breakdown - ALL 7 steps with properly structured behaviors
      steps: sessionData.stepProficiencies.map(step => ({
        step_number: step.step_number,
        name: step.step_name,
        level: step.level_name,
        color: getStepColor(step.step_number),
        behaviors: step.behaviors || []
      })),
      
      // Notes sections
      key_observations: sessionData.notes?.key_observations || 'None recorded',
      what_went_well: sessionData.notes?.what_went_well || 'None recorded',
      improvements: sessionData.notes?.improvements || 'None recorded',
      next_steps: sessionData.notes?.next_steps || 'None recorded',
      
      // Signature info
      current_date: new Date().toLocaleDateString('en-GB')
    };

    console.log(`📊 PDF template data prepared:
      - Coach: ${templateData.coach_name}
      - Coachee: ${templateData.coachee_name}
      - Steps: ${templateData.steps.length}
      - Radar data points: ${radarData.length}
      - Overall proficiency: ${templateData.overall_proficiency}`);

    // Generate HTML from template
    const htmlContent = await generateHTML(templateData);
    
    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set content and wait for it to load completely
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait for Chart.js to render properly
    await page.evaluate(() => {
      return new Promise(resolve => {
        // Wait for Chart.js to be available and chart to render
        if (window.Chart) {
          setTimeout(resolve, 2000);
        } else {
          const checkChart = setInterval(() => {
            if (window.Chart) {
              clearInterval(checkChart);
              setTimeout(resolve, 2000);
            }
          }, 100);
        }
      });
    });
    
    // Use the custom filename provided
    const pdfPath = path.join(reportsDir, customFilename);
    
    // Generate PDF with optimized settings
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      preferCSSPageSize: false  // Changed to false for better control
    });
    
    await browser.close();
    
    console.log('✅ PDF generated successfully:', pdfPath);
    return pdfPath;
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw error;
  }
}

// Keep the original function for backward compatibility
async function generateSessionReportPDF(sessionData, reportsDir) {
  // Generate new filename format: Report_coachee name_date
  const coacheeName = sessionData.session.coachee?.name || 'Unknown';
  const sessionDate = new Date(sessionData.session.session_date).toLocaleDateString('en-GB').replace(/\//g, '-');
  const pdfFileName = `Report_${coacheeName.replace(/[^a-zA-Z0-9]/g, '_')}_${sessionDate}.pdf`;
  return generateSessionReportPDFWithCustomName(sessionData, reportsDir, pdfFileName);
}

// Generate HTML content from template - FIXED VERSION WITH PROPER CHECKBOXES AND SPACING
async function generateHTML(data) {
  const template = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>SalesCoach Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.4;
            color: #333;
            background: white;
            font-size: 12px;
        }
        
        .header {
            background: #4F7CFF;
            color: white;
            padding: 15px 20px;
            margin-bottom: 15px;
        }
        
        .header h1 {
            font-size: 20px;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .proficiency-badge {
            font-size: 12px;
            background: rgba(255,255,255,0.2);
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: normal;
        }
        
        .header-info {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            flex-wrap: wrap;
        }
        
        .content {
            padding: 0 15px;
        }
        
        .section {
            margin-bottom: 15px;
            background: white;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            break-inside: avoid;
        }
        
        .context-section {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
            background: white;
            padding: 15px;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .context-text {
            flex: 1;
        }
        
        .context-text h3 {
            margin-bottom: 8px;
            color: #333;
            font-size: 14px;
        }
        
        .context-box {
            border: 1px solid #ddd;
            padding: 12px;
            min-height: 80px;
            background: #f9f9f9;
            font-size: 11px;
            border-radius: 4px;
        }
        
        .radar-container {
            flex: 0 0 280px;
            text-align: center;
        }
        
        .radar-chart {
            width: 280px !important;
            height: 180px !important;
            margin: 0 auto;
        }
        
        .step-header {
            padding: 12px 15px;
            color: white;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
        }
        
        .step-content {
            padding: 15px;
        }
        
        .behavior-group {
            margin-bottom: 15px;
        }
        
        .behavior-group h4 {
            font-size: 12px;
            margin-bottom: 8px;
            color: #333;
            font-weight: 700;
            padding: 4px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .behavior-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 4px;
            font-size: 10px;
            line-height: 1.3;
        }
        
  /* ALTERNATIVE CHECKBOX APPROACH - Replace the checkbox CSS in pdfGenerator.js if Unicode doesn't work */

/* Option 1: Simple text-based checkboxes (most reliable) */
.checkbox {
    width: 14px;
    height: 14px;
    margin-right: 6px;
    flex-shrink: 0;
    display: inline-block;
    text-align: center;
    line-height: 12px;
    font-size: 12px;
    border: 2px solid #666;
    font-family: monospace; /* Ensures consistent character spacing */
    color: #4F7CFF;
    font-weight: bold;
    background: white;
}

.checkbox.checked {
    background: #4F7CFF;
    color: white;
    border-color: #4F7CFF;
}

/* Option 2: If Option 1 doesn't work, try this CSS-only approach */
.checkbox-alt {
    width: 12px;
    height: 12px;
    margin-right: 6px;
    flex-shrink: 0;
    display: inline-block;
    border: 2px solid #666;
    position: relative;
    background: white;
}

.checkbox-alt.checked {
    background: #4F7CFF;
    border-color: #4F7CFF;
}

.checkbox-alt.checked::before {
    content: 'X';
    position: absolute;
    top: -3px;
    left: 1px;
    color: white;
    font-size: 10px;
    font-weight: bold;
    font-family: monospace;
}

/* Option 3: HTML entities approach - update the HTML template */
/* Replace {{#if checked}}✓{{/if}} with {{#if checked}}X{{else}}&nbsp;{{/if}} */
        
        /* FIXED: Better notes section spacing using flexbox and explicit margins */
        .notes-section {
            padding: 25px;
            display: flex;
            flex-wrap: wrap;
            gap: 0; /* Remove gap, use margins instead */
        }
        
        .notes-box {
            border: 1px solid #ddd;
            padding: 12px;
            min-height: 80px;
            font-size: 10px;
            border-radius: 4px;
            width: calc(50% - 15px); /* 50% width minus half the desired gap */
            margin-bottom: 20px;
        }
        
        .notes-box:nth-child(odd) {
            margin-right: 30px; /* Create gap between left and right columns */
        }
        
        .notes-box h4 {
            margin-bottom: 8px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .observations-box { background: #f8f9fa; }
        .positive-box { background: #f0f9f4; }
        .improvements-box { background: #fef2f2; }
        .nextsteps-box { background: #f0f8ff; }
        
        .signatures {
            display: flex;
            justify-content: space-between;
            padding: 20px 15px;
            background: #f8f9fa;
            margin-top: 15px;
            page-break-inside: avoid;
        }
        
        .signature-box {
            text-align: center;
            font-size: 10px;
        }
        
        .signature-line {
            border-bottom: 1px solid #333;
            width: 150px;
            margin: 15px 0 5px 0;
        }
        
        /* Step-specific colors */
        .step-1 { background-color: #E91E63; }
        .step-2 { background-color: #3F51B5; }
        .step-3 { background-color: #4CAF50; }
        .step-4 { background-color: #FF9800; }
        .step-5 { background-color: #F44336; }
        .step-6 { background-color: #9C27B0; }
        .step-7 { background-color: #673AB7; }
        
        .legend {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 8px;
            font-size: 9px;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .legend-color {
            width: 12px;
            height: 12px;
            border-radius: 2px;
        }
        
        /* Ensure proper page breaks */
        .step-section {
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        @media print {
            body { background: white; }
            .section { 
                break-inside: avoid;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>
            <span>SalesCoach Report</span>
            <span class="proficiency-badge">Proficiency Level: {{overall_proficiency}}</span>
        </h1>
        <div class="header-info">
            <span>Coach: {{coach_name}} | Coachee: {{coachee_name}}</span>
            <span>{{session_date}} | {{current_time}}</span>
        </div>
    </div>
    
    <div class="content">
        <!-- Context and Radar Chart -->
        <div class="context-section">
            <div class="context-text">
                <h3>Context:</h3>
                <div class="context-box">{{context}}</div>
            </div>
            <div class="radar-container">
                <canvas id="radarChart" class="radar-chart"></canvas>
                <div class="legend">
                    <div class="legend-item">
                        <div class="legend-color" style="background: #3b82f6;"></div>
                        <span>Actual Performance</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: rgba(56, 189, 248, 0.2); border: 1px dashed #38bdf8;"></div>
                        <span>Benchmark (Level 3)</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Step Sections -->
        {{#each steps}}
        <div class="section step-section">
            <div class="step-header step-{{step_number}}">
                <span>{{step_number}}. {{name}}</span>
                <span>{{level}}</span>
            </div>
            <div class="step-content">
                {{#if behaviors}}
                    {{#each behaviors}}
                    <div class="behavior-group">
                        <h4>{{group_name}}</h4>
                        {{#each items}}
                        <div class="behavior-item">
                            <span class="checkbox {{#if checked}}checked{{/if}}">{{#if checked}}✓{{/if}}</span>
                            <span>{{text}}</span>
                        </div>
                        {{/each}}
                    </div>
                    {{/each}}
                {{else}}
                    <div class="behavior-group">
                        <h4>No behaviors assessed for this step</h4>
                    </div>
                {{/if}}
            </div>
        </div>
        {{/each}}
        
        <!-- Notes Section -->
        <div class="section">
            <div class="notes-section">
                <div class="notes-box observations-box">
                    <h4>Key Observations:</h4>
                    <div>{{key_observations}}</div>
                </div>
                <div class="notes-box positive-box">
                    <h4>What Worked Well:</h4>
                    <div>{{what_went_well}}</div>
                </div>
                <div class="notes-box improvements-box">
                    <h4>What Can Be Improved:</h4>
                    <div>{{improvements}}</div>
                </div>
                <div class="notes-box nextsteps-box">
                    <h4>Next Steps:</h4>
                    <div>{{next_steps}}</div>
                </div>
            </div>
        </div>
        
        <!-- Signatures -->
        <div class="signatures">
            <div class="signature-box">
                <div>Coach:</div>
                <div class="signature-line"></div>
                <div>{{coach_name}}</div>
                <div>Date: ___________</div>
            </div>
            <div class="signature-box">
                <div>Coachee:</div>
                <div class="signature-line"></div>
                <div>{{coachee_name}}</div>
                <div>Date: ___________</div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 15px; font-size: 10px; color: #666;">
            Electronic signatures accepted for digital approval
        </div>
    </div>
    
    <script>
        // Wait for DOM to load
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, initializing chart...');
            
            const chartElement = document.getElementById('radarChart');
            if (!chartElement) {
                console.error('Chart element not found');
                return;
            }
            
            const ctx = chartElement.getContext('2d');
            const radarData = {{{radar_data}}};
            
            console.log('Radar data:', radarData);
            
            if (!radarData || radarData.length === 0) {
                console.error('No radar data available');
                return;
            }
            
            try {
                new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: radarData.map(d => d.step),
                        datasets: [
                            {
                                label: 'Benchmark (Level 3)',
                                data: radarData.map(d => 3), // Level 3 benchmark for all steps
                                borderColor: '#38bdf8',
                                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                pointBackgroundColor: '#38bdf8',
                                pointBorderColor: '#38bdf8',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                pointRadius: 3,
                                fill: true
                            },
                            {
                                label: 'Actual Performance',
                                data: radarData.map(d => d.value),
                                borderColor: '#3b82f6',
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                pointBackgroundColor: '#3b82f6',
                                pointBorderColor: '#3b82f6',
                                pointHoverBackgroundColor: '#fff',
                                pointHoverBorderColor: '#3b82f6',
                                borderWidth: 3,
                                pointRadius: 4,
                                fill: true
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            r: {
                                beginAtZero: true,
                                max: 4,
                                min: 0,
                                ticks: {
                                    stepSize: 1,
                                    display: false
                                },
                                grid: {
                                    color: '#e0e0e0'
                                },
                                angleLines: {
                                    color: '#e0e0e0'
                                },
                                pointLabels: {
                                    font: {
                                        size: 9
                                    },
                                    color: '#333'
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        animation: {
                            duration: 0  // Disable animation for PDF generation
                        }
                    }
                });
                console.log('Chart created successfully');
            } catch (error) {
                console.error('Error creating chart:', error);
            }
        });
    </script>
</body>
</html>`;

  const compiledTemplate = handlebars.compile(template);
  return compiledTemplate(data);
}

module.exports = {
  generateSessionReportPDF,
  generateSessionReportPDFWithCustomName,
  getStepColor,
  getProficiencyValue
};