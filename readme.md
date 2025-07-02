# SalesCoach App - Project Status
---
Last Updated: July 01, 2025 - Framework Management System Completed ✅

## Architecture Overview
- **Frontend**: Next.js (React) - Port 3000
- **Backend**: Node.js/Express - Port 5000  
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS

## Database Schema (Working)
### Tables Implemented:
- `tenants` - Organizations
- `sales_frameworks` - Main framework records with versioning
- `behavior_levels` - Proficiency levels (Learner, Qualified, etc.)
- `framework_steps` - Main steps in framework
- `framework_substeps` - Sub-steps within steps
- `framework_behaviors` - Specific behaviors linked to levels

## Features Completed ✅

### Framework Management (Full CRUD)
- **Framework List Page**: `/admin/frameworks` - Shows all frameworks for tenant
  - Framework cards with version info, active status
  - Step/behavior counts
  - "Create New" and "Edit" buttons
- **Framework Creation**: `/admin/frameworks/create` - Complete framework builder
  - Step → Sub-step → Behavior hierarchy
  - Proficiency levels with points system
  - Collapsible sections with status indicators
  - Data transformation layer for backend compatibility
- **Backend APIs**: Full framework management
  - GET `/api/frameworks/tenant/:tenantId/list` (framework list)
  - POST `/api/frameworks` (create new framework/version)
  - Proper database integration with versioning

### Component Architecture 
- **Reusable Components**: Extracted to `/components`
  - `CollapsibleSection.js` - With status indicators
  - `BehaviorLevelsSection.js` - Level management
  - `StructureSection.js` - Framework structure builder
  - `InlineEditableText.js` - Inline editing utility
- **Clean Data Flow**: Transform between frontend/backend data structures

## Current Setup Details
### Environment
- Tenant ID: `cd663ebb-a679-4841-88b0-afe1eb13bec8`
- Supabase URL: https://dulshypdifqdijzvsjfk.supabase.co

### File Structure (Current)
```
salescoach-app/
├── frontend/
│   ├── src/app/admin/frameworks/
│   │   ├── page.js (✅ Framework List - NEW)
│   │   └── create/page.js (✅ Framework Creation - UPDATED)
│   ├── src/components/
│   │   ├── CollapsibleSection.js (✅ Reused)
│   │   ├── BehaviorLevelsSection.js (✅ Reused)
│   │   ├── StructureSection.js (✅ Reused)
│   │   ├── InlineEditableText.js (✅ Reused)
│   │   └── LayoutAdmin.js (✅ Working)
│   └── src/components/ui/button.js (✅ Updated)
└── backend/
    ├── routes/frameworks.js (✅ Enhanced with list API)
    ├── app.js (✅ Working)
    └── supabaseClient.js (✅ Working)
```

## Working APIs
- `http://localhost:5000/api/frameworks` 
  - GET: List all frameworks (legacy)
  - POST: Create framework with full hierarchy
- `http://localhost:5000/api/frameworks/tenant/:tenantId/list`
  - GET: List frameworks for tenant with stats
- `http://localhost:5000/api/frameworks/tenant/:tenantId`
  - GET: Get active framework structure for coaching

## Features In Progress 🚧
### Framework Edit Functionality (Next Priority)
- Edit existing frameworks with pre-populated data
- "Update Current Version" vs "Save as New Version" options
- API routes for framework retrieval and updates

## Next Features to Build
1. **Framework Edit Page** (`/admin/frameworks/edit/[id]`)
2. **Framework View Page** (read-only framework display)
3. **User Authentication & Multi-tenant Management**
4. **Coaching Session Management** (as per original spec)

## Development Notes
- **Component Strategy**: Reusing existing components in `/components` with data transformation
- **Data Flow**: Frontend uses simple structure, transforms to backend schema
- **Versioning**: Framework versioning working with `is_active` flag
- **Tenant Support**: Hard-coded tenant for pilot, ready for multi-tenant

## 🚀 Quick Context for New Development Sessions

**CURRENT STATE**: Framework Management System Complete ✅
- Framework creation: FULLY WORKING
- Framework listing: FULLY WORKING  
- Component architecture: CLEAN & REUSABLE

**ENVIRONMENT:**
- Frontend: http://localhost:3000/admin/frameworks
- Backend: http://localhost:5000
- Tenant ID: cd663ebb-a679-4841-88b0-afe1eb13bec8

**NEXT DEVELOPMENT PRIORITY:**
Framework Edit functionality - reuse existing components with data loading from backend

**KEY ARCHITECTURAL DECISIONS:**
- Existing components in `/components` (not `/components/frameworks`)
- Data transformation layer between frontend simple structure and backend schema
- Versioning system ready for multiple framework versions per tenant