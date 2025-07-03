# SalesCoach App - Project Status
---
Last Updated: July 03, 2025 - Profile Management Completed ✅

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
  - **Spider Graph Visualization**: Real-time visual proficiency overview
  - 4 coaching notes sections:
    - Key Observations
    - What Went Well  
    - What Could Be Improved
    - Action Plan / Next Steps
  - Auto-save functionality
  - Overall proficiency display

### User Interface & Navigation
- **Home Dashboard**: `/` - Welcome screen with quick actions
  - Navigation to coaching sessions, history, profile
  - Placeholder analytics and recent activity
- **Profile Management**: `/profile` - Complete user profile system
  - Inline profile editing (name, email)
  - Password change functionality  
  - Admin access button (when authenticated)
  - Logout functionality
- **Navigation System**: Consistent mobile-first navigation
  - Bottom navigation for main app (Home, New Session, History, Profile)
  - Admin sidebar navigation with "Back to App" functionality
  - Responsive design for mobile and desktop

### Component Architecture 
- **Reusable UI Components**: Complete component library
  - `Button` - With variant, size, and color support
  - `Input` - Form input with proper styling
  - `Label` - Form labels with accessibility
  - `Card` - Card layouts with header, content, footer
  - `SpiderGraph` - Interactive proficiency visualization
- **Layout Components**: 
  - `LayoutApp` - Main app layout with bottom navigation
  - `LayoutAdmin` - Admin layout with sidebar navigation
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
│   │   ├── page.js (✅ Home Dashboard)
│   │   ├── profile/page.js (✅ Profile Management)
│   │   ├── admin/
│   │   │   └── frameworks/
│   │   │       ├── page.js (✅ Framework List)
│   │   │       └── create/page.js (✅ Framework Creation)
│   │   └── session/
│   │       └── create/page.js (✅ Coaching Session with Spider Graph)
│   ├── src/components/
│   │   ├── LayoutApp.js (✅ Working)
│   │   ├── LayoutAdmin.js (✅ Working)
│   │   ├── SpiderGraph.js (✅ Working)
│   │   └── ui/
│   │       ├── button.js (✅ Complete with variants)
│   │       ├── input.js (✅ Working)
│   │       ├── label.js (✅ Working)
│   │       └── card.js (✅ Working)
└── backend/
    ├── routes/
    │   ├── frameworks.js (✅ Enhanced with list API)
    │   ├── tenants.js (✅ Complete framework structure APIs)
    │   ├── profile.js (✅ Ready for auth integration)
    │   ├── auth.js (✅ Ready for auth integration)
    │   ├── coachingSessions.js (✅ Updated with framework_id)
    │   ├── sessionNotes.js (✅ Working)
    │   ├── sessionScores.js (✅ Working)
    │   └── [other routes...]
    ├── app.js (✅ Working with profile/auth routes)
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

### Profile & Auth APIs (Ready for Integration)
- **GET** `/api/profile` - Get current user profile
- **PUT** `/api/profile` - Update user profile
- **PUT** `/api/auth/change-password` - Change user password

## Current Limitations & Next Priority 🚧

### **CRITICAL MISSING: Authentication System**
The app is fully functional but lacks user authentication, which prevents:
- User login/logout
- Role-based access (admin vs coach vs coachee)
- Admin module access
- Session persistence tied to real users
- Multi-tenant security

### **What Works Without Auth:**
- ✅ All UI components and navigation
- ✅ Framework management (admin functions)
- ✅ Coaching session interface with real framework data
- ✅ Profile management (localStorage only)
- ✅ Spider graph visualization
- ✅ All database APIs

### **What Needs Auth:**
- ❌ User login/logout flow
- ❌ Admin button visibility in profile
- ❌ Coach/coachee role assignment
- ❌ Session data tied to real users
- ❌ Multi-tenant security
- ❌ Real profile/password updates

## Next Development Phase: Authentication System

### **Phase 1: Basic Authentication (Priority 1)**
**Goal**: Enable login/logout and role-based access

**Components Needed:**
1. **Login Page** (`/login`)
   - Email/password form
   - JWT token generation
   - Role detection and redirect
2. **Authentication Middleware** (Backend)
   - JWT token validation
   - User role extraction
   - Protected route guards
3. **Auth Context** (Frontend)
   - User state management
   - Token storage and refresh
   - Route protection
4. **Registration Flow** (Optional for pilot)
   - User signup
   - Email verification
   - Default role assignment

