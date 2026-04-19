# Swiftulin

**Swiftulin** is a high-precision, privacy-first insulin dosing assistant for diabetics. It uses high-accuracy natural language processing to extract nutritional data from voice commands, providing real-time insulin calculations without storing sensitive medical history.

## Core Philosophical Principles
1. **Privacy Above All**: No meal or insulin logs are persisted. The app is a calculation tool, not a tracker.
2. **Clinical Precision**: Supports decimal (1.5) and fractional (3/4) portions with 0.1 step adjustments.
3. **Safety First**: Transparent math displays every step of the dose calculation (ICR + ISF).

## Technical Blueprint
- **Voice Engine**: Expo Voice + custom NLP extractor with fractional support.
- **Nutritional Data**: FatSecret API with robust local fallbacks.
- **Architecture**: Zustand for flow state, React Query for API data, and SQLite (via Drizzle) for clinical settings.

## Getting Started
1. Install dependencies: `npm install`
2. Start the dev server: `npx expo start`
3. Run tests: `npm test`
