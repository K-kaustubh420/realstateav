# Real Estate Platform Architecture & Documentation

Welcome to the core documentation for our proprietary Real Estate Platform. This document explains the platform's complete architecture, systems, logic flows, scalability principles, and technical design.

---

> [!WARNING]
> **DEVELOPMENT & ARCHITECTURE WARNING**
> - **Do NOT randomly delete, refactor, or remove files just because they "look unnecessary".** Many systems are deeply interconnected and intentionally structured for future scaling, edge-case handling, and realtime flows.
> - **UI is NOT final yet.** The system was intentionally prioritized **backend-first**. The core functionality, architecture, and backend systems are implemented and robust, but extensive UI polish and aesthetic enhancements are still pending.
> - **Firebase Errors:** If you encounter permission errors (e.g., `Missing or insufficient permissions`), **DO NOT** blame the application logic first. Check Firestore Rules, Realtime Database Rules, and Firebase Auth permissions, because strict security rules are critical to system functionality.

---

## 1. Platform Overview

The platform is a scalable, multi-sided marketplace connecting **Users** (buyers, renters, property owners) and **Agents/Agencies**. It facilitates property listings, direct inquiries, agent verification, agency management, and real-time communication.

The architecture is built on **Next.js** with a **Firebase** backend. We utilize a highly decoupled, modular structure designed to handle high concurrency, large data volumes, and complex relational flows (e.g., a user transferring a draft property to an agent, who might be part of an agency).

---

## 2. Architecture & Technical Design

### Next.js Server Actions Design Pattern
We utilize Next.js Server Actions (`'use server'`) for handling security-sensitive and server-only modules (such as Firestore admin-like writes and Nodemailer email processing). All REST API routes (previously in `/app/api`) have been eliminated. This reduces cold starts, simplifies logic deployment, and protects endpoints from external exposure.

### Luxury Agent CRM Dashboard
The Agent Portal (`/app/agentportal`) operates as a professional, high-performance Luxury CRM. It is built using a modern 3-column layout (Left Sidebar Navigation, Primary Central Workspace, Right Sidebar Activity Feed) powered by `AgentWorkbench`. The UI leverages a premium dark-mode aesthetic with glassmorphism and real-time state hydration, distinguishing the agent's professional tooling from the standard user interface.

### Modular Service Layer Separation
To maintain thin UI components inside the Agent CRM, we strictly separate data fetching and mutation into dedicated backend service files located in `lib/agents/` (e.g., `propertyService.ts`, `leadService.ts`, `taskService.ts`, `activityService.ts`, `dashboardService.ts`). This ensures that complex mapping, caching, and Firebase integrations are fully abstracted away from the React view layer.

### Global Authentication Context
We utilize a global `AuthProvider` wrapped at the root layout level (`app/layout.tsx`). The context manages the Firebase Auth listener, fetches the active user's role-based database profile (Agent or User), and handles route guards (e.g., blocking non-agents from entering `/agentportal/dashboard`). 
* **Self-Handling Page Loading:** To optimize rendering speed, avoid hydration flashes, and allow pages to customize their own loading/skeleton UIs, the global `AuthContext` does not contain any layout-blocking loaders or spinners. It renders children immediately while exposing `loading` state through context variables.

### Hybrid Database Architecture: Firestore + Realtime Database
We use a hybrid approach to maximize scalability, minimize costs, and ensure real-time responsiveness.

* **Firestore Responsibilities:** Used for structured, queryable data and metadata. It handles User Profiles, Agent Profiles, Agencies, Property Listings, and Conversation Metadata. Firestore is ideal for complex filtering (e.g., searching properties by city, type, or agent) and ensuring robust ACID-compliant updates for ownership transfers.
* **Realtime Database Responsibilities:** Used strictly for the live chat message stream (`messages/{conversationId}`). RTDB is heavily optimized for low-latency, high-frequency small payloads (like chat messages) and does not charge per document read, saving massive costs compared to streaming messages via Firestore.

