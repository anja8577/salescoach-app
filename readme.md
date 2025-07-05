# SalesCoach App - Project Status
---
Last Updated: July 05, 2025 - User & Team Management Completed ✅

## Architecture Overview
- **Frontend**: Next.js (React) - Port 3000
- **Backend**: Node.js/Express - Port 5000  
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Authentication**: JWT-based with bcrypt password hashing

## Database Schema (Complete - Multi-Tenant)

### Core Tables Implemented:

#### `tenants` - Organizations
- `id` (UUID, Primary Key)
- `name` (Text)
- `created_at` (Timestamp)

#### `users` - System Users
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) ✅
- `name` (Text)
- `email` (Text, Unique)
- `password_hash` (Text)
- `system_role` (Text: 'admin', 'user')
- `active` (Boolean, Default: true)
- `created_at` (Timestamp)

#### `teams` - Organizational Teams
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key → tenants.id) ✅
- `name` (Text)
- `created_at` (Timestamp)

#### `team_memberships` - User-Team Relationships
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `team_id` (UUID, Foreign Key → teams.id)
- `team_role` (Text: 'coach', 'coachee')
- `tenant_id` (UUID, Foreign Key → tenants.id) ✅
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

## Multi-Tenant Architecture ✅

### **Complete Tenant Isolation**
All core tables now include `tenant_id` for proper multi-tenant security:
- ✅ **users**: Isolated by tenant
- ✅ **teams**: Isolated by tenant  
- ✅ **team_memberships**: Isolated by tenant
- ✅ **frameworks**: Isolated by tenant
- ✅ **All framework-related tables**: Isolated by tenant

### **Security Model**
- **Authentication**: JWT-based with user tenant identification
- **API Security**: All routes filter by `req.user.tenant_id`
- **Data Isolation**: Users only see/modify data from their own tenant
- **Foreign Key Constraints**: Proper database relationships with cascade deletes

### **Role Architecture**
#### System Roles (users.system_role):
- `admin` - Can access admin module, manage users/teams/frameworks
- `user` - Regular users who participate in coaching

#### Team Roles (team_memberships.team_role):
- `coach` - Can conduct coaching sessions with team members
- `coachee` - Receives coaching from coaches

**Example User Flow:**
```
User: "John Doe" (tenant: ACME Corp)
├── system_role: 'user' (in users table)
└── Team Memberships:
    ├── Sales Team: role = 'coach'   (can coach others in Sales Team)
    └── Training Team: role = 'coachee' (receives coaching in Training Team)
```

## Features Completed ✅

### **User Management System (Complete Admin Interface)**
- **Admin Users Page**: `/admin/users` - Complete user management interface
  - **User List**: Grid view with user details, roles, and team memberships
  - **Create Users**: Full user creation with email, name, role assignment
  - **Edit Users**: Inline editing of user details and role changes
  - **Deactivate Users**: Soft delete functionality (sets active = false)
  - **Search & Filter**: Real-time user search by name/email
  - **Role Management**: System role assignment (admin/user)
  - **Team Overview**: Display of user's team memberships and roles
  - **Tenant Isolation**: Only shows users from current admin's tenant

### **Team Management System (Complete Admin Interface)**
- **Admin Teams Page**: `/admin/teams` - Complete team management interface
  - **Team List**: Grid view with team details and member counts
  - **Create Teams**: Team creation with coach/coachee assignment
  - **Edit Teams**: Full team editing with member management
  - **Delete Teams**: Secure team deletion with confirmation
  - **Member Management**: Assign users as coaches or coachees
  - **User Selection**: Searchable user picker with role assignment
  - **Member Display**: Visual representation of coaches vs coachees
  - **Real-time Updates**: Automatic refresh after changes
  - **Tenant Isolation**: Only shows teams from current admin's tenant

### **Authentication System (Full Implementation)**
- **JWT Authentication**: Secure token-based authentication with bcrypt password hashing
- **Login/Logout**: Complete authentication flow with proper token management
- **Protected Routes**: Role-based access control for admin features
- **Profile Management**: Users can update name, email, and change passwords
- **Role Detection**: Automatic admin feature visibility based on user roles
- **Password Security**: All passwords properly hashed with bcrypt
- **SSR-Safe**: Authentication context handles server-side rendering properly
- **Multi-Tenant Aware**: Authentication includes tenant identification

### **Framework Management (Full CRUD)**
- **Framework List Page**: `/admin/frameworks` - Shows all frameworks for tenant
- **Framework Creation**: `/admin/frameworks/create` - Complete framework builder
- **Backend APIs**: Full framework management with versioning
- **Admin Access**: Only admin users can access framework management
- **Tenant Isolation**: Frameworks isolated by tenant