### **Phase 2: User Management (Priority 2)**
**Goal**: Complete admin user/team management

**Components Needed:**
1. **Admin User Management** (`/admin/users`)
   - Create/edit/delete users
   - Role assignment
   - Team membership management
2. **Admin Team Management** (`/admin/teams`)
   - Create/edit/delete teams
   - User assignment to teams
   - Team hierarchy
3. **Coach Dashboard Enhancement**
   - Real coachee selection based on team membership
   - Session history tied to authenticated users

### **Phase 3: Session Persistence (Priority 3)**
**Goal**: Save and manage real coaching sessions

**Components Needed:**
1. **Session Creation Workflow**
   - Coach selects coachee from team
   - Creates session with real user IDs
   - Auto-save to database
2. **Session Management**
   - Draft vs submitted status
   - Edit existing sessions
   - Session history and reports
3. **Coach/Coachee Selection**
   - Team-based coachee lists
   - Session scheduling
   - Assignment workflows

## Development Notes

### **Design System & UI Guidelines**

#### **Established Design Principles (Profile Page)**
**Color Palette:**
- **Primary Blue**: `bg-blue-600 hover:bg-blue-700` (main actions, primary buttons)
- **Success Green**: `bg-green-600 hover:bg-green-700` (save actions, positive confirmations)
- **Warning Orange**: `bg-orange-600 hover:bg-orange-700` (caution actions, password changes)
- **Danger Red**: `bg-red-600 hover:bg-red-700` (destructive actions, logout)
- **Admin Purple**: `bg-purple-600 hover:bg-purple-700` (admin-specific functions)

**Card Design Pattern:**
```javascript
<Card className="border-l-4 border-l-[color]-500 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
  <CardHeader className="bg-gradient-to-r from-[color]-50 to-[adjacent-color]-50 rounded-t-lg">
    <CardTitle className="flex items-center gap-3">
      <div className="w-10 h-10 bg-[color]-500 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-xl">Section Title</span>
    </CardTitle>
  </CardHeader>
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>
```

**Button Standards:**
- **NO gradients** - Use solid colors with hover states
- **Consistent sizing**: `h-12` for large buttons, `h-10` for medium, standard height for small
- **Icon consistency**: `w-5 h-5` for button icons, `w-4 h-4` for small icons
- **Color coding**: Blue (primary), Green (save), Orange (caution), Red (danger), Purple (admin)

**Form Elements:**
- **Input height**: `h-12` for large forms, standard for compact
- **Focus states**: `focus:border-[color]-500` matching the section color
- **Label styling**: `text-base font-semibold text-gray-700` for form labels
- **Error/Success messages**: Colored backgrounds with matching left borders and icons

**Layout Standards:**
- **Card spacing**: `space-y-6` between major sections
- **Content padding**: `p-6` for card content, `p-8` for sections needing more breathing room
- **Border radius**: `rounded-lg` for cards and major elements
- **Shadow progression**: `shadow-lg hover:shadow-xl transition-shadow duration-300`

**Icon Guidelines:**
- **Section headers**: `w-10 h-10` colored background containers with `w-5 h-5` white icons
- **Buttons**: `w-5 h-5` for standard buttons, `w-4 h-4` for small buttons
- **Consistent positioning**: Icons before text in buttons, centered in containers

**Typography Hierarchy:**
- **Page titles**: `text-3xl font-bold text-gray-900`
- **Section titles**: `text-xl` in CardTitle
- **Subsection headers**: `text-lg font-bold text-gray-900`
- **Form labels**: `text-base font-semibold text-gray-700`
- **Body text**: `text-gray-600` for descriptions
- **Helper text**: `text-sm text-gray-600`

**DO NOT USE:**
- ❌ Gradient buttons (solid colors only)
- ❌ Overly playful designs (keep professional)
- ❌ Inconsistent icon sizes
- ❌ Mixed color schemes within sections
- ❌ `CardContent` for sections needing custom padding (use plain `div`)

**SSR Safety Pattern:**
```javascript
const [userState, setUserState] = useState({});

useEffect(() => {
  if (typeof window !== 'undefined') {
    const data = JSON.parse(localStorage.getItem("key") || "{}");
    setUserState(data);
  }
}, []);
```

### **Current Architecture Strengths**
- ✅ **Component-based**: Reusable UI components ready for auth integration
- ✅ **Database-ready**: All tables and relationships defined
- ✅ **API-ready**: Backend routes prepared for authentication middleware
- ✅ **Role-aware**: UI already checks for admin roles (just needs real data)
- ✅ **Multi-tenant**: Architecture supports multiple organizations

