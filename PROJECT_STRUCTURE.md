# Project Structure Documentation

This document provides a **complete, lay‑person‑friendly walkthrough** of the folder and file layout for the Real Estate Platform. It explains **what each component does**, **why it exists**, **what systems depend on it**, and **the impact of modifying or removing it**. The goal is to make the repository approachable for developers, product managers, or anyone else reviewing the code.

---

## Table of Contents

1. [Root Overview](#root-overview)
2. [`app/` – Next.js Application Layer](#app--nextjs-application-layer)
3. [`lib/` – Core Business Logic & Firebase Integration](#lib--core-business-logic--firebase-integration)
4. [Important Shared Utilities](#important-shared-utilities)
5. [Key UI Components](#key-ui-components)
6. [Chat & Realtime System](#chat--realtime-system)
7. [Agent & Agency Sub‑systems](#agent--agency-sub‑systems)
8. [Property Management Sub‑system](#property-management-sub‑system)
9. [User Management Sub‑system](#user-management-sub‑system)
10. [Safety & Warning Summary](#safety--warning-summary)

---

## 1. Root Overview

```
realstateav/
├─ app/                # Next.js pages, routes, and UI components
├─ auth/               # Authentication Context and helpers (user and agent)
├─ hooks/              # Custom React hooks (useAgent, useAgency, etc.)
├─ lib/                # Core TypeScript libraries (business logic, DB ops)
├─ public/             # Static assets (favicons, images)
├─ .env.local          # Local environment variables (Firebase config, etc.)
├─ README.md           # Architecture overview (this file)
├─ PROJECT_STRUCTURE.md # **THIS FILE** – detailed repo layout (the one you are reading)
└─ package.json        # NPM scripts, dependencies, & scripts
```

* **Why this layout?**
  * Separating **`app/`** (view layer) from **`lib/`** (logic layer) keeps UI code thin and makes the business rules reusable across different front‑ends (e.g., admin portal, mobile apps).
  * All Firebase interactions live in **`lib/`**, ensuring a single source of truth for data handling.

> **⚠️ WARNING**: Do not delete any top‑level folder. Removing `app/` or `lib/` will break the entire application, as every route and backend service relies on these.

---

## 2. `app/` – Next.js Application Layer

| Path | Purpose | Dependencies | Why It Must Stay |
|------|---------|--------------|-----------------|
| `app/agentportal/` | Agent CRM dashboards and pages | UI components, `lib/agents/*` | Handles agent onboarding, verification, property management, and chat UI. |
| `app/user/` | User‑side dashboards and pages | UI components, `lib/users/*` | Provides marketplace browsing, draft property creation, and user chat UI. |
| `app/components/` | Reusable UI widgets (e.g., `ChatWidget`) | `lib/firebase`, `lib/chat/types` | Central place for UI that appears across both user & agent portals. |
| `app/agentportal/components/` | Agent CRM specific UI (agency list, property cards, chat section, AgentWorkbench) | `lib/agents/*` | Isolated 3-column UI for the professional agent experience. |
| `app/agentportal/onboarding/` | Agent Onboarding flow & UI steps | `lib/agents/onboarding/*` | Forces newly registered agents to complete their profile setup before accessing the dashboard. |
| `app/agencyportal/` | Agency portals for managing agents and agency-wide settings | UI components, `lib/agency/*` | Contains the dashboard, preferences, and agent management logic for agency owners. |
| `app/agencyportal/components/dashboard/` | Sub-components for Agency Dashboard (Profile, ManagingAgents, Preferences) | `lib/agency/*` | Modularized structure to cleanly separate settings, agent tables, and location map logic. |
| `app/user/components/onboarding/` | User Onboarding flow & UI steps | `lib/users/onboardingActions.ts` | Multi-step setup for new users (Personal, Intent, Location, Review) ensuring full profile data. |
| `app/user/dashboard/` | User dashboard pages and sections (home, profile, property list, chats) | `lib/users/*` | Core entry point for a logged‑in user, featuring a premium intent-based dynamic UI. |
| `app/layout.tsx` | Global layout (navbar, theming) | — | Wraps all pages; removing breaks navigation. |
| `app/page.tsx` (root) | Home page / landing page | — | Entry point for visitors. |
| `app/id_verification/` | Isolated KYC/ID Verification flows | `lib/id_verify/*` | Separate UI specifically for collecting agent/agency legal documents, selfies, and metadata securely. |
| `app/admin/id_verify/` | Admin Dashboard for KYC Reviews | `lib/id_verify/*` | Allows admins to review pending KYC requests, verify cryptographic signatures, and approve/reject. |
| `app/api/` (if present) | Serverless API routes (rarely used, most logic in `lib/`) | — | Not critical now but may host custom endpoints. |

### Important Files Inside `app/`

- **`app/agentportal/agents/[slug]/page.tsx`** – The main entry for agents after login. It imports `AgentWorkbench` which acts as the 3-column layout controller.
- **`app/user/dashboard/page.tsx`** – User home after auth; features a fixed navigation sidebar with Framer Motion active-tab animations, handling routing to intent-specific home views, profile settings, favourites, and messages.
- **`app/components/ChatWidget.tsx`** – Reusable slide‑over chat UI that attaches Realtime Database listeners *only when open*.
- **`app/agentportal/components/AgentChatsSection.tsx`** – Lists all conversations for an agent and opens `ChatWidget`.

> **⚠️ WARNING**: The UI components are tightly coupled with the data‑layer functions in `lib/`. Renaming or moving them without updating imports will cause runtime errors.

---

## 3. `lib/` – Core Business Logic & Firebase Integration

The `lib/` folder is the **brain** of the application. All data manipulation, safety checks, and Firebase calls live here.

### Top‑Level Files

- **`lib/firebase.ts`** – Initializes Firebase App, exports `auth`, `db` (Firestore), `realtimeDb` (Realtime Database), and `googleProvider`. **Never remove any export**; many layers depend on these objects.
- **`lib/chat/types.ts`** – TypeScript definitions for Conversation and Message objects. Shared between user and agent chat modules.
- **`lib/users/*.ts`** – User‑specific functionality:
  * `chat.ts` – Functions to create/fetch user conversations, duplicate‑check logic, and message sending helpers.
  * `profile.ts` – Fetch and update user profile, identity‑consent fields.
  * `properties.ts` – CRUD for user‑draft properties, plus ownership handling.
- **`lib/agents/*.ts`** – Agent‑specific functionality:
  * `*Service.ts` – Dedicated CRM data services (`propertyService`, `leadService`, `taskService`, `activityService`, `analyticsService`, `dashboardService`). This strict separation extracts Firebase/Data logic from the UI components.
  * `chat.ts` – Mirrors user chat helpers but adds `property_listing` context handling.
  * `onboarding/` – Logic and Server Actions for completing agent onboarding.
  * `joinAgency.ts` / `agency.ts` – Agency creation, joining, and ownership transfer logic.
  * `properties.ts` – Functions for agents to claim, list, and modify properties.
  * `agentAuthServer.ts` – Server Actions (`sendOtpAction`, `verifyOtpAction`, `registerAgentDocAction`) marked with `'use server'` for secure transactions.
  * `authotpgen.ts` – Core OTP generation, Firestore temporary storage, and Nodemailer email delivery flow.
- **`lib/id_verify/*`** – Cryptographic Identity Verification (KYC) Sub-system:
  * `crypto.ts` / `keys.ts` – Handles RSA key generation, payload canonicalization, and SHA-256 signing to prevent tampering.
  * `metadata.ts` – Collects advanced client telemetry (IP, fingerprint, device info, browser, geolocation) for fraud prevention.
  * `image_upload/r2.ts` – Handles Cloudflare R2 secure object storage integration. Uses `generateUploadUrl` and `generateViewUrl` to exchange private object keys for temporary presigned URLs.
  * `service.ts` – Server Actions (`submitAgentKYC`, `processDecision`, `fetchPendingRequests`, `verifyAgentIntegrity`) for submitting and validating KYC requests using Firestore transactions.
  * `index.ts` – Bundles the service exports for clean imports.
- **`lib/properties/*`** – Shared utilities for property status updates, image handling, and validation.
- **`lib/agency/`** – Core agency sub-system:
  * `agency.ts` – Core agency management (create, join, leave, transfer ownership).
  * `manageAgents.ts` – Approving/rejecting requests, rotating invite code.
  * `profile.ts` – Editing agency public details.
  * `preferences.ts` – Managing preferred locations and property types.

---

## 3.1 `auth/` & `hooks/` – Authentication and State Management Layers

### `auth/` Directory
- **`auth/AuthContext.tsx`** – React Auth Provider wrapping the Next.js app globally in the root layout (`app/layout.tsx`). It supplies user auth state (`user`, `profile`, `loading`) and checks role-based route guards without blocking page layouts or displaying loading screens (allowing sub-pages to render immediately and handle their own loading states).
- **`auth/userauth.ts`** – Client-side user auth logic for standard/Google sign-in, registration, and logout. Employs `DBUser` alias to avoid type collisions with standard Firebase Auth types.
- **`auth/agentAuth.ts`** – Refactored helper supplying only the client-side `agentLogout` utility.

### `hooks/` Directory
- **`hooks/useAgentRegister.ts`** – Custom hook orchestrating agent sign-up logic (timer, OTP confirmation, and Server Actions).
- **`hooks/useAgentLogin.ts`** – Custom hook managing agent email/Google login forms and validation against Firestore user/agent roles.
- **`hooks/useAgent.ts`** – State listener that fetches and verifies the agent's database document based on current Auth state.
- **`hooks/useAgency.ts`** – Manages state for the agent's associated Agency details.

### Why This Separation?

- **Modularity:** Business rules can be unit‑tested without a UI.
- **Security:** All Firebase reads/writes are funneled through these helpers, making it easier to audit permission checks.
- **Future‑Proof:** Adding a new client (mobile app, admin portal) only requires importing the relevant `lib/` functions.

> **⚠️ WARNING**: Do **not** change the exported names (`auth`, `db`, `realtimeDb`) or the function signatures without updating all callers. Many components are compiled against these signatures.

---

## 4. Important Shared Utilities

- **`lib/utils/*` (if present)** – Generic helpers (e.g., error handling, date formatting). Used across both user and agent code.
- **`lib/constants.ts`** – Central place for enum values like `ConversationContext`, property statuses, and role definitions. Changing a constant without updating dependent logic can cause mismatched UI states.

---

## 5. Key UI Components

| Component | File | Role | Critical Dependencies |
|-----------|------|------|-----------------------|
| `ChatWidget` | `app/components/ChatWidget.tsx` | Real‑time chat UI, attaches/detaches RTDB listeners | `lib/firebase`, `lib/chat/types` |
| `UserPropertiesSection` | `app/user/dashboard/UserPropertiesSection.tsx` | Marketplace list, contact‑agent button, draft creation | `lib/users/*` |
| `AgentPropertiesSection` | `app/agentportal/components/AgentPropertiesSection.tsx` | Agent’s property management, draft review modal, contact‑user chat | `lib/agents/*` |
| `AgentWorkbench` | `app/agentportal/components/AgentWorkbench.tsx` | Core 3-column layout controller for the Agent CRM | `AgentAgencySection`, `AgentPropertiesSection`, `AgentChatsSection` |
| `UserChatsSection` | `app/user/dashboard/UserChatsSection.tsx` | List of user conversations and entry point to ChatWidget | `lib/users/chat.ts` |
| `AgentChatsSection` | `app/agentportal/components/AgentChatsSection.tsx` | List of agent conversations and entry point to ChatWidget | `lib/agents/chat.ts` |

---

## 6. Chat & Realtime System

1. **Metadata (Firestore)** – `conversations/` collection stores conversation documents (participants, property reference, context, timestamps). This is the source of truth for existence checks and UI lists.
2. **Message Stream (Realtime Database)** – `messages/{conversationId}` node stores each chat message. The `ChatWidget` listens on `child_added` events only while the drawer is open, ensuring low‑latency updates without unnecessary bandwidth.
3. **Helper Modules** – `lib/users/chat.ts` and `lib/agents/chat.ts` expose:
   * `createUserConversation` / `createAgentConversation` (idempotent, checks for duplicates)
   * `fetchUserConversations` / `fetchAgentConversations`
   * `sendMessage` (writes to RTDB)
4. **Why Hybrid?** – Firestore is expensive for frequent tiny writes; RTDB excels at high‑throughput, low‑latency streams. By splitting responsibilities we keep costs low while delivering an instant chat experience.

---

## 7. Agent & Agency Sub‑systems

- **`app/agentportal/components/AgentWorkbench.tsx`** – Central hub for verified agents.
- **`lib/agents/joinAgency.ts` / `lib/agency.ts`** – Handles creation, joining, leaving, and ownership transfer of agencies. Agency data lives in Firestore under `agencies/`.
- **`lib/agents/propertyService.ts`** – Functions agents use to claim a draft, list it, or change status.
- **`AgentChatsSection`** – Shows direct inquiries (property‑specific or generic) for agents.

### Ownership Mapping

Each property document contains:
```ts
interface Property {
  id: string;
  userId?: string;   // original drafter (optional after claim)
  agentId?: string;  // managing agent – may be null for drafts
  agencyId?: string; // if listed by an agency
  status: 'draft' | 'active' | 'inactive';
}
```
Updating any of these IDs instantly changes who can edit the property, which UI tabs it appears under, and how chats are routed.

---

## 8. Property Management Sub‑system

- **`app/user/dashboard/UserPropertiesSection.tsx`** – Marketplace view, property cards, “Contact Agent” button.
- **`app/agents/components/AgentPropertiesSection.tsx`** – Draft review modal, claim‑and‑list flow, “Contact User” button.
- **`lib/users/properties.ts`** – CRUD for drafts, validation of required identity fields before creation.
- **`lib/agents/properties.ts`** – Agent‑side helpers for claiming and publishing properties.

### Lifecycle Steps
1. **Draft Creation** – User fills required fields; document stored with `status = 'draft'`.
2. **Agent Review** – Agent opens the draft via `AgentPropertiesSection`, sees identity details, and can start a chat.
3. **Claim & List** – Once agreed, the agent updates `agentId`/`agencyId` and sets `status = 'active'`.
4. **Marketplace Display** – Active properties are queried via Firestore (`where('status', '==', 'active')`).

---

## 9. User Management Sub‑system

- **`app/user/dashboard/UserProfileSection.tsx`** – Displays and edits user profile information, including identity‑verification fields.
- **`lib/users/profile.ts`** – Fetch/update profile, enforce consent (`identityConsentAccepted`).
- **`lib/users/auth.ts`** (if present) – Helper wrappers around Firebase Auth for sign‑in, sign‑out, and token refresh.

### Identity Verification & KYC Flow
1. **Initiation**: After initial onboarding, agents can choose to verify their identity (`wants_id_verify_now` via localStorage flag).
2. **Data Collection**: User supplies Personal Info (Permanent vs Mailing Address), government ID, selfies, business licenses (for agencies), and client telemetry (fingerprint, IP, device model, geolocation).
3. **Secure Document Storage**: Images are uploaded directly to **Cloudflare R2** using secure presigned URLs (`generateUploadUrl`). The database only stores private object keys, never public image URLs.
4. **Cryptographic Signing**: The payload is canonicalized and hashed (SHA-256). An RSA private key signs this hash securely on the server (`lib/id_verify/service.ts`), storing the `digitalSignature`. This includes `metadata_hash` and `personal_hash` to ensure absolute immutability.
5. **Admin Review**: Admins use `/admin/id_verify` to dynamically fetch presigned view URLs (`generateViewUrl`) to review the documents and run an `Integrity Check` which mathematically guarantees no data manipulation occurred post-submission.
6. **Approval**: Upon approval, the agent/agency document is updated with `id_verify: 'verified'` unlocking CRM capabilities like adding properties or agents.

---

## 10. Safety & Warning Summary

| Area | Potential Pitfall | Mitigation / Warning |
|------|-------------------|----------------------|
| **File Removal** | Deleting any folder in `app/` or `lib/` will break routing or business logic. | **⚠️ Do NOT remove files even if they appear unused visually.** Many are invoked programmatically. |
| **Firebase Rules** | Permission errors often stem from missing/incorrect security rules rather than code bugs. | Verify Firestore and Realtime Database rules first; ensure the authenticated UID matches the document's `userId`/`agentId`. |
| **Conversation Duplicate Logic** | Creating duplicate conversation documents can cause chat fragmentation. | The `create*Conversation` helpers perform an idempotent check; always use them instead of direct Firestore writes. |
| **Ownership Transfer** | Directly editing a property document without using the `updatePropertyStatus` helper can bypass validation and break agency ownership mapping. | Always use the provided library functions for status changes. |
| **Realtime Listeners** | Leaving listeners attached when a drawer is closed can cause memory leaks and unexpected UI updates during high traffic. | `ChatWidget` attaches listeners only when `isOpen` is true and detaches on close. |
| **UI vs Backend** | UI is a work‑in‑progress; some buttons may be placeholders. | Do NOT assume every visual element is fully functional – refer to the implementation notes in `lib/` for the true capabilities. |

---

## 11. Future‑Ready Areas (Not Yet Implemented)

| Feature | Current Placeholder | Planned Implementation |
|---------|----------------------|------------------------|
| **Agent Finder** | `conversationContext: 'agent_finder'` exists, UI tab not yet built. | Dedicated directory of agents with search/filter, direct chat initiation. |
| **Dubai / Commercial Properties** | Property schema already supports `propertyType` and location fields. | New marketplace filters, region‑specific landing pages, and additional valuation fields. |
| **Advanced Analytics** | Basic Firestore queries only. | Integration with Google Analytics/Firebase Analytics and optional data warehouse for reporting. |
| **Enhanced Search** | Simple client‑side filtering. | Server‑side full‑text search via Algolia or Typesense. |
| **Multi‑Region Scaling** | Hosted on a single Firebase project. | Deploy separate Firebase projects per region, with domain routing and data replication. |

---

*End of Project Structure Documentation.*
