# Jan Samadhan (जन समाधान)
## Collaborative Governance & Societal Problem Resolution Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2_App_Router-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4_GIGW-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Database-PostgreSQL_%2B_Live_Auth_%2B_Storage-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Compliance](https://img.shields.io/badge/Legal-DPDP_Act_2023_Compliant-1B5E20?style=flat)]()
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG_2.0_AA_Certified-E65100?style=flat)]()

---

## 🏛️ Executive Summary & Concept

**Jan Samadhan (जन समाधान)** is an end-to-end, production-grade collaborative governance platform connecting citizens, academic institutions, corporate CSR partners, and administrators.

Traditional public grievance mechanisms often suffer from bureaucratic fragmentation, lack of technical execution capacity, and delayed resolution. **Jan Samadhan transforms societal challenges into university innovation testbeds and corporate CSR partnerships:**

```
[ Citizens Report Challenges ] 
              ↓ (Silent GPS + District Dropdown + Mandatory Photo Evidence + DPDP Act 2023 Consent)
[ Deterministic Matching Engine ] 
              ↓ (Domain Overlap 50pts + District Bonus 30pts + Lab Keywords 20pts)
[ Universities Engineer Solutions ] 
              ↓ (Faculty Mentor + Dynamic Student Team Roster + Milestones)
[ Industries Pledge CSR Capital ] 
              ↓ (Funding Grants, Mentorship & Industrial Lab Access)
[ Government Oversees Impact ] 
              ↓ (Assignment Overrides, Access Code Management, Resolution Proofs)
[ Verified Community Resolution ] (Before/After Photos, Costs Avoided, 5-Star Citizen Rating)
```

---

## 🚀 Key Innovations & Architectural Highlights

### 1. Live Backend Architecture from Day One (Zero Mock Arrays)
- **100% Live Backend Database**: Every citizen report, university proposal, student roster, milestone, CSR pledge, and access code is created, queried, and updated via real PostgreSQL tables and secure Auth.
- **Mandatory Photo Evidence**: Submissions strictly require photographic evidence (minimum 1, up to 3 images) enforced at both the PostgreSQL schema level (`CHECK (cardinality(photo_urls) >= 1)`) and in the frontend form validation.
- **Cross-Portal Evidence Inspection**: Uploaded evidence photos are rendered with zoom modals across Citizen tracking, University matching queues, University proposal modals, Industry CSR proposal browsers, and Admin override centers.
- **`@supabase/ssr` App Router Session Handling**: Cookie-based session protection across Next.js Server Components, client state, and Route Handlers.
- **Database-Level Integrity via PostgreSQL Triggers**:
  - `trigger_sync_problem_status`: Exact AFTER trigger on `milestones` that transitions `problems.status` between `'in_progress'` and `'completed'` automatically when milestones are checked off.
  - `trigger_sync_support_count`: Enforces 1 vote per citizen via the `problem_supporters (problem_id, user_id)` junction table.
  - `on_auth_user_created`: Automatically builds complete rows in `public.profiles` using `raw_user_meta_data`, with strict lockout of self-assigned `admin` accounts.

### 2. Explainable, Deterministic Matching Engine (No Black-Box AI)
Judges and administrators require complete transparency. The matching algorithm evaluates institutions using an explainable 100-point scoring formula:
$$	ext{Score} = 	ext{Domain Overlap (up to 50 pts)} + 	ext{District Proximity (30 pts)} + 	ext{Facility/Expertise Keyword Match (up to 20 pts)}$$
- **Domain Specialization (+50 pts)**: Overlap between the problem vertical (e.g. *Water Management*) and university domain tags.
- **District Match Bonus (+30 pts)**: Prioritizes local district presence for rapid ground response.
- **Facility & Expertise Overlap (up to +20 pts)**: Keyword overlap between problem description and university laboratory capabilities.
- **Admin Override Authority**: Administrators can review the mathematical reasoning and override or reassign allocations with one click.

### 3. Statutory Compliance with DPDP Act 2023
- Adheres to **Section 6 (Consent)** and **Section 8 (Data Minimisation)** of the *Digital Personal Data Protection Act, 2023*.
- **Silent Geolocation + District Dropdown**: Silent background capture of GPS coordinates without external API dependencies. Exact coordinates are masked from public/industry view to protect citizen privacy, accessible only to authorized district administrative officers.

### 4. GIGW & WCAG 2.0 AA Design System
- **Strict Color Tokens**:
  - **Primary / Success**: Dark Forest Green `#1B5E20`
  - **Errors / Urgent**: Crimson `#B3261E` (strictly paired with ⚠️)
  - **Notices / Deadlines**: Orange `#E65100`
  - **Neutral**: Background `#F8F9FA`, Body Text `#1C1B1F`