### **Authentication Integration Points**
- **Profile page**: Already has auth APIs, just needs real authentication
- **Admin access**: Already has conditional rendering, just needs user roles
- **Session creation**: Already has UI, just needs user selection and persistence
- **Navigation**: Already role-aware, just needs authenticated user context

### **Recommended Auth Approach**
1. **JWT-based authentication** with Supabase Auth or custom implementation
2. **Role-based middleware** for API protection
3. **React Context** for client-side auth state
4. **Incremental rollout**: Start with basic login, then add features

## 🚀 Quick Context for New Development Sessions

**CURRENT STATE**: Profile Management & UI Complete ✅
- All core UI components: WORKING
- Framework management: WORKING
- Coaching session interface: WORKING with spider graph
- Profile management: WORKING (localStorage only)
- Navigation system: WORKING
- Database & APIs: READY for auth integration

**ENVIRONMENT:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Active coaching session: http://localhost:3000/session/create
- Profile management: http://localhost:3000/profile

**NEXT DEVELOPMENT PRIORITY:**
Authentication system implementation to unlock admin features and real user management

**KEY ARCHITECTURAL DECISIONS:**
- Component library approach with variants and props
- Real-time spider graph visualization
- Cumulative point threshold scoring (DO NOT CHANGE)
- Multi-tenant ready architecture
- Mobile-first responsive design
- localStorage fallbacks for development without auth

# SalesCoach App - Project Status
---
Last Updated: July 03, 2025 - Authentication System Completed ✅

## Architecture Overview
- **Frontend**: Next.js (React) - Port 3000
- **Backend**: Node.js/Express - Port 5000  
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Authentication**: JWT-based with bcrypt password hashing

## Database Schema (Working)

### Core Tables Implemented:
- `tenants` - Organizations
- `users` - System users with authentication
- `teams` - Team/group management
- `team_memberships` - User-team relationships with roles
- `sales_frameworks` - Main framework records with versioning
- `behavior_levels` - Proficiency levels (Learner, Qualified, etc.)
- `framework_steps` - Main steps in framework
- `framework_substeps` - Sub-steps within steps
- `framework_behaviors` - Specific behaviors linked to levels

### Authentication Tables:
- `users` table includes: id, name, email, password_hash, system_role, created_at

### Role Architecture:
#### System Roles (users.system_role):
- `admin` - Can access admin module, manage users, frameworks
- `user` - Regular users who participate in coaching

#### Team Roles (team_memberships.team_role):
- `coach` - Can conduct coaching sessions with team members
- `coachee` - Receives coaching from coaches

**Example User Flow:**
```
User: "John Doe"
├── system_role: 'user' (in users table)
└── Team Memberships:
    ├── Team A: role = 'coach'   (can coach others in Team A)
    └── Team B: role = 'coachee' (receives coaching in Team B)
```

## Features Completed ✅

### Authentication System (Full Implementation)
- **JWT Authentication**: Secure token-based authentication with bcrypt password hashing
- **Login/Logout**: Complete authentication flow with proper token management
- **Protected Routes**: Role-based access control for admin features
- **Profile Management**: Users can update name, email, and change passwords
- **Role Detection**: Automatic admin feature visibility based on user roles
- **Password Security**: All passwords properly hashed with bcrypt (migrated from plain text)
- **SSR-Safe**: Authentication context handles server-side rendering properly

### Framework Management (Full CRUD)
- **Framework List Page**: `/admin/frameworks` - Shows all frameworks for tenant
- **Framework Creation**: `/admin/frameworks/create` - Complete framework builder
- **Backend APIs**: Full framework management with versioning
- **Admin Access**: Only admin users can access framework management

### Component Architecture 
- **Reusable Components**: Extracted to `/components`
  - `CollapsibleSection.js` - With status indicators
  - `BehaviorLevelsSection.js` - Level management
  - `StructureSection.js` - Framework structure builder
  - `InlineEditableText.js` - Inline editing utility
- **Authentication Context**: Complete user state management
- **Protected Route Component**: Route-level access control

