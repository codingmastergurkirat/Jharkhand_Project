# Complete Setup Guide: Jan Samadhan (जन समाधान)
## Collaborative Governance & Societal Problem Resolution Portal

This guide walks you step-by-step through configuring Supabase, setting up environment variables, running database migrations, seeding all test accounts, and launching the application.

---

### Prerequisites
- **Node.js**: v18+ or v20+ LTS
- **npm** or **pnpm**
- A **Supabase** project ([supabase.com](https://supabase.com))

---

### Step 1: Create a New Supabase Project
1. Log into your [Supabase Dashboard](https://app.supabase.com).
2. Click **New Project**.
3. Set:
   - **Name**: `jan-samadhan-portal`
   - **Database Password**: Set a secure password (store it safely)
   - **Region**: Select `South Asia (Mumbai)` for minimal latency in India
4. Wait approximately 2 minutes for the database to provision.

---

### Step 2: Configure Supabase Auth (CRITICAL FOR LIVE EVALUATION)
> **Disable Email Confirmations**:
> For smooth evaluation and instant onboarding without email delivery delays, disable email confirmation:
> 1. In your Supabase Dashboard, navigate to **Authentication** > **Providers** > **Email**.
> 2. Toggle **"Enable Email Confirmations"** to **OFF**.
> 3. Click **Save**.

---

### Step 3: Run Database Migrations in Supabase SQL Editor
Navigate to the **SQL Editor** tab in your Supabase Dashboard. Run the 4 migration scripts in the exact order below:

#### 1. Run `supabase/001_schema.sql`
- Drops existing tables with `CASCADE` if re-running.
- Creates all 9 core tables: `profiles`, `access_codes`, `problems`, `problem_supporters`, `proposals`, `proposal_students`, `industry_interests`, `milestones`, `impact_metrics`.
- Enforces mandatory evidence in the database schema: `photo_urls text[] NOT NULL CHECK (cardinality(photo_urls) >= 1)`.
- Configures automated database triggers:
  - `trigger_sync_support_count`: Keeps `problems.support_count` synced with 1-vote-per-user.
  - `trigger_sync_problem_status`: Automatically transitions `problems.status` between `'in_progress'` and `'completed'` when university milestones are marked complete.
  - `on_auth_user_created`: Automatically creates a matching profile in `public.profiles` from `auth.users.raw_user_meta_data`.

#### 2. Run `supabase/002_rls_policies.sql`
- Configures clean, non-recursive Row Level Security (RLS) policies allowing authenticated users to submit problems, register proposals, assign student teams, record milestones, and pledge CSR grants without policy rejections.
- Creates the `problem-evidence` storage bucket with public read access and authenticated upload permissions.

#### 3. Run `supabase/003_seed_data.sql`
- Inserts pre-generated single-use institutional access codes (`UNIV-JH-8821`, `UNIV-JH-4409`, `IND-JH-9132`).
- Seeds 10 realistic societal challenges with mandatory photographic evidence across administrative districts and domains.
- Populates milestones, CSR interests, and Before/After resolution proofs with 5-star citizen satisfaction ratings.

#### 4. Run `supabase/004_functions.sql`
- Creates the atomic `redeem_access_code` Postgres function (`SECURITY DEFINER` with row-locking `FOR UPDATE` preventing double-redemption under race conditions).
- Creates the `toggle_problem_support` stored procedure.
- Creates the `admin_override_assignment` stored procedure.

---

### Step 4: Configure Local Environment Variables
In your local project root, create or edit `.env.local`:

```env
# Project URL (from Supabase Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Public Anonymous Key (safe for browser client)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Secret Service Role Key (server-side only, used for seeding Auth users)
# NEVER commit this key to public repositories!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Step 5: Run Automated Account Seeding Script
Run the TypeScript seed script to create all 12 pre-seeded demo Auth users (Admin, Citizen, 5 Universities, 5 Industries) with pre-verified email status:

```bash
npm run seed
```

You will see output confirming all 12 accounts created:
```
================================================================
JAN SAMADHAN (जन समाधान) COLLABORATIVE GOVERNANCE PLATFORM
Seeding Demo Accounts & Verifying Profiles
================================================================
✅ Created Jan Samadhan Administrator [admin.jharkhand@gov.in]
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

### Step 6: Build and Launch the Application

#### Build Verification:
```bash
npm run build
```

#### Start Development Server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

### Step 7: Testing & Evaluation Flow
1. **Homepage / Quick Login**:
   - Navigate to `/login` or view the embedded **1-Click Demo Evaluation Logins** drawer on the homepage.
   - Click on any role badge (e.g. **👑 Portal Admin** or **👤 Citizen**) to authenticate instantly without manual typing!
2. **Citizen Flow (`/citizen`)**:
   - Report a challenge: Observe the silent GPS background capture and manual district selection.
   - Attach mandatory photographic evidence (1 to 3 images required). Notice the validation check prevents submission without evidence.
   - Enter a title similar to an existing issue: observe the **Duplicate Alert Banner** with 1-click **+1 Support**.
   - Review statutory legal consent under the **Digital Personal Data Protection Act, 2023 (DPDP Act 2023)**.
3. **University Flow (`/university`)**:
   - Inspect the **Algorithmic Matching Queue**: observe the transparent scoring breakdown (Domain + District + Keyword overlap) and citizen photo evidence thumbnails.
   - Formulate a proposal: inspect citizen evidence photos, assign a faculty mentor, and add dynamic student team members.
   - Check off milestones in the **Milestones & State Sync** tab: observe the automated database trigger transition problem status to Completed!
4. **Industry CSR Flow (`/industry`)**:
   - Filter vetted university proposals by domain and district.
   - Inspect citizen ground evidence photos directly on each proposal card.
   - Click **Express CSR Interest** to pledge funding grant capital or technical mentorship.
5. **Admin Flow (`/admin`)**:
   - Inspect national KPIs, visual domain/district charts, and the tabular leaderboard.
   - Open the **Assignment Override Center** to inspect citizen evidence and reassign allocations.
   - Generate single-use access codes (`PREFIX-JH-####`) and verify them in the table.
   - Open **Resolution Proofs** to audit side-by-side Before/After photos and 5-star citizen verification ratings.
