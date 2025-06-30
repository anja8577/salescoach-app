# SalesCoach App - Project Status
---
Last Updated: June 29, 2025 - Framework creation completed and tested ✅

## Architecture Overview
- **Frontend**: Next.js (React) - Port 3000
- **Backend**: Node.js/Express - Port 5000  
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS

## Database Schema (Working)
### Tables Implemented:
- `tenants` - Organizations
- `sales_frameworks` - Main framework records
- `behavior_levels` - Proficiency levels (Learner, Qualified, etc.)
- `framework_steps` - Main steps in framework
- `framework_substeps` - Sub-steps within steps
- `framework_behaviors` - Specific behaviors linked to levels

## Features Completed ✅
### Framework Management (CRUD)
- **Frontend**: Complete UI for creating frameworks
  - Step → Sub-step → Behavior hierarchy
  - Proficiency levels with colors
  - Beautiful design with proper UX
- **Backend**: Full API implementation
  - POST /api/frameworks (create)
  - GET /api/frameworks (list)
  - Proper database integration
- **Database**: All relationships working correctly

## Current Setup Details
### Environment
- Tenant ID: `cd663ebb-a679-4841-88b0-afe1eb13bec8`
- Supabase URL: https://dulshypdifqdijzvsjfk.supabase.co

### File Structure

salescoach-app/
├── frontend/
│   ├── src/app/admin/frameworks/create/page.js (✅ Working)
│   ├── src/components/ui/button.js (✅ Updated)
│   └── src/lib/utils.js
└── backend/
├── routes/frameworks.js (✅ Working)
├── app.js (✅ Updated)
└── supabaseClient.js (✅ Working)

## Known Working APIs
- `http://localhost:5000/api/frameworks` 
  - GET: List all frameworks
  - POST: Create framework with full step/substep/behavior hierarchy
- Backend properly handles tenant_id: `cd663ebb-a679-4841-88b0-afe1eb13bec8`

## Next Features to Build
1. Framework List/View Pages
2. Framework Edit Functionality  
3. User Authentication
4. Multi-tenant Management
5. Coaching Session Management

## Development Notes
- Using standard Tailwind colors (no custom color config)
- Hard-coded tenant for pilot phase
- All database constraints fixed for proper multi-framework support


## 🚀 Quick Context for New Chats

I'm building a SalesCoach app (sales training platform).
CURRENT STATE: Framework creation is FULLY WORKING ✅

Next.js frontend + Express backend + Supabase
Complete framework CRUD with step/sub-step/behavior hierarchy
Database schema working with proper relationships
APIs tested and functional

ENVIRONMENT:

Frontend: http://localhost:3000
Backend: http://localhost:5000
Tenant ID: cd663ebb-a679-4841-88b0-afe1eb13bec8

WORKING FILES:

Frontend: src/app/admin/frameworks/create/page.js
Backend: backend/routes/frameworks.js
API: POST/GET http://localhost:5000/api/frameworks

NEXT FEATURE TO BUILD: New Coaching Session Page

Background: Coach logging on to SalesCoach will select from an available pool of Coachees (Coachee Selector Tool tbd later). Starts new session with selected coach, which creates a Coaching Session record and opens Coaching Session Page. 
Coaching Session page consists of header incl. coach name, coachee name, date and time stamp. Coaching Context text entry box. Scoring section, pulling the sales framework and showing for each behavior in the framework a checkbox. checked = behavior shown, points accrued. Proficiency score is calculated for the framework, sub-scores per step. Under Scoring section, Coaching notes section consisting of 4 text entry boxes: key observations, what went well, what could be improved, action plan / next steps 
Coach can save or submit the session. Save = can still be edited. Submit = session is locked and can't be changed anymore. The page should autosave frequently so that no data gets lost.  

