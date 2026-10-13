# Smart Campus Care — QR-Based Campus Complaint Management System

Smart Campus Care is a full-stack, competition-ready web application built for schools and colleges to solve campus maintenance challenges. Students report issues instantly via QR codes without needing an account, while the Complaint Management Team dispatches repairs and the Principal oversees the entire institution's SLA performance and critical safety.

---

## 1. System Architecture & Tech Stack

- **Framework:** Next.js (App Router, Turbopack)
- **Language:** TypeScript with strict type checking
- **Styling & Design System:** Tailwind CSS with custom theme design system (Inter typography, light surface design, restrained status alerts)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS) & Google OAuth
- **QR Generation & Scanning:** `qrcode` & `@zxing/browser` camera QR scanner

---

## 2. Implemented Routes & User Roles

### Public Flow (No Login Required)
- `/` — Premium institutional landing page introducing the 3-step workflow (Scan → Report → Resolve).
- `/report` — Public student complaint submission page. Pre-populates location from QR parameter (`?location=<public_id>`), features in-browser device camera QR code scanner with quick simulation, live critical safety hazard detector, asset selector, and photo upload.
- `/track/[token]` — Cryptographically secured tracking page. Displays SLA remaining countdown, visual status timeline, technician notes, repair evidence photograph, and student confirmation buttons (**"Confirm Fixed & Close Ticket"** or **"Issue Still Persists / Reopen"**).
- `/login` — Google sign-in for staff plus one-click Evaluation Mode buttons for both authorized accounts.
- `/access-denied` — Rejection screen for unauthorized Google accounts.

### Principal Oversight Panel (`/principal`)
*Restricted to `rikashrikash04@gmail.com`*
- `/principal` — Executive overview: 6 KPI metrics, 7-day resolution trend curve, high-attention unresolved tickets, category breakdown, institutional SLA compliance.
- `/principal/complaints` — Campus-wide complaint monitoring with multi-parameter search, status/priority/category filters, and deep inspection modal.
- `/principal/critical-issues` — High-priority safety queue for exposed wiring, pipe flooding, and physical hazards.
- `/principal/analytics` — Data visualizations, location hotspots, resolution velocity curve, and recurring asset failure prevention engine.
- `/principal/locations` — Campus hierarchy (Building → Floor → Room → Asset), physical QR code generation, label printing, and PNG download.
- `/principal/teams` — Maintenance squad monitoring, active task counts, and technician directory.
- `/principal/reports` — Executive report generator, printable format, and one-click CSV export.
- `/principal/settings` — Configurable SLA policies (response and resolution targets per priority) and email access control audit.

### Complaint Operations Panel (`/complaint-team`)
*Restricted to `mohdnoupa2005@gmail.com`*
- `/complaint-team` — Operational overview: 7 operational counters and prioritized dispatch queue.
- `/complaint-team/complaints` — Operations queue with quick filtering, searching, and status tracking.
- `/complaint-team/complaints/[id]` — End-to-end repair workflow: inspect photos, assign squad & lead technician, start work, record delay reasons, put on hold, upload repair completion evidence photo, and mark as resolved.
- `/complaint-team/assignments` — Task dispatch and allocation overview.
- `/complaint-team/staff` — Maintenance personnel management: add technicians, view specialty trades, and phone contacts.
- `/complaint-team/overdue` — Overdue queue highlighting SLA breaches and supervisory escalations.

---

## 3. Database Schema & Supabase Setup

The complete PostgreSQL migration script is provided in [`supabase-schema.sql`](./supabase-schema.sql).

### Tables Created:
1. `institutions` — Multi-tenant ready educational institution records.
2. `profiles` — Staff profiles linked to `auth.users(id)` with roles (`principal`, `complaint_team`, `maintenance_staff`).
3. `locations` — Hierarchical locations (Building → Floor → Room) with public QR tokens.
4. `assets` — Physical equipment (fans, ACs, projectors, taps) attached to rooms.
5. `maintenance_teams` — Specialty squads (Electrical, Plumbing, Carpentry, Housekeeping, IT).
6. `maintenance_staff` — Registered technicians with phone contacts and specialty tags.
7. `sla_policies` — Configurable SLA response & resolution target minutes per priority.
8. `complaints` — Primary complaint records with unique `SCC-100X` ticket IDs and tracking tokens.
9. `complaint_attachments` — Student photos and technician repair evidence.
10. `complaint_updates` — Comprehensive immutable audit trail for every action.
11. `notifications` — Role-based notifications (critical safety, overdue, recurring failures).
12. `audit_logs` — Administrative activity logs.

### Setting Up in Supabase:
1. Create a new project in [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in Supabase and run the contents of [`supabase-schema.sql`](./supabase-schema.sql).
3. In **Storage**, ensure the `complaint-attachments` bucket is public.

---

## 4. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authorized Staff Google Accounts
PRINCIPAL_EMAIL=rikashrikash04@gmail.com
COMPLAINT_TEAM_EMAIL=mohdnoupa2005@gmail.com
```

---

## 5. Google OAuth Setup in Supabase

1. Go to the **Google Cloud Console** > **APIs & Services** > **Credentials**.
2. Create an **OAuth 2.0 Client ID** (Web application).
3. In **Authorized redirect URIs**, add:
   ```
   https://<your-supabase-project-id>.supabase.co/auth/v1/callback
   ```
4. Copy the Client ID and Client Secret into **Supabase Dashboard** > **Authentication** > **Providers** > **Google**.
5. In Supabase **URL Configuration**, set the Site URL to `http://localhost:3000` (or your Vercel domain) and add `http://localhost:3000/auth/callback` to **Redirect URLs**.

---

## 6. Running Locally

```bash
# Navigate to the project
cd smart-campus-care

# Install dependencies (already pre-installed)
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- To report an issue as a student: [http://localhost:3000/report](http://localhost:3000/report)
- To log in as staff: [http://localhost:3000/login](http://localhost:3000/login) (Use Google OAuth or the instant Evaluation Mode buttons).

---

## 7. Deploying to Vercel

1. Push this repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set the root directory to `smart-campus-care`.
4. Add the environment variables from `.env.local`.
5. Deploy. The production build passes with 0 warnings or errors.