### User Interface
- **Login Page**: Professional design matching brand colors (#11339b)
- **Profile Page**: Complete user profile management with role-based features
- **Admin Interface**: Framework management for administrative users
- **Responsive Design**: Mobile-first approach with Tailwind CSS

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
│   │   ├── admin/frameworks/ (✅ Framework management)
│   │   └── layout.js (✅ With AuthProvider)
│   ├── src/contexts/
│   │   └── AuthContext.js (✅ Complete auth state management)
│   ├── src/components/
│   │   ├── ProtectedRoute.js (✅ Route protection)
│   │   ├── CollapsibleSection.js (✅ Reused)
│   │   ├── BehaviorLevelsSection.js (✅ Reused)
│   │   ├── StructureSection.js (✅ Reused)
│   │   └── LayoutAdmin.js (✅ Working)
│   └── public/images/
│       └── salescoach-icon.png (✅ Brand logo)
└── backend/
    ├── middleware/
    │   └── auth.js (✅ JWT middleware)
    ├── routes/
    │   ├── auth.js (✅ Login, profile, password change)
    │   ├── users.js (✅ User management for admins)
    │   └── frameworks.js (✅ Framework CRUD)
    ├── app.js (✅ All routes configured)
    └── supabaseClient.js (✅ Working)
```

## Working APIs

### Authentication Endpoints
- `POST /api/auth/login` - User authentication with JWT token generation
- `GET /api/auth/me` - Get current user profile (protected)
- `PUT /api/auth/me` - Update user profile (protected)
- `PUT /api/auth/change-password` - Change user password (protected)

### Framework Management
- `GET /api/frameworks/tenant/:tenantId/list` - List frameworks for tenant with stats
- `POST /api/frameworks` - Create framework with full hierarchy
- `GET /api/frameworks/tenant/:tenantId` - Get active framework structure for coaching

### User Management (Admin Only)
- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## Security Configuration

### Authentication Security
- **Password Hashing**: All passwords secured with bcrypt (salt rounds: 10)
- **JWT Tokens**: 24-hour expiration, secure token generation
- **Protected Routes**: Backend middleware validates all protected endpoints
- **Role-Based Access**: Admin features restricted to admin users only

### Database Security
- **Row Level Security (RLS)**: Currently DISABLED for development
  - ⚠️ **Note**: RLS is turned off to simplify development
  - **Production Todo**: Re-enable RLS with proper policies
- **Password Storage**: No plain text passwords, all bcrypt hashed
- **Input Validation**: All user inputs validated on backend

## Features In Progress 🚧
- User Management Interface for Admins
- Team Management System
- Enhanced Framework Editing

## Next Features to Build
1. **Admin User Management Page** (`/admin/users`)
2. **Team Management Interface** (`/admin/teams`)
3. **Framework Edit Functionality** (update existing frameworks)
4. **Coaching Session Management** (as per original spec)
5. **Dashboard Improvements** (role-based home screens)

## Development Notes

### Authentication Flow
```
1. User enters credentials on /login
2. Backend validates with bcrypt comparison
3. JWT token generated with user info + roles
4. Token stored in localStorage (SSR-safe)
5. AuthContext manages user state globally
6. Protected routes check authentication
7. Role-based features show/hide based on user.system_role
```

### Password Security Migration
- **Before**: Plain text passwords in database
- **After**: Bcrypt hashed passwords with proper validation
- **Migration**: Manual hash generation and database updates completed

### Design System
- **Brand Color**: #11339b (used consistently across UI)
- **Component Pattern**: Card layouts with left borders for sections
- **No Gradients**: Clean, professional styling
- **Focus States**: Color-coded by section (blue for profile, orange for passwords)

## 🚀 Quick Context for New Development Sessions

**CURRENT STATE**: Authentication System Complete ✅
- JWT-based login/logout: FULLY WORKING
- Profile management: FULLY WORKING  
- Role-based access control: FULLY WORKING
- Framework management: FULLY WORKING
- Password security: FULLY WORKING

**ENVIRONMENT:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Login with: anja@akticon.net / admin123
- Tenant ID: cd663ebb-a679-4841-88b0-afe1eb13bec8

**NEXT DEVELOPMENT PRIORITY:**
Admin User Management Interface - create `/admin/users` page for user CRUD operations

**KEY ARCHITECTURAL DECISIONS:**
- JWT authentication with bcrypt password security
- Two-tier role system (system roles + team roles)
- SSR-safe authentication context
- Component reusability with data transformation layers
- RLS disabled for development (re-enable for production)

**SECURITY NOTES:**
- All passwords are bcrypt hashed
- JWT tokens expire in 24 hours
- Row Level Security currently disabled for development
- Admin features properly restricted by role checking