# Swiftulin App Constitution

## 1. Core Mission
To provide a voice-first, offline-capable nutritional logging and insulin calculation tool for diabetics, prioritizing safety, accuracy, and speed.

## 2. Technical Stack & Standards
- **Framework**: React Native via Expo (Latest Stable).
- **Builds**: Expo Development Builds (Internal Distribution).
- **State Management**: Zustand (Global) + React Query (Server/API State).
- **Persistence**: Expo SQLite (with Drizzle ORM) for logs; Expo SecureStore for sensitive ratios.
- **Voice**: Expo Speech/Voice modules for Speech-to-Text.
- **Testing**: Jest (Unit/Integration) and Maestro (E2E).
- **UI Source**: Reference Google Stitch MCP screens directly for layout and logic.

## 3. Development Workflow (Mandatory)
Antigravity must follow these steps for every task:
1. **Requirement Confirmation**: Present a detailed spec/feature list. Wait for User Approval.
2. **Technical Plan**: Write a step-by-step implementation plan. Wait for User Approval.
3. **TDD Execution**:
   - Write failing Jest/Maestro tests first.
   - Write minimal code to pass tests.
   - Refactor for best practices (DRY, Clean Code).
4. **Validation**: Confirm tests pass before marking the task complete.

## 4. Safety & Privacy Logic
- **Math Transparency**: Never calculate a dose without displaying the underlying math (Carb Ratio + Correction Factor).
- **Privacy-First**: No meal or insulin history is persisted to local storage. All calculations are real-time and ephemeral to protect user health data.
- **Manual Confirmation**: Every automated calculation requires a final manual "Complete" tap from the user.

## 5. Human-in-the-Loop UI
- **Editable Voice Results**: Users must be able to manually edit or override food quantities (supporting 0.1 increments) before calculation.
- **Ambiguity Fallback**: If NLP confidence is low, prompt for manual clarification rather than guessing.

## 6. Architecture & Offline Policy
- **Precision Pipeline**: Primary extraction via **regex-based segmentation** and nutritional verification via **USDA FoodData Central** (Foundation/SR Legacy).
- **Privacy Hardening**: API keys for external services must never be stored on the client. Use environment variables as secure proxies.
- **Offline Calculation**: Basic dose math (ICR/ISF) must function offline using cached or user-input ratios.

## 7. Coding Style
- Functional components with Hooks.
- TypeScript for all files (Strict mode).
- Clean, modular folder structure (e.g., `/src/hooks`, `/src/components`, `/src/store`).

## 8. Agent Repeatability (The "Blueprint" Rule)
- **Decision Log**: Record major architectural choices in `/docs/decisions.md`.
- **Feature Manifest**: Maintain a `features.json` mapping requirements to specific tests and implementation files.
- **Setup Automation**: Maintain an `init.sh` or `setup-env.md` so a fresh Agent can stand up the project and run tests with zero human intervention.
