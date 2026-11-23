## CẤU TRÚC THƯ MỤC BẮT BUỘC
```text

mobile/
├── app/                         # Expo Router - CHỈ routing
│   ├── _layout.tsx               # Root layout, Providers
│   ├── index.tsx                 # Redirect theo trạng thái auth
│   ├── +not-found.tsx
│   │
│   ├── (auth)/                   # Authentication routes
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── verify-otp.tsx
│   │   └── forgot-password.tsx
│   │
│   ├── (tabs)/                   # Main navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Home / Map
│   │   ├── search.tsx            # Search stations
│   │   ├── favorites.tsx
│   │   └── profile.tsx
│   │
│   ├── stations/
│   │   └── [id].tsx              # Station detail
│   │
│   ├── charging/
│   │   ├── [id].tsx              # Charging session
│   │   └── history.tsx
│   │
│   ├── payments/
│   │   └── [id].tsx              # Payment detail
│   │
│   └── (modals)/
│       ├── station-filter.tsx
│       └── vehicle-selector.tsx
│
├── src/
│   ├── assets/                   # Images, icons, fonts
│   │
│   ├── components/
│   │   ├── base/                 # Reusable UI
│   │   │   ├── BaseButton.tsx
│   │   │   ├── BaseInput.tsx
│   │   │   ├── BaseModal.tsx
│   │   │   ├── BaseCard.tsx
│   │   │   ├── BaseLoading.tsx
│   │   │   └── BaseEmptyState.tsx
│   │   │
│   │   └── layout/               # App-wide UI
│   │       ├── ScreenContainer.tsx
│   │       └── KeyboardAwareScreen.tsx
│   │
│   ├── features/                 # BUSINESS DOMAINS
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── schemas/
│   │   │   ├── types/
│   │   │   └── screens/
│   │   │
│   │   ├── stations/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── schemas/
│   │   │   ├── types/
│   │   │   └── screens/
│   │   │
│   │   ├── maps/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   │
│   │   ├── vehicles/
│   │   ├── favorites/
│   │   ├── charging/
│   │   ├── payments/
│   │   ├── ai-chat/
│   │   ├── reports/
│   │   └── profile/
│   │
│   ├── lib/                      # Core infrastructure
│   │   ├── api/
│   │   │   ├── axiosClient.ts
│   │   │   ├── tokenManager.ts
│   │   │   └── apiError.ts
│   │   ├── storage/
│   │   │   ├── secureStorage.ts
│   │   │   └── localStorage.ts
│   │   └── query/
│   │       └── queryClient.ts
│   │
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   ├── QueryProvider.tsx
│   │   └── ThemeProvider.tsx
│   │
│   ├── hooks/                    # Shared hooks
│   │   ├── useDebounce.ts
│   │   └── useAppTheme.ts
│   │
│   ├── store/                    # Zustand shared state
│   │   ├── authStore.ts
│   │   ├── stationFilterStore.ts
│   │   └── vehicleStore.ts
│   │
│   ├── types/                    # Shared API / DTO types
│   │   ├── api.ts
│   │   └── pagination.ts
│   │
│   ├── schemas/                  # Shared Zod schemas
│   ├── constants/                # Shared constants
│   │   ├── apiEndpoints.ts
│   │   ├── config.ts
│   │   └── theme.ts
│   │
│   └── utils/                    # Pure utilities
│       ├── formatCurrency.ts
│       ├── formatDistance.ts
│       └── formatDate.ts
│
├── .env.example
├── .gitignore
├── app.json
├── package.json
├── tsconfig.json
├── eslint.config.js
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

# AGENTS.md — EV Charging Mobile

## 1. Project Overview

This project is a React Native mobile application built with Expo, Expo Router and TypeScript.

The application helps EV drivers:
- Discover nearby charging stations.
- Search and filter compatible charging stations.
- View station details, connectors, charging power and availability.
- Navigate to charging stations.
- Manage vehicles and favorite stations.
- Interact with charging, queue and payment features when supported by backend APIs.
- Communicate with an AI support chatbot.

Backend: Java Spring Boot REST API.

**Architecture: Feature-Based Architecture with separated UI, business logic and data access.**

## 2. Mandatory Architecture

Use the following directory responsibilities:

| Directory | Responsibility |
|---|---|
| `app/` | Expo Router routes and navigation layouts only |
| `src/features/` | Feature-specific screens, components, hooks, services, types and schemas |
| `src/components/base/` | Reusable, domain-independent UI components |
| `src/components/layout/` | Shared screen layouts |
| `src/lib/` | Axios, storage, query client and infrastructure |
| `src/providers/` | Application-wide React providers |
| `src/hooks/` | Generic reusable hooks |
| `src/store/` | Global client state using Zustand |
| `src/types/` | Shared TypeScript types and API contracts |
| `src/schemas/` | Shared Zod validation schemas |
| `src/constants/` | Shared constants, configuration and theme |
| `src/utils/` | Pure utility functions |
| `src/assets/` | Static assets |

Do not create new top-level directories without a clear architectural reason.

Do not create empty boilerplate directories unnecessarily.

## 3. Routing Rules

- Use Expo Router for navigation.
- Keep route files in `app/` thin.
- Route files should import and render feature screens.
- Never implement API requests directly inside route files.
- Never place complex business logic inside route files.
- Use route groups for authentication and tabs.
- Use typed route parameters and validate incoming parameters.
- Protect authenticated routes.
- Handle loading and authentication restoration before redirecting.
- Avoid navigation loops.

Example:

`app/stations/[id].tsx` imports `StationDetailScreen` from `src/features/stations/screens/`.

## 4. Feature Module Rules

Each feature owns its business-related code.

Recommended structure:

```text
features/stations/
├── components/
├── hooks/
├── services/
├── schemas/
├── types/
└── screens/
```

Responsibilities:

- `components/`: UI components specific to the feature.
- `hooks/`: Queries, mutations and reusable feature behavior.
- `services/`: HTTP requests and data access.
- `schemas/`: Feature-specific validation.
- `types/`: DTOs and feature models.
- `screens/`: Screen composition and UI state.

Rules:

1. Do not duplicate business logic between features.
2. Do not import another feature's internal implementation unless explicitly justified.
3. Prefer shared components only when reuse is genuine.
4. Avoid circular dependencies.
5. Keep each feature independently maintainable.
6. Do not introduce unnecessary abstraction layers.

## 5. API Integration Rules

All backend requests must use the shared Axios client.

Location:

`src/lib/api/axiosClient.ts`

Mandatory rules:

- Define the API base URL using environment configuration.
- Use a centralized Axios instance.
- Attach access tokens through request interceptors.
- Normalize network and API errors.
- Handle 401 responses consistently.
- Implement refresh-token handling only according to the backend contract.
- Prevent concurrent refresh requests from causing repeated refresh calls.
- Retry the original request at most once after a successful refresh.
- Do not retry authentication endpoints recursively.
- Never call Axios directly from UI components.
- Never hardcode API URLs inside screens.
- Use typed request and response DTOs.
- Do not assume backend response structures.

Expected flow:

Screen → Feature Hook → Feature Service → Axios Client → Spring Boot API

## 6. State Management Rules

Use the correct tool for each state category.

**TanStack Query**
- Server state.
- API response caching.
- Data fetching.
- Mutations.
- Query invalidation.
- Loading and error handling.

**Zustand**
- Shared client state.
- Selected vehicle.
- Station filter preferences.
- UI preferences that span multiple screens.

**React useState**
- Local component state.
- Modal visibility.
- Temporary input values.
- Simple UI interactions.

Do not duplicate server response data in Zustand without a specific reason.

Do not introduce Redux unless explicitly requested.

## 7. Authentication and Security

Authentication uses the Spring Boot JWT backend.

Rules:

- Store sensitive tokens using Expo SecureStore.
- Never store JWT or refresh tokens in plain AsyncStorage.
- Never log tokens, OTPs, passwords or personal data.
- Never expose backend secrets in mobile code.
- Never embed Gemini API keys, SMTP credentials or payment provider secrets in the mobile application.
- Handle token expiration and logout correctly.
- Clear authentication state when the session is invalid.
- Do not invent authentication endpoints or request fields.
- Use HTTPS for production APIs.
- Do not commit real `.env` files.

Remember: `EXPO_PUBLIC_*` variables are included in the client bundle and are not secret.

## 8. TypeScript Rules

- Use TypeScript strict mode.
- Avoid `any`.
- Prefer `unknown` when data types are not yet established.
- Define request and response types.
- Keep DTO field names consistent with the Spring Boot API contract.
- Use mappers when UI models differ from backend DTOs.
- Use enums or union types for fixed states when appropriate.
- Handle nullable and optional fields explicitly.
- Avoid unsafe type assertions.

## 9. UI Component Rules

- Use React Native components, not HTML elements.
- Prefer functional components.
- Use StyleSheet or the project's established styling system consistently.
- Follow the existing theme and design tokens.
- Avoid hardcoded colors and spacing when design tokens exist.
- Use reusable base components for common controls.
- Provide loading, empty and error states.
- Support safe areas and keyboard behavior.
- Avoid unnecessary re-renders.
- Optimize large lists with FlatList or equivalent virtualized components.
- Ensure touch targets and text contrast are accessible.

## 10. Forms and Validation

- Use React Hook Form and Zod for complex forms.
- Validate user input before API submission.
- Treat backend validation as authoritative.
- Display meaningful validation errors.
- Prevent duplicate submissions.
- Keep validation schemas near their owning features.

## 11. Maps and Location

- Encapsulate map SDK integration inside the maps feature.
- Request location permission only when needed.
- Handle denied permission gracefully.
- Do not assume GPS is always available.
- Do not continuously track location without a defined requirement.
- Avoid excessive API requests when map bounds or GPS coordinates change.
- Debounce searches when appropriate.
- Use the backend for station filtering and compatibility logic.
- Keep VietMap service credentials protected.
- Do not assume live charger availability without a verified data source.
- Distinguish actual, simulated and estimated station data.

## 12. Payment Rules

- The backend owns payment records and payment status.
- The mobile app may display QR codes and payment instructions.
- Generating or displaying a QR code does not confirm payment.
- Never mark a payment as PAID solely because a user presses a button.
- Follow the backend's verified payment confirmation mechanism.
- Do not expose banking provider secrets in the mobile application.

## 13. AI Chat Rules

- Gemini API calls must go through the backend.
- Do not embed Gemini API keys in the mobile application.
- Treat AI-generated information as unverified unless grounded in backend data.
- Do not fabricate station availability, prices or charging compatibility.
- Handle AI service errors, rate limits and timeouts gracefully.
- Avoid sending unnecessary personal data to AI services.

## 14. Naming Conventions

- React components: PascalCase.
- Component files: PascalCase.
- Hooks: `use` prefix.
- Functions and variables: camelCase.
- Types and interfaces: PascalCase.
- Constants: UPPER_SNAKE_CASE when appropriate.
- Route filenames: Expo Router conventions.
- Service functions: descriptive action names such as `getStations`, `getStationById`.
- Prefer named exports for reusable modules; use default exports where Expo Router requires them.

## 15. Code Quality

- Follow existing ESLint rules.
- Avoid unused imports and variables.
- Avoid magic numbers and repeated strings.
- Keep functions focused.
- Do not add dependencies without justification.
- Do not rewrite unrelated code.
- Do not introduce speculative features.
- Avoid overengineering.
- Prefer readable code over clever code.
- Handle asynchronous errors.
- Clean up subscriptions, timers and listeners.
- Never silently swallow errors.

## 16. Testing

For changed business logic:

- Add or update relevant tests where the test setup exists.
- Test success, failure and edge cases.
- Test validation and API error handling.
- Test authentication and refresh behavior when modified.
- Do not claim tests passed unless they were executed.
- Report any tests that could not be run.

## 17. AI Agent Workflow

Before implementing a task:

1. Read this file.
2. Inspect the relevant existing feature and related files.
3. Identify reusable components, hooks and services.
4. Check existing API contracts.
5. Determine the smallest necessary change.
6. Ask for clarification when critical requirements or API contracts are missing.

During implementation:

1. Follow the established directory structure.
2. Implement only the requested scope.
3. Reuse existing utilities.
4. Keep UI, state and API responsibilities separated.
5. Avoid unrelated refactoring.
6. Never fabricate backend endpoints or DTOs.
7. Do not overwrite user changes without explicit approval.

After implementation:

1. Review the changed files.
2. Run available relevant lint, type-check and tests.
3. Fix issues introduced by the change.
4. Summarize changed files and implemented behavior.
5. Report remaining issues or assumptions.

## 18. Definition of Done

A task is complete only when:

- The requested behavior is implemented.
- The architecture rules are respected.
- API integration matches the known backend contract.
- Loading, error and empty states are handled where relevant.
- No secrets are exposed.
- Relevant checks pass, or blockers are reported.
- No unrelated files are modified unnecessarily.
