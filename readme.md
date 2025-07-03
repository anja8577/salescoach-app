# SalesCoach App - Project Status
---
Last Updated: July 03, 2025 - Coaching Session Page Fully Functional ✅

## Architecture Overview
- **Frontend**: Next.js (React) - Port 3000
- **Backend**: Node.js/Express - Port 5000  
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS

## Database Schema (Complete)

### Core Tables

#### `tenants` - Organizations
- `id` (UUID, Primary Key)
- `name` (Text)
- `created_at` (Timestamp)

#### `users` - System Users
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id)
- `name` (Text)
- `email` (Text, Unique)
- `password_hash` (Text)
- `system_role` (Text: 'admin', 'coach', 'coachee')
- `created_at` (Timestamp)

#### `teams` - Organizational Teams
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id)
- `name` (Text)
- `created_at` (Timestamp)

#### `team_memberships` - User-Team Relationships
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `team_id` (UUID, Foreign Key → teams.id)
- `team_role` (Text: 'coach', 'coachee', 'manager')
- `created_at` (Timestamp)

### Framework Tables

#### `sales_frameworks` - Main Framework Records
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id)
- `name` (Text)
- `description` (Text, Optional)
- `version` (Integer, Default: 1)
- `is_active` (Boolean, Default: true)
- `created_at` (Timestamp)

#### `behavior_levels` - Proficiency Levels
- `id` (UUID, Primary Key)
- `framework_id` (UUID, Foreign Key → sales_frameworks.id)
- `level_name` (Text: e.g., 'Learner', 'Qualified', 'Experienced', 'Master')
- `point_value` (Integer: 1, 2, 3, 4)
- `display_order` (Integer)
- `created_at` (Timestamp)

#### `framework_steps` - Main Steps in Framework
- `id` (UUID, Primary Key)
- `framework_id` (UUID, Foreign Key → sales_frameworks.id)
- `tenant_id` (UUID, Foreign Key → tenants.id)
- `name` (Text)
- `step_number` (Integer)
- `created_at` (Timestamp)

#### `framework_substeps` - Sub-steps Within Steps
- `id` (UUID, Primary Key)
- `step_id` (UUID, Foreign Key → framework_steps.id)
- `framework_id` (UUID, Foreign Key → sales_frameworks.id)
- `tenant_id` (UUID, Foreign Key → tenants.id)
- `name` (Text)
- `created_at` (Timestamp)

#### `framework_behaviors` - Specific Behaviors
- `id` (UUID, Primary Key)
- `framework_id` (UUID, Foreign Key → sales_frameworks.id)
- `substep_id` (UUID, Foreign Key → framework_substeps.id)
- `level_id` (UUID, Foreign Key → behavior_levels.id)
- `tenant_id` (UUID, Foreign Key → tenants.id)
- `description` (Text)
- `created_at` (Timestamp)

### Coaching Session Tables