### **Advanced UI Components**
- **Admin Layout**: Consistent admin interface with sidebar navigation
- **Modal System**: Professional modal dialogs for create/edit operations
- **Search Components**: Real-time search with filtering
- **User Selection**: Multi-select user picker with role assignment
- **Message System**: Success/error message display with auto-dismiss
- **Loading States**: Proper loading indicators for all operations
- **Responsive Design**: Mobile-first design with responsive grids

### **Component Architecture** 
- **Reusable Components**: Extracted to `/components`
  - `CollapsibleSection.js` - With status indicators
  - `BehaviorLevelsSection.js` - Level management
  - `StructureSection.js` - Framework structure builder
  - `InlineEditableText.js` - Inline editing utility
  - `LayoutAdmin.js` - Admin layout with navigation
- **Authentication Context**: Complete user state management
- **Protected Route Component**: Route-level access control

## Current Setup Details

### Environment
- **Tenant ID**: `cd663ebb-a679-4841-88b0-afe1eb13bec8`
- **Supabase URL**: https://dulshypdifqdijzvsjfk.supabase.co
- **Frontend URL**: http://localhost:3000
- **Backend URL**: http://localhost:5000

### Authentication Test Users
```
Admin User:
- Email: anja@akticon.net
- Password: admin123
- Role: admin (can access admin module)
- Can manage: users, teams, frameworks

Regular Users:
- Email: croatia_eln@akticon.net
- Password: croatia123  
- Role: user

- Email: info@akticon.net
- Password: test123
- Role: user
```

### File Structure (Current)
```
salescoach-app/
├── frontend/
│   ├── src/app/
│   │   ├── login/page.js (✅ Complete login system)
│   │   ├── profile/page.js (✅ Profile management)
│   │   ├── admin/
│   │   │   ├── users/page.js (✅ USER MANAGEMENT - NEW)
│   │   │   ├── teams/page.js (✅ TEAM MANAGEMENT - NEW)
│   │   │   └── frameworks/
│   │   │       ├── page.js (✅ Framework list)
│   │   │       └── create/page.js (✅ Framework creation)
│   │   └── layout.js (✅ With AuthProvider)
│   ├── src/contexts/
│   │   └── AuthContext.js (✅ Complete auth state management)
│   ├── src/components/
│   │   ├── ProtectedRoute.js (✅ Route protection)
│   │   ├── LayoutAdmin.js (✅ Admin layout with navigation)
│   │   └── ui/ (✅ Complete UI component library)
│   └── public/images/
│       └── salescoach-icon.png (✅ Brand logo)
└── backend/
    ├── middleware/
    │   └── auth.js (✅ JWT middleware with tenant support)
    ├── routes/
    │   ├── auth.js (✅ Login, profile, password change)
    │   ├── admin/
    │   │   ├── users.js (✅ USER MANAGEMENT APIS - NEW)
    │   │   └── teams.js (✅ TEAM MANAGEMENT APIS - NEW)
    │   └── frameworks.js (✅ Framework CRUD)
    ├── app.js (✅ All routes configured)
    └── supabaseClient.js (✅ Working)
```

## Working APIs

### **User Management (Admin Only)**
- `GET /api/admin/users` - List all users with team memberships (admin only)
- `POST /api/admin/users` - Create new user (admin only)
- `PUT /api/admin/users/:id` - Update user details and role (admin only)
- `DELETE /api/admin/users/:id` - Deactivate user (admin only)

### **Team Management (Admin Only)**
- `GET /api/admin/teams` - List all teams with member details (admin only)
- `POST /api/admin/teams` - Create new team (admin only)
- `PUT /api/admin/teams/:id` - Update team name (admin only)
- `DELETE /api/admin/teams/:id` - Delete team and all memberships (admin only)
- `POST /api/admin/teams/:id/members` - Add member to team with role (admin only)
- `DELETE /api/admin/teams/:id/members/:userId` - Remove member from team (admin only)

### **Authentication Endpoints**
- `POST /api/auth/login` - User authentication with JWT token generation
- `GET /api/auth/me` - Get current user profile (protected)
- `PUT /api/auth/me` - Update user profile (protected)
- `PUT /api/auth/change-password` - Change user password (protected)

### **Framework Management**
- `GET /api/frameworks/tenant/:tenantId/list` - List frameworks for tenant with stats
- `POST /api/frameworks` - Create framework with full hierarchy
- `GET /api/frameworks/tenant/:tenantId` - Get active framework structure for coaching

## Security Configuration

### **Multi-Tenant Security**
- **Tenant Isolation**: All database queries filtered by tenant_id
- **API Security**: Backend middleware validates tenant access
- **User Restrictions**: Users can only see/modify data from their own tenant
- **Admin Scope**: Admin users can only manage users/teams within their tenant