### Centralized Property Architecture
Unlike typical systems that might duplicate property data into "user properties" and "agent properties", we use a **single, centralized `properties` collection**.
* **Why?** Centralization prevents data fragmentation and ensures single-source-of-truth reliability. When a user drafts a property, and an agent later claims it, the document ID remains the same. We merely update ownership pointers (`agentId`, `status`). 
* **Scalability:** By keeping the data flat and centralized, querying active marketplace listings is an extremely fast, single-collection query.

### Ownership Mapping & Validation
Properties utilize strict ownership pointers:
* `userId`: Points to the original creator (if a user drafted it).
* `agentId`: Points to the managing agent.
* `agencyId`: Points to the agency if the agent listed it under their firm.
This structure ensures that ownership transfer, agency migrations, and access control can be handled purely by updating IDs, without moving massive data payloads.

### `conversationContext` Routing
Conversations use a strictly typed `conversationContext` (e.g., `property_listing`, `property_buying`, `property_rental`, `agent_finder`).
* **Why?** It prevents UI clutter and logic overlap. An agent can instantly distinguish a chat about "someone wanting to buy a property" versus "someone asking the agent to list their property." It future-proofs the routing logic for specific dashboards.

---

## 3. Core System Flows

### Cryptographic Identity Verification & KYC Flow
Before users or agents can publish property drafts or fully utilize the CRM dashboard, they must complete an identity verification process.
* **Why?** This prevents spam, protects agent time, and acts as a trust-and-safety layer.
* **4-Step KYC Onboarding:** Users seamlessly complete Personal Details (including Permanent & Mailing address workflows), Document Details, and Selfie validations.
* **Secure R2 Object Storage:** All uploaded proof documents (ID Cards, Licenses, Selfies) are stored securely as isolated objects in a **Cloudflare R2** bucket, never as public HTTP URLs. The system dynamically generates temporary, presigned URLs (`generateViewUrl`) on-the-fly only when an authorized admin inspects them.
* **Cryptographic Signatures:** The application collects the entire form payload and advanced client telemetry (IP, fingerprint, device type, map geolocation). Upon submission, a Next.js Server Action (`submitAgentKYC`) canonicalizes the payload (including `metadata_hash` and `personal_hash`), generates a SHA-256 hash, and signs it using an RSA Private Key. 
* **Admin Verification:** Admins review pending KYC requests via an isolated Admin Console (`/admin/id_verify`). To prevent DB tampering, the dashboard runs a Cryptographic Integrity Check verifying the digital signature against the public key stored securely in the DB. If a single character of the address or a single pixel of an image is altered post-submission, the UI loudly warns the admin.

### Agent Registration & OTP Verification Flow (Server Actions)
To protect agent onboarding and secure contact detail confirmation, we leverage a Next.js Server Actions workflow:
1. **Validation & Verification Request:** The agent fills out the registration form. The custom client hook `useAgentRegister` invokes `sendOtpAction` (a Server Action).
2. **Secure OTP Generation:** The server generates a 4-digit OTP, stores it with a 45-second expiry in a temporary `otps` Firestore collection, and sends it via Nodemailer. In local development, the code prints directly to the console output to bypass SMTP dependency.
3. **Account Provisioning:** The agent enters the OTP, which is verified by `verifyOtpAction`. Upon success, the client creates their account in Firebase Authentication and triggers `registerAgentDocAction` to write their fully structured profile matching the `Agent` schema into the Firestore `agents` collection, keyed by their Firebase Auth `uid`.