#### `coaching_sessions` - Main Session Records
- `id` (UUID, Primary Key)
- `coach_id` (UUID, Foreign Key → users.id, Optional)
- `coachee_id` (UUID, Foreign Key → users.id, Required)
- `team_id` (UUID, Foreign Key → teams.id, Required)
- `framework_id` (UUID, Foreign Key → sales_frameworks.id, Required)
- `session_date` (Date, Required)
- `context` (Text, Optional)
- `status` (Text: 'draft', 'submitted', Default: 'draft')
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `session_notes` - Coaching Observations & Notes
- `id` (UUID, Primary Key)
- `session_id` (UUID, Foreign Key → coaching_sessions.id)
- `context` (Text, Optional)
- `key_observations` (Text, Optional)
- `what_went_well` (Text, Optional)
- `improvements` (Text, Optional)
- `next_steps` (Text, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `session_scores` - Behavior Scoring Results
- `id` (UUID, Primary Key)
- `session_id` (UUID, Foreign Key → coaching_sessions.id)
- `behavior_id` (UUID, Foreign Key → framework_behaviors.id)
- `checked` (Boolean, Default: false)
- `step_level` (Text, Optional - for manual step overrides)
- `created_at` (Timestamp)

## Business Logic

### Proficiency Scoring System

#### **Core Principle**: Cumulative Point Thresholds
The scoring system uses cumulative point thresholds rather than percentages to determine proficiency levels.

#### **Point Calculation**:
- **Learner behaviors**: 1 point each
- **Qualified behaviors**: 2 points each  
- **Experienced behaviors**: 3 points each
- **Master behaviors**: 4 points each

#### **Threshold Logic**:
```
Given a step/substep with:
- A learner behaviors (max A points)
- B qualified behaviors (max B×2 points)  
- C experienced behaviors (max C×3 points)
- D master behaviors (max D×4 points)

Proficiency Levels:
- Learner: 0 to A points
- Qualified: (A + 1) to (A + B×2) points
- Experienced: (A + B×2 + 1) to (A + B×2 + C×3) points
- Master: (A + B×2 + C×3 + 1) to (A + B×2 + C×3 + D×4) points
```

#### **Manual Override**: 
Coaches can manually set step-level proficiency scores, overriding the automatic calculation.

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

### Coaching Session Management (Functional)
- **New Session Page**: `/session/create` - Complete coaching interface
  - Real framework data integration (Framework ID: `7b5dbd81-bc61-48d7-8d39-bb46d4d00d74`)
  - Collapsible steps and sub-steps for easy navigation
  - Behavior scoring with checkboxes
  - Automatic proficiency calculation using correct business logic
  - Manual step-level score overrides
  - 4 coaching notes sections:
    - Key Observations
    - What Went Well  
    - What Could Be Improved
    - Action Plan / Next Steps
  - Auto-save functionality
  - Overall proficiency display

### Component Architecture 
- **Reusable Components**: Extracted to `/components`
  - `CollapsibleSection.js` - With status indicators
  - `BehaviorLevelsSection.js` - Level management
  - `StructureSection.js` - Framework structure builder
  - `InlineEditableText.js` - Inline editing utility
  - `LayoutApp.js` - Main app layout
  - `LayoutAdmin.js` - Admin layout
- **Clean Data Flow**: Transform between frontend/backend data structures

## Current Setup Details

### Environment
- **Tenant ID**: `cd663ebb-a679-4841-88b0-afe1eb13bec8`
- **Active Framework ID**: `7b5dbd81-bc61-48d7-8d39-bb46d4d00d74`
- **Supabase URL**: https://dulshypdifqdijzvsjfk.supabase.co

### File Structure (Current)
```
salescoach-app/
├── frontend/
│   ├── src/app/
│   │   ├── admin/
│   │   │   └── frameworks/
│   │   │       ├── page.js (✅ Framework List)
│   │   │       └── create/page.js (✅ Framework Creation)
│   │   └── session/
│   │       └── create/page.js (✅ New Coaching Session - FULLY FUNCTIONAL)
│   ├── src/components/
│   │   ├── CollapsibleSection.js (✅ Reused)
│   │   ├── BehaviorLevelsSection.js (✅ Reused)
│   │   ├── StructureSection.js (✅ Reused)
│   │   ├── InlineEditableText.js (✅ Reused)
│   │   ├── LayoutAdmin.js (✅ Working)
│   │   └── LayoutApp.js (✅ Working)
│   └── src/components/ui/button.js (✅ Updated)
└── backend/
    ├── routes/
    │   ├── frameworks.js (✅ Enhanced with list API)
    │   ├── tenants.js (✅ Complete framework structure APIs)
    │   ├── coachingSessions.js (✅ Updated with framework_id)
    │   ├── sessionNotes.js (✅ Working)
    │   ├── sessionScores.js (✅ Working)
    │   └── [other routes...]
    ├── app.js (✅ Working)
    └── supabaseClient.js (✅ Working)
```

## Working APIs

### Framework APIs
- **GET** `/api/frameworks` - List all frameworks
- **POST** `/api/frameworks` - Create framework with full hierarchy
- **GET** `/api/frameworks/tenant/:tenantId/list` - List frameworks for tenant with stats
- **GET** `/api/framework-steps?framework_id=xxx` - Get steps for framework
- **GET** `/api/framework-substeps?framework_id=xxx` - Get substeps for framework  
- **GET** `/api/framework-behaviors?framework_id=xxx` - Get behaviors for framework
- **GET** `/api/behavior-levels?framework_id=xxx` - Get behavior levels for framework

### Coaching Session APIs
- **GET** `/api/coaching-sessions` - List all sessions
- **POST** `/api/coaching-sessions` - Create new session
  - Required: `coachee_id`, `team_id`, `framework_id`, `session_date`
  - Optional: `coach_id`
- **POST** `/api/session-notes` - Add session notes
- **POST** `/api/session-scores` - Add behavior scoring

## Features In Progress 🚧

### Next Priority: Coach/Coachee Selection System
**Current Gap**: Coaches need a way to:
1. **Select a coachee** from available team members
2. **Start a new session** with selected coachee
3. **Navigate to coaching session page** with proper session context

## Next Features to Build

### 1. **Coachee Selection Interface** 
- Coach dashboard/home page
- List of available coachees (team members)
- "Start New Session" workflow
- Session creation with proper user assignment

### 2. **Session Management**
- Save coaching sessions to database
- Session status management (draft/submitted)
- Session history and reports
- Edit existing sessions

### 3. **User Management & Authentication**
- User login/authentication
- Multi-tenant user management
- Role-based access control
- Team membership management

### 4. **Advanced Features**
- Session analytics and reporting
- Progress tracking over time
- Framework comparison and benchmarking
- Export capabilities

## Development Notes

### Data Flow Strategy
- **Frontend**: Simple data structures for UI manipulation
- **Backend**: Database-compatible schema with proper relationships
- **Transformation Layer**: Convert between frontend and backend formats

### Scoring Implementation
- **Critical**: Never modify scoring thresholds without explicit discussion
- **Manual Overrides**: Allow coaches to override automatic calculations
- **Real-time Calculation**: Updates as behaviors are checked/unchecked

### Multi-tenant Architecture
- Hard-coded tenant ID for pilot phase
- Architecture ready for full multi-tenant deployment
- Proper data isolation through tenant_id foreign keys

## 🚀 Quick Context for New Development Sessions

**CURRENT STATE**: Coaching Session Page Fully Functional ✅
- Framework creation: WORKING
- Framework listing: WORKING  
- Coaching session interface: WORKING with real data
- Proficiency calculation: WORKING with correct business logic

**ENVIRONMENT:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Active coaching session: http://localhost:3000/session/create

**NEXT DEVELOPMENT PRIORITY:**
Coach/Coachee selection system - bridge the gap between user login and coaching session

**KEY ARCHITECTURAL DECISIONS:**
- Reusable component architecture in `/components`
- Data transformation layer for frontend/backend compatibility
- Cumulative point threshold scoring system (DO NOT SIMPLIFY)
- Framework versioning ready for production use
- Session state management with auto-save capability