### **Authentication Security**
- **Password Hashing**: All passwords secured with bcrypt (salt rounds: 10)
- **JWT Tokens**: 24-hour expiration, secure token generation
- **Protected Routes**: Backend middleware validates all protected endpoints
- **Role-Based Access**: Admin features restricted to admin users only

### **Database Security**
- **Row Level Security (RLS)**: Currently DISABLED for development
  - ⚠️ **Note**: RLS is turned off to simplify development
  - **Production Todo**: Re-enable RLS with proper policies
- **Foreign Key Constraints**: Proper relationships with CASCADE deletes
- **Input Validation**: All user inputs validated on backend

## Business Logic

### **User Management Business Rules**
- **Soft Delete**: Users are deactivated (active = false) rather than deleted
- **Team Cleanup**: When user deactivated, team memberships are removed
- **Role Flexibility**: Users can be coaches in some teams, coachees in others
- **Admin Creation**: New users can be created with admin privileges
- **Email Uniqueness**: Email addresses must be unique across the entire system

### **Team Management Business Rules**
- **Multi-Role Assignment**: Users can have different roles in different teams
- **Membership Management**: Adding/removing members updates team displays in real-time
- **Clean Deletion**: Deleting teams removes all member assignments
- **Name Uniqueness**: Team names must be unique within a tenant
- **Member Flexibility**: Team composition can be updated at any time

### **Proficiency Scoring System**

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

## Features In Progress 🚧
- Framework Edit Functionality (update existing frameworks)
- Coaching Session Management Integration

## Next Features to Build
1. **Framework Edit Functionality** (update existing frameworks)
2. **Coaching Session Management** (integrate with user/team system)
   - Coach selects coachees from their teams
   - Real user assignment to coaching sessions
   - Session history and management
3. **Dashboard Improvements** (role-based home screens)
4. **Reporting & Analytics** (team performance, user progress)

## Development Notes

### **Multi-Tenant Implementation**
```
Authentication Flow:
1. User logs in with email/password
2. Backend validates credentials and retrieves user + tenant_id
3. JWT token includes user info + tenant_id
4. All API requests filtered by req.user.tenant_id
5. Frontend only sees data from user's tenant
```

### **Team Management Architecture**
- **Flexible Role System**: Users can be coaches in one team, coachees in another
- **Real-time Updates**: UI refreshes automatically after member changes
- **Search Integration**: Real-time user search for team assignment
- **Visual Clarity**: Clear distinction between coaches and coachees

### **User Management Security**
- **Admin Restrictions**: Only admin users can access user management
- **Tenant Boundaries**: Admins can only manage users in their own tenant
- **Soft Deletes**: Users are deactivated to preserve data integrity
- **Password Handling**: New user passwords are auto-generated and hashed

### **Design System Consistency**
- **Color Coding**: Blue (primary), Green (success), Orange (caution), Red (danger)
- **Modal Patterns**: Consistent create/edit modal designs
- **Grid Layouts**: Responsive card grids for list views
- **Search Patterns**: Consistent search box styling and behavior

## 🚀 Quick Context for New Development Sessions

**CURRENT STATE**: User & Team Management Complete ✅
- Multi-tenant authentication: FULLY WORKING
- User management (admin): FULLY WORKING  
- Team management (admin): FULLY WORKING
- Framework management: FULLY WORKING
- Complete admin interface: FULLY WORKING

**ENVIRONMENT:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Admin login: anja@akticon.net / admin123
- Admin features: `/admin/users`, `/admin/teams`, `/admin/frameworks`

**NEXT DEVELOPMENT PRIORITY:**
Coaching Session Management Integration - connect the coaching interface with real users and teams

**KEY ARCHITECTURAL DECISIONS:**
- Complete multi-tenant architecture with tenant_id in all relevant tables
- Two-tier role system (system roles + team roles for flexibility)
- Soft delete for users to preserve data integrity
- Real-time UI updates with proper state management
- Search-driven user/team assignment interfaces

**COMPLETED MILESTONES:**
✅ Authentication & Security
✅ Multi-Tenant Database Architecture  
✅ User Management (Complete Admin Interface)
✅ Team Management (Complete Admin Interface)
✅ Framework Management (Admin Interface)
✅ Professional UI/UX with Consistent Design System

**READY FOR:**
- Coaching session creation with real user/team selection
- Framework editing functionality
- Advanced reporting and analytics features

## 🎯 Next Development Phase: Coaching Session Integration

### **Integration Requirements**
The existing coaching session interface (`/session/create`) needs to be connected to the real user/team system:

#### **Current State of Coaching Interface:**
- ✅ **Framework Integration**: Already pulls real framework data (Framework ID: `7b5dbd81-bc61-48d7-8d39-bb46d4d00d74`)
- ✅ **Spider Graph**: Working visualization of proficiency scores
- ✅ **Behavior Scoring**: Functional checkbox system with point calculation
- ✅ **Notes System**: 4 coaching note sections working
- ❌ **User Selection**: Currently uses placeholder data
- ❌ **Session Persistence**: Not saving to database
- ❌ **Team Integration**: No connection to team memberships

#### **Integration Tasks Required:**

### **1. User Selection Enhancement**
**Current:** Hardcoded placeholder users  
**Target:** Real team-based user selection

```javascript
// Replace this pattern:
const coacheeId = "placeholder-user";

// With this pattern:
const { data: teamMembers } = await apiCall(`/api/teams/${teamId}/members?role=coachee`);
```

**Implementation:**
- Add coach authentication check
- Filter coachees based on coach's team memberships
- Display coachee selection dropdown/list
- Validate coach has permission to coach selected user

### **2. Session Persistence Integration**
**Current:** Session data only in memory  
**Target:** Full database persistence with user relationships

**Database Flow:**
```
1. coaching_sessions table: Create session record with coach_id, coachee_id, team_id
2. session_notes table: Save coaching observations
3. session_scores table: Save behavior scoring results
```

**API Integration Points:**
- `POST /api/coaching-sessions` (already exists, needs user integration)
- `POST /api/session-notes` (already exists)
- `POST /api/session-scores` (already exists)

### **3. Team-Based Access Control**
**Authentication Requirements:**
- Only coaches can create sessions
- Coaches can only select coachees from their teams
- Session history filtered by user permissions

**Team Relationship Logic:**
```sql
-- Coach can coach User X if:
SELECT tm1.user_id as coach_id, tm2.user_id as coachee_id
FROM team_memberships tm1
JOIN team_memberships tm2 ON tm1.team_id = tm2.team_id
WHERE tm1.team_role = 'coach' 
AND tm2.team_role = 'coachee'
AND tm1.tenant_id = tm2.tenant_id
```

### **4. Session History & Management**
**New Pages Needed:**
- `/sessions/history` - List coach's previous sessions
- `/sessions/[id]` - View/edit existing session
- Dashboard integration showing recent sessions

### **5. Navigation & UX Updates**
**Current Navigation:** Generic session creation  
**Target Navigation:** Role-based coaching workflow

**Coach Experience:**
```
Home → Select Coachee → Choose Framework → Conduct Session → Save & Review
```

### **Technical Implementation Notes**

#### **Existing Assets to Leverage:**
- ✅ **AuthContext**: Already provides user info and roles
- ✅ **API Infrastructure**: Team/user endpoints already built
- ✅ **Session UI**: Coaching interface is complete
- ✅ **Database Schema**: All required tables exist

#### **Key Integration Points:**
1. **User Selection Component**: New component for coach/coachee selection
2. **Session Persistence**: Connect existing UI to database APIs
3. **Permission Checking**: Validate coaching relationships
4. **Session Management**: CRUD operations for saved sessions

#### **Data Flow Integration:**
```
1. Coach logs in → AuthContext provides user + teams
2. Coach starts session → Fetch coachees from coach's teams  
3. Coach selects coachee → Load framework (already working)
4. Coach conducts session → Save to database (new integration)
5. Coach completes session → Redirect to history/dashboard
```

#### **Critical Integration Order:**
1. **User Selection First**: Connect team memberships to session creation
2. **Session Persistence Second**: Save sessions with user relationships
3. **History/Management Third**: List and manage saved sessions
4. **Dashboard Integration Last**: Show sessions in main navigation

#### **Testing Scenarios:**
- Coach with multiple teams can see coachees from all teams
- Coach cannot select users they're not authorized to coach
- Session data persists correctly with user relationships
- Session history shows only sessions for current user
- Admin can see all sessions (different permission level)

### **Development Environment Setup**
When starting new development session:

1. **Verify Active Framework**: Framework ID `7b5dbd81-bc61-48d7-8d39-bb46d4d00d74`
2. **Test Users Available**: anja@akticon.net (admin), croatia_eln@akticon.net (user)
3. **Test Teams**: Should have teams with coach/coachee assignments
4. **Current Session Page**: http://localhost:3000/session/create (working UI)

### **Success Criteria:**
- ✅ Coach can select real coachees from their teams
- ✅ Sessions save to database with proper user relationships
- ✅ Session history shows coach's previous sessions
- ✅ Coaching UI maintains all current functionality
- ✅ Multi-tenant security maintained throughout