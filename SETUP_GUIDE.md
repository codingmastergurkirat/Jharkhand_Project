# Complete Setup Guide: Government of Jharkhand Collaborative Governance Portal
## SIH26043 - Team LIMITLESS

This guide walk you step-by-step through configuring Supabase, setting up environment variables, running database migrations, seeding all test accounts, and launching the application.

---

### Prerequisites
- **Node.js**: v18+ or v20+ LTS
- **npm** or **pnpm**
- A free **Supabase** account ([supabase.com](https://supabase.com))

---

### Step 1: Create a New Supabase Project
1. Log into your [Supabase Dashboard](https://app.supabase.com).
2. Click **New Project**.
3. Set:
   - **Name**: `jharkhand-governance-portal`
   - **Database Password**: Set a secure password (store it safely)
   - **Region**: Select `South Asia (Mumbai)` for minimal latency in India
4. Wait approximately 2 minutes for the database to provision.

---

### Step 2: Configure Supabase Auth (CRITICAL FOR LIVE DEMOS)
> [!IMPORTANT]
> **Disable Email Confirmations**:
> In hackathons and judge evaluations, live emails can land in spam or introduce delivery lag. You must disable email verification so newly created or seeded accounts can sign in immediately:
1. In the Supabase Dashboard, navigate to **Authentication** > **Providers** > **Email**.
2. Toggle **"Enable Email Confirmations"** to **OFF**.
3. Click **Save**.

---

### Step 3: Run Database Migrations in Supabase SQL Editor
Navigate to the **SQL Editor** tab in your Supabase Dashboard. Run the 4 migration scripts in the exact order below:

#### 1. Run `supabase/001_schema.sql`
- Creates all 9 core tables: `profiles`, `access_codes`, `problems`, `problem_supporters`, `proposals`, `proposal_students`, `industry_interests`, `milestones`, `impact_metrics`.
- Configures database triggers:
  - `trigger_sync_support_count`: Keeps `problems.support_count` synced with 1-vote-per-user.
  - `trigger_sync_problem_status`: Automatically updates `problems.status` when university milestones progress.
  - `on_auth_user_created`: Automatically creates a matching profile in `public.profiles` from `auth.users.raw_user_meta_data`.

#### 2. Run `supabase/002_rls_policies.sql`
- Enables Row Level Security (RLS) on all tables with role-based policies for Citizens, Universities, Industries, and State Admins.
- Creates the `problem-evidence` storage bucket with public read access and authenticated upload permissions.

#### 3. Run `supabase/003_seed_data.sql`
- Inserts pre-generated single-use institutional access codes (`UNIV-JH-8821`, `UNIV-JH-4409`, `IND-JH-9132`).
- Seeds 10 realistic societal challenges across Jharkhand districts and domains.
- Populates milestones, CSR interests, and Before/After resolution proofs with 5-star citizen satisfaction ratings.

#### 4. Run `supabase/004_functions.sql`
- Creates the atomic `redeem_access_code` Postgres function (with `FOR UPDATE` lock preventing double-redemption under race conditions).
- Creates the `toggle_problem_support` stored procedure.

---

### Step 4: Configure Local Environment Variables
In your local project root (`jharkhand-governance-portal/`), create a `.env.local` file:

```bash
cp .env.example .env.local
```

Fill in your actual project keys from Supabase Dashboard (**Project Settings** > **API**):

```env
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Public Anonymous Key (safe for browser client)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Secret Service Role Key (server-side only, used for seeding Auth users)
# NEVER commit this key to GitHub!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Step 5: Run Automated Account Seeding Script
Run the TypeScript seed script to create all 12 demo Auth users (Admin, Citizen, 5 Universities, 5 Industries) with pre-verified email status:

```bash
npm run seed
```

You will see output confirming all 12 accounts created:
```
================================================================
GOVERNMENT OF JHARKHAND COLLABORATIVE GOVERNANCE PLATFORM
Seeding Demo Accounts & Verifying Profiles
================================================================
✅ Created Jharkhand State Admin [admin.jharkhand@gov.in]
✅ Created Ramesh Kumar [ramesh.citizen@gmail.com]
✅ Created Indian Institute of Technology (ISM) Dhanbad [admin@iitism.ac.in]
✅ Created Birla Institute of Technology (BIT) Mesra [admin@bitmesra.ac.in]
✅ Created Tata Steel Limited [csr@tatasteel.com]
...
================================================================
Seeding complete! All 12 demo accounts are active and ready.
================================================================
```

---

### Step 6: Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

### Step 7: Testing & Demo Evaluation Flow
1. **Homepage / Quick Login**:
   - Navigate to `/login` or view the embedded **1-Click Demo Evaluation Logins** drawer on the homepage.
   - Click on any role badge (e.g. **👑 State Admin** or **👤 Citizen**) to authenticate instantly without manual typing!
2. **Citizen Flow (`/citizen`)**:
   - Report a challenge: Notice the silent GPS background capture and manual 24-district dropdown.
   - Enter a title similar to an existing issue in Ranchi: observe the **Duplicate Alert Banner** with 1-click **+1 Support**.
   - Review statutory compliance with the **Digital Personal Data Protection Act, 2023 (DPDP Act 2023)**.
3. **University Flow (`/university`)**:
   - Inspect the **Algorithmic Matching Queue**: observe the transparent scoring breakdown (Domain + District + Keyword overlap).
   - Accept a challenge: assign a faculty mentor + add dynamic student members in the team roster.
   - Check off milestones in the **Milestone Progression** tab: observe the database trigger automatically updating the problem status!
4. **Industry CSR Flow (`/industry`)**:
   - Filter vetted university proposals by domain and district.
   - Click **Express CSR Interest** to pledge funding grant capital or mentorship.
5. **Government Admin Flow (`/admin`)**:
   - Inspect state-wide KPIs, visual domain/district charts, and the tabular leaderboard.
   - Open the **Assignment Override Center** to manually override an algorithmic match.
   - Generate a single-use access code (`PREFIX-JH-####`) and verify it in the table.
   - Open **Resolution Proofs** to audit side-by-side Before/After photos and 5-star citizen verification ratings.
