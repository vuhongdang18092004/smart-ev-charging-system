# AI Agent Instructions

## 1. Project Context

This repository contains the **Smart EV Charging System**, an academic project for supporting electric vehicle charging station discovery, recommendation, monitoring, and charging demand distribution.

The system is designed around three main applications:

* `frontend/` — Web application for charging station operators and system management.
* `mobile/` — Cross-platform mobile application for EV drivers.
* `backend/` — Core backend system providing APIs, business logic, data management, recommendation, and optimization.

The project is currently in the early development stage. Requirements and implementation details may evolve during development.

Do not assume that every feature mentioned in discussions or documentation is already required to be implemented.

---

## 2. Repository Structure

```text
smart-ev-charging-system/
├── backend/
├── frontend/
├── mobile/
├── docs/
├── AGENTS.md
├── README.md
└── .gitignore
```

Keep responsibilities separated between these directories.

Do not move or merge the main applications unless explicitly requested.

---

## 3. Technology Stack

### Backend

* Java
* Spring Boot
* PostgreSQL

The backend is the core of the system.

Recommendation, allocation, and optimization logic should initially be implemented in Java within the backend.

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Mobile

* React Native
* TypeScript
* Expo

Do not replace the selected technology stack without an explicit request.

---

## 4. Architecture Principles

The system consists of three main layers:

```text
Mobile / Frontend
        |
        v
     Backend
        |
        v
   PostgreSQL
```

The frontend and mobile applications should communicate with the backend through APIs rather than directly accessing the database.

Business logic should primarily remain in the backend.

Do not duplicate important business rules between frontend, mobile, and backend.

The backend should remain responsible for:

* Business rules
* Data validation
* Recommendation logic
* Optimization logic
* Charging station state
* Simulation processing
* Access to persistent data

---

## 5. Recommendation and Optimization

Recommendation and optimization are important parts of this project.

The project should not be treated as only a CRUD web/mobile application.

The system may involve problems such as:

* Charging station recommendation
* Waiting-time estimation
* Charging demand distribution
* Station load balancing
* Resource allocation
* Optimization of charging demand

### Algorithm implementation

Initially, implement algorithms in Java within the backend.

Do not introduce Python simply because a problem involves optimization, prediction, or data processing.

Python may be introduced later when there is a clear technical reason, such as:

* Machine learning
* Data analysis
* Model training
* Scientific computing requiring Python-specific libraries
* An algorithm that is significantly more appropriate or practical in Python

If Python is introduced, it should normally be treated as a separate service or supporting component rather than replacing the core Spring Boot backend without a clear architectural reason.

---

## 6. Algorithm Evaluation

Different algorithms or approaches may need to be compared during the project.

When implementing an algorithm that is intended for evaluation:

* Keep the algorithm logic modular.
* Avoid tightly coupling the algorithm to controllers or UI code.
* Make it possible to replace one algorithm with another.
* Keep input and output structures consistent where practical.
* Record important assumptions.
* Make experiments reproducible using the same input scenarios.

Evaluation may consider metrics such as:

* Average waiting time
* Travel distance
* Station utilization
* Load distribution
* Number of served requests
* Execution time

Do not claim that one algorithm is better than another without defining evaluation criteria and testing them under comparable conditions.

---

## 7. Simulation Data

The project currently does not rely on real operational data from charging networks.

Charging station, vehicle, charging session, and demand data may therefore be simulated.

Simulation data should be clearly separated from application logic where practical.

Do not present simulated data as real-world data.

Do not hard-code large amounts of simulated operational data directly inside Java classes or UI components when a structured data source is more appropriate.

Use appropriate data files, database records, or simulation components depending on the requirement.

---

## 8. Scope Control

The project is an academic graduation project.

Do not unnecessarily expand the scope.

Before implementing a new major feature, consider whether it directly supports the core objectives:

* Charging station discovery
* Recommendation
* Waiting-time estimation
* Charging demand distribution
* Optimization
* Station management

Do not add complex features only because they are technically interesting.

Potential future features such as:

* Real payment integration
* Real charging station APIs
* Vehicle hardware integration
* Advanced machine learning
* Reservation systems
* Dynamic pricing

should not automatically become implementation requirements.

If a feature significantly changes the architecture or project scope, discuss it with the user before implementation.

---

## 9. Business Model

The project is currently designed as a third-party platform.

