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
| `app/agents/` | Agent‑side dashboards and pages | UI components, `lib/agents/*` | Handles agent onboarding, verification, property management, and chat UI. |
| `app/user/` | User‑side dashboards and pages | UI components, `lib/users/*` | Provides marketplace browsing, draft property creation, and user chat UI. |
| `app/components/` | Reusable UI widgets (e.g., `ChatWidget`) | `lib/firebase`, `lib/chat/types` | Central place for UI that appears across both user & agent portals. |
| `app/agents/components/` | Agent‑specific UI pieces (agency list, property cards, chat section) | `lib/agents/*` | Isolated to keep agent UI separate from user UI. |
| `app/user/dashboard/` | User dashboard pages and sections (profile, property list, chats) | `lib/users/*` | Core entry point for a logged‑in user. |
| `app/layout.tsx` | Global layout (navbar, theming) | — | Wraps all pages; removing breaks navigation. |
| `app/page.tsx` (root) | Home page / landing page | — | Entry point for visitors. |
| `app/api/` (if present) | Serverless API routes (rarely used, most logic in `lib/`) | — | Not critical now but may host custom endpoints. |

### Important Files Inside `app/`

- **`app/agents/dashboard/page.tsx`** – The main entry for agents after login. It imports `VerifiedDashboard` which shows agency, property, and chat tabs.
- **`app/user/dashboard/page.tsx`** – User home after auth; contains navigation tabs (Marketplace, My Listings, Chats, Profile). **_NOTE_**: We added a `UserChatsSection` import; ensure the file exists.
- **`app/components/ChatWidget.tsx`** – Reusable slide‑over chat UI that attaches Realtime Database listeners *only when open*.
- **`app/agents/components/AgentChatsSection.tsx`** – Lists all conversations for an agent and opens `ChatWidget`.

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
  * `chat.ts` – Mirrors user chat helpers but adds `property_listing` context handling.
  * `agency.ts` – Agency creation, joining, and ownership transfer logic.
  * `properties.ts` – Functions for agents to claim, list, and modify properties.
- **`lib/properties/*`** – Shared utilities for property status updates, image handling, and validation.
- **`lib/agency.ts`** – Core agency management (create, join, leave, transfer ownership).

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
| `AgentPropertiesSection` | `app/agents/components/AgentPropertiesSection.tsx` | Agent’s property management, draft review modal, contact‑user chat | `lib/agents/*` |
| `VerifiedDashboard` | `app/agents/components/VerifiedDashboard.tsx` | Tab navigation for agents (Agency, Properties, Chats, Profile) | `AgentAgencySection`, `AgentPropertiesSection`, `AgentChatsSection` |
| `UserChatsSection` | `app/user/dashboard/UserChatsSection.tsx` | List of user conversations and entry point to ChatWidget | `lib/users/chat.ts` |
| `AgentChatsSection` | `app/agents/components/AgentChatsSection.tsx` | List of agent conversations and entry point to ChatWidget | `lib/agents/chat.ts` |

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

- **`app/agents/components/VerifiedDashboard.tsx`** – Central hub for verified agents.
- **`lib/agents/agency.ts`** – Handles creation, joining, leaving, and ownership transfer of agencies. Agency data lives in Firestore under `agencies/`.
- **`lib/agents/properties.ts`** – Functions agents use to claim a draft, list it, or change status.
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

### Identity Verification Flow
1. User supplies phone, government ID type, ID number, ID image URL, and checks the consent box.
2. Front‑end validates fields before allowing a property draft to be saved.
3. The data is stored under `users/{uid}` in Firestore; no third‑party verification occurs – it is a **self‑declaration** used for trust.

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
