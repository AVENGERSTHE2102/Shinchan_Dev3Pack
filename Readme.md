# SolDare Documentation Manifest

Welcome to the SolDare repository. To ensure smooth collaboration between AI agents and human developers, we have structured the documentation into specific files. 

If you are a new agent joining the project, **read this directory first** to understand where everything is:

### 🚦 Workflow & Handoffs
*   **`progress.md`**: **READ THIS FIRST**. The live baton-pass document. It tracks what was just completed, what the immediate next steps are, and exactly who or what is blocking the current phase. You must append to this file when you end your turn.
*   **`instructions.md`**: The master task list for the Next.js frontend (P2) and x402 backend (P3). It tells incoming agents exactly what files to build next and strict rules to follow (like not touching the frozen Anchor code).

### 🧠 Project Context
*   **`context.md`**: The "Why" behind the project. Explains the vision, the problem with traditional crypto escrows, and how the Anchor + x402 architecture creates a gasless, mainstream UX.
*   **`project.md`**: The technical blueprint. Contains the tech stack, directory structure, core workflows, and the required `.env` variables needed to run the project.

### 👥 Team & Roles
*   **`agents.md`**: Defines the 4 roles (P1 Rust, P2 Frontend, P3 Backend, P4 Integration). It establishes the rules of engagement so agents don't overwrite each other's domains.

### 🐛 Testing
*   **`feedback.md`**: The E2E testing checklist and bug tracker. Use this during the integration phase to log issues, track Vercel/Playground deployment bugs, and review judging criteria.

---
*Note: P1 (Rust/Anchor) is 100% complete. We are currently waiting on P4 to deploy the contract to Devnet to unlock P2 and P3.*