Drivers are primarily users of the recommendation and charging station discovery services.

Charging station operators may be customers of additional platform services such as:

* Station analytics
* Demand analysis
* Station utilization optimization
* Traffic distribution

Do not implement a real payment gateway unless explicitly requested.

Business concepts should not unnecessarily complicate the technical core of the project.

---

## 10. Code Quality

Prefer:

* Clear naming
* Small and focused classes/functions
* Separation of concerns
* Reusable components
* Modular architecture
* Explicit data models
* Maintainable code

Avoid:

* Unnecessary abstraction
* Premature optimization
* Duplicate business logic
* Large monolithic classes
* Hard-coded configuration
* Dead code
* Unused dependencies

Do not refactor unrelated parts of the project unless there is a clear reason.

---

## 11. Dependencies

Do not install a new dependency automatically unless it is necessary.

Before introducing a new library or framework:

1. Check whether the existing stack already provides the required functionality.
2. Prefer established dependencies compatible with the current architecture.
3. Avoid adding dependencies for trivial functionality.
4. Explain significant dependency additions when requested.

Do not replace an existing technology with another technology without explicit approval.

---

## 12. Configuration and Secrets

Do not commit:

* Passwords
* API keys
* Access tokens
* Private credentials
* Production secrets

Use environment variables or appropriate local configuration mechanisms.

Do not modify `.gitignore` in a way that exposes sensitive files.

---

## 13. API and Backend Rules

Backend APIs should:

* Use clear resource-oriented naming.
* Validate incoming data.
* Return appropriate HTTP status codes.
* Keep controllers focused on request handling.
* Place business logic in appropriate service/domain layers.
* Avoid putting complex algorithms directly inside controllers.

Do not expose internal implementation details unnecessarily through APIs.

---

## 14. Frontend Rules

The frontend should primarily handle:

* UI
* User interaction
* Client-side state
* API communication
* Presentation

Do not move core business logic or optimization algorithms into the frontend.

Follow the existing Next.js project structure instead of introducing a different architecture without a reason.

---

## 15. Mobile Rules

The mobile application should primarily handle:

* Mobile UI
* User interaction
* Navigation
* Local presentation state
* Communication with backend APIs

Do not duplicate backend business logic inside the mobile application.

Use React Native and Expo according to the existing project setup.

---

## 16. Documentation

Important project decisions should be documented in `docs/`.

The main requirements document is:

```text
docs/SRS.md
```

When requirements or major architectural decisions change, update the relevant documentation when appropriate.

Do not create unnecessary documentation files for small implementation details.

---

## 17. Git Rules

Do not automatically:

* Commit changes
* Push changes
* Create branches
* Merge branches
* Rewrite Git history

unless explicitly requested.

Prefer clear Conventional Commit-style messages when creating commits, for example:

```text
feat: add charging station search
fix: handle unavailable charging ports
refactor: improve station recommendation service
docs: update SRS
```

Do not include unrelated changes in the same commit when avoidable.

---

## 18. AI Agent Behavior

Before making significant changes:

1. Inspect the existing project structure.
2. Read relevant documentation.
3. Understand the current implementation.
4. Reuse existing code where appropriate.
5. Avoid making assumptions about unfinished features.

When requirements are ambiguous, ask for clarification rather than making a major architectural decision automatically.

Do not:

* Replace the architecture without approval.
* Introduce Python without a clear reason.
* Add unnecessary services.
* Add unnecessary databases.
* Introduce microservices prematurely.
* Implement future features automatically.
* Remove existing functionality without confirmation.

For larger changes, explain the proposed approach before making extensive modifications.

---

## 19. Development Priority

The current development priority is:

1. Establish the basic system architecture.
2. Build the backend foundation.
3. Build the web application foundation.
4. Build the mobile application foundation.
5. Establish the database model.
6. Implement basic charging station management.
7. Implement simulated charging data.
8. Implement station discovery and recommendation.
9. Implement waiting-time estimation.
10. Implement and evaluate charging demand distribution/optimization.

This priority may change as the project develops.

---

## 20. General Rule

When there is a conflict between adding complexity and keeping the system understandable and maintainable, prefer the simpler solution unless the additional complexity provides a clear benefit to the project.

The goal is not to use as many technologies or algorithms as possible.

The goal is to build a coherent, explainable, testable, and maintainable Smart EV Charging System.
