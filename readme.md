# SalesCoach App - Project Status
---
Last Updated: July 02, 2025 - Framework Management System with Full CRUD + UI Enhancements ✅

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

### Framework Management (Complete CRUD System)
- **Framework List Page**: `/admin/frameworks` - Shows all frameworks for tenant
  - Framework cards with version info, active status
  - Step/behavior counts
  - "Create New" and "Edit" buttons
- **Framework Creation**: `/admin/frameworks/create` - Complete framework builder
  - Step → Sub-step → Behavior hierarchy
  - Proficiency levels with points system
  - Collapsible sections with colored headers
  - Data transformation layer for backend compatibility
- **Framework Edit**: `/admin/frameworks/edit/[id]` - Full edit functionality ✅ NEW
  - Load existing framework data with full structure
  - Update existing version OR save as new version
  - Maintains all create functionality for editing
  - Proper data transformation between frontend/backend
- **Framework View**: `/admin/frameworks/view/[id]` - Read-only display ✅ NEW
  - Clean, printable framework view
  - Expandable structure for easy reading
  - Print-optimized styling

### Backend APIs (Complete)
- **GET** `/api/frameworks` - List all frameworks (legacy)
- **POST** `/api/frameworks` - Create new framework with full hierarchy
- **GET** `/api/frameworks/:id` - Get single framework with complete structure ✅ NEW
- **PUT** `/api/frameworks/:id` - Update existing framework ✅ NEW
- **GET** `/api/frameworks/tenant/:tenantId/list` - Framework list with stats
- **Proper deletion order** for foreign key constraints
- **Data transformation** between frontend/backend formats

### Component Architecture (Enhanced)
- **Reusable Framework Components**: In `/components/frameworks/`
  - `CollapsibleSection.js` - Colored headers, clean expand/collapse ✅ ENHANCED
  - `BehaviorLevelsSection.js` - Level management with color support
  - `StructureSection.js` - Framework structure with bottom "Add Step" button ✅ ENHANCED
  - `StepItem.js` - Collapsible steps with inline editing ✅ ENHANCED
  - `SubStepItem.js` - Collapsible substeps with behavior counts ✅ ENHANCED
  - `BehaviorItem.js` - Individual behavior management
  - `InlineEditableText.js` - Inline editing utility
- **UI/UX Improvements**:
  - Collapsible steps and substeps for better navigation
  - Colored section headers (Orange: Proficiency Levels, Green: Framework Structure)
  - "Add Step Below" button for easier step addition
  - Cleaned redundant UI elements

### Data Flow & Architecture
- **Clean Data Transformation**: Frontend uses simple structure, transforms to backend schema
- **Versioning**: Framework versioning working with `is_active` flag
- **Tenant Support**: Hard-coded tenant for pilot, ready for multi-tenant

## Database Schema & Naming Conventions ⚠️
**CRITICAL**: Naming mismatches between frontend/backend/database have caused bugs. Always reference this section when working with data.

### Table Structure & Field Names
```sql
-- sales_frameworks table
{
  id: uuid,
  name: string,
  description: string,
  tenant_id: uuid,
  is_active: boolean,
  version: integer,
  created_at: timestamp
  -- NOTE: NO updated_at column
}

-- behavior_levels table  
{
  id: uuid,
  framework_id: uuid,
  level_name: string,        -- NOT "name" 
  point_value: integer,      -- NOT "points"
  display_order: integer,
  color: string
}

-- framework_steps table
{
  id: uuid,
  framework_id: uuid,
  name: string,
  step_number: integer,      -- NOT "position"
  tenant_id: uuid
}

-- framework_substeps table
{
  id: uuid,
  step_id: uuid,
  framework_id: uuid,
  name: string,
  tenant_id: uuid
  -- NOTE: NO position column
}

-- framework_behaviors table  
{
  id: uuid,
  framework_id: uuid,
  substep_id: uuid,          -- NOT "framework_substep_id"
  level_id: uuid,            -- NOT "behavior_level_id"
  description: string,
  tenant_id: uuid
}
```

### Frontend ↔ Backend Data Mapping
**Frontend State** → **Backend API** → **Database**

```javascript
// LEVELS
Frontend: { id, name, points, color }
Backend:  { id, level_name, point_value, color }  
Database: { id, level_name, point_value, display_order, color }

// STEPS  
Frontend: { id, name, position, subSteps: [...] }
Backend:  { id, name, step_number, substeps: [...] }
Database: { id, name, step_number, tenant_id }

// SUBSTEPS
Frontend: { id, name, position, behaviors: [...] }  
Backend:  { id, name, behaviors: [...] }
Database: { id, name, step_id, framework_id, tenant_id }

// BEHAVIORS
Frontend: { id, description, behavior_level_id }
Backend:  { id, description, level_id }
Database: { id, description, level_id, substep_id, framework_id, tenant_id }
```

### Common Pitfalls to Avoid
1. **Level Fields**: Use `level_name` & `point_value` in backend, NOT `name` & `points`
2. **Step Position**: Use `step_number` in database, NOT `position` 
3. **Substep Position**: Database has NO position column
4. **Behavior Level Reference**: Use `level_id` in backend, NOT `behavior_level_id`
5. **Updated Timestamp**: `sales_frameworks` has NO `updated_at` column
6. **Substep Reference**: Use `substep_id` in behaviors, NOT `framework_substep_id`