### Mandatory Agent Onboarding & Verification Enforcement
After successful registration, an agent is not immediately granted access to the dashboard. The `AuthContext` enforces a strict redirection to `/agentportal/onboarding` if the `onboardingCompleted` flag is false.
1. **Step 1 (Personal):** Users provide their bio and name details.
2. **Step 2 (Location):** Agents supply their operational address. We utilize OpenStreetMap reverse-geocoding via the `navigator.geolocation` API to auto-fill address details.
3. **Step 3 (ID Verification):** Agents are encouraged to verify their government IDs (which links to the dedicated `id_verification` isolated service).
4. **Step 4 (Review & Submit):** A Server Action (`completeAgentOnboardingAction`) updates the Firestore document, setting `onboardingCompleted: true`. Based on a local storage flag (`wants_id_verify_now`), the agent is either directed into the CRM dashboard or immediately redirected to `/id_verification/[slug]` to complete their full legal KYC.

**Strict Dashboard Action Blocking:** Even after onboarding, the CRM Dashboard aggressively checks `id_verify` and `membership.status` flags. If an agent is not fully verified or their membership is inactive, a global alert banner persists, and any attempts to add/import properties or accept high-tier leads are hard-blocked via UI safeguards and service layer validation.

### Property Lifecycle & Ownership Transfer
1. **User Drafts Property:** A user submits a property they want to sell/rent. It enters the centralized database with `status = "draft"`, `userId = {user.uid}`, and `agentId = null`. It does NOT appear on the public marketplace.
2. **Agent Claims Property:** An agent reviews the draft via their dashboard. They verify the user's identity details and click "Contact User". Once terms are agreed, the agent clicks "Claim & List".
3. **Status Activation:** The system updates the exact same document, assigning `agentId`, optionally `agencyId`, and changing status to `"active"`. It instantly appears on the public marketplace.

### Realtime Chat Flow
1. **Initiation:** A user clicks "Contact Agent" on a property. The system checks if a conversation with `(userId, agentId, propertyId, context)` exists. If not, it creates metadata in Firestore.
2. **Streaming:** The UI mounts a `ChatWidget` that attaches an `onChildAdded` listener to Realtime Database.
3. **Delivery:** When a message is sent, it pushes directly to RTDB, bypassing complex backend logic, achieving near-instantaneous delivery to the recipient.

### Agency Ownership & Management
Agents can create or join Agencies. When an agent creates a property listing, they can choose to list it as an "individual" or under their "active agency".
* If an agent leaves an agency, properties strictly tied to the agency remain with the agency, ensuring business continuity. Properties tied to the individual move with the individual.

---

## 4. Scalability, Safety & Edge Cases

* **Concurrency Safety:** Core actions (claiming a property, joining an agency) are protected by specific queries and state-loading disables to prevent double-submissions.
* **Type Collision Prevention (DBUser):** To avoid namespace clashes with DOM declarations or Firebase Auth interfaces, the local user profile is imported and aliased as `DBUser` in authentication managers.
* **Modular Separation:** By completely separating User hooks (`lib/users`) from Agent hooks (`lib/agents`), we ensure that a bug in the user portal cannot accidentally expose agent admin privileges.
* **Realtime Responsiveness vs Memory:** The `ChatWidget` is designed to completely detach Realtime listeners when closed. Persistent global listeners are avoided to prevent memory leaks during large traffic spikes.
* **Traffic Spike Resilience:** Because the public marketplace is a simple Firestore read of `status == "active"`, and chats are offloaded to RTDB, the system can handle massive user spikes without choking the database throughput.

---

## 5. Future Expansion Readiness

The architecture is explicitly designed to support planned expansions:
* **Agent Finder:** The `agent_finder` conversation context is already built. Future UI can simply render a directory of agents, and clicking "Contact" will natively route through the existing chat infrastructure.
* **Dubai / Commercial Properties:** Because properties are centralized and typed (`propertyType`, `bhk`, `carpetArea`), adding new categories or entirely new regions (like a dedicated Dubai landing page) only requires updating frontend queries, zero database migrations needed.
* **Multi-region Scaling:** Firebase effortlessly scales globally.
* **Analytics / Enhanced Search:** Centralized Firestore data easily hooks into Algolia or Typesense for future advanced filtering.

---

*This architecture ensures we move fast, scale safely, and never box ourselves into monolithic design patterns.*