- **Accessibility**: Visible 3px orange focus ring (`:focus-visible`), touch targets ≥ 44x44px, "Skip to Main Content" link, semantic landmarks.
- **Simulated Hindi Toggle**: Header provides **English | हिन्दी** switcher with instant toast notification.

---

## 👥 The Four Role Portals

| Role | Access Route | Key Capabilities |
| :--- | :--- | :--- |
| **👤 Citizen** | `/citizen` | Submit 4-step reports with mandatory photo evidence, silent GPS, duplicate detection with +1 Support, track status, submit 1-5 star verification ratings. |
| **🎓 University** | `/university` | Matched queue with score breakdown, review citizen evidence photos, accept/reject, assign faculty mentor + dynamic student team roster, milestone progression, Lessons Learned archive. |
| **🏭 Industry** | `/industry` | Multi-filter open proposals (Domain, District), view citizen ground photos, express interest (Funding, Mentorship, Both), track active CSR pledges. |
| **👑 Portal Admin** | `/admin` | National KPIs, domain/district charts, performance leaderboard, assignment override center, access code manager (`PREFIX-JH-####`), resolution proofs. |

---

## 🛠️ Quick Installation & Setup

For full details, refer to [SETUP_GUIDE.md](SETUP_GUIDE.md).

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd jharkhand-governance-portal
npm install
```

### 2. Configure Database Migrations
Run the 4 migration scripts in your Supabase SQL Editor in order:
1. `supabase/001_schema.sql` (Tables & Triggers)
2. `supabase/002_rls_policies.sql` (Row Level Security & Storage)
3. `supabase/003_seed_data.sql` (Seed Data & Resolution Proofs)
4. `supabase/004_functions.sql` (Stored Procedures)

> **Disable Email Confirmations**: In your Supabase Dashboard, navigate to **Authentication** > **Providers** > **Email**, and set **"Enable Email Confirmations"** to **OFF** so test logins work seamlessly.

### 3. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Automated Seeding & Launch Dev Server
```bash
# Seed all 12 demo accounts via Supabase Auth Admin API
npm run seed

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 🔑 1-Click Demo Evaluation Credentials

Every seeded account can be logged into with a **single click** via the embedded **Quick-Login Demo Drawer** on `/login` or the homepage:

| Role | Account Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Jan Samadhan Administrator | `admin.jharkhand@gov.in` | `Admin@Jharkhand2026` |
| **Citizen** | Ramesh Kumar | `ramesh.citizen@gmail.com` | `Citizen@2026` |
| **University** | IIT (ISM) Dhanbad | `admin@iitism.ac.in` | `Univ@IITISM2026` |
| **University** | BIT Mesra | `admin@bitmesra.ac.in` | `Univ@BIT2026` |
| **University** | NIT Jamshedpur | `admin@nitjsr.ac.in` | `Univ@NIT2026` |
| **University** | Central Univ of Jharkhand | `admin@cuj.ac.in` | `Univ@CUJ2026` |
| **University** | Usha Martin University | `admin@umu.ac.in` | `Univ@UMU2026` |
| **Industry** | Tata Steel Limited | `csr@tatasteel.com` | `Ind@Tata2026` |
| **Industry** | Central Coalfields Ltd (CCL) | `csr@centralcoalfields.in` | `Ind@CCL2026` |
| **Industry** | Bokaro Steel Plant (SAIL) | `csr@sailbokaro.in` | `Ind@SAIL2026` |
| **Industry** | Eastern Coalfields Ltd (ECL) | `csr@easterncoal.gov.in` | `Ind@ECL2026` |
| **Industry** | Uranium Corp (UCIL) | `contact@ucil.gov.in` | `Ind@UCIL2026` |

**Pre-Generated Access Codes for Testing Registration:**
- `UNIV-JH-8821` (Kolhan University, university, unused)
- `UNIV-JH-4409` (Vinoba Bhave University, university, unused)
- `IND-JH-9132` (Hindalco Industries, industry, unused)

---

## 🚫 Explicit Non-Goals (Scope Statement)

1. **No External Black-Box AI/LLM for Matching**: The matching engine is purposefully transparent and deterministic. Public administrative allocation cannot be left to stochastic hallucinations.
2. **Simulated Multilingual Content**: The header includes an **English | हिन्दी** switcher that demonstrates accessibility readiness via a toast notification; full string internationalization is excluded for the MVP.
3. **No External Reverse-Geocoding API**: GPS coordinates are captured in the background while the user selects from a reliable district dropdown. This ensures zero API rate-limiting or network failure during live evaluations.
4. **No Third-Party Paid SMS OTP Gateway**: The UI features an **"Email / Mobile Number"** field and a **"Login with OTP"** demonstration button displaying a toast alert. Live SMS gateway costs are eliminated for the MVP.
