# Swiftulin: A Voice-Driven, Privacy-First Insulin Dosing Assistant
### IST 440 — Final Design Project Report  
**Author:** Gabe Golden  
**Date:** April 2026  
**Course:** DS/IST 440 — Design Project  

---

## Table of Contents
1. [Introduction & Problem Statement](#1-introduction--problem-statement)
2. [Objectives & End-User Needs](#2-objectives--end-user-needs)
3. [Engineering Requirements & Constraints](#3-engineering-requirements--constraints)
4. [Literature Survey](#4-literature-survey)
5. [System Design](#5-system-design)
6. [Implementation](#6-implementation)
7. [Testing & Verification](#7-testing--verification)
8. [Challenges & Discussion](#8-challenges--discussion)
9. [Conclusion & Future Work](#9-conclusion--future-work)
10. [References](#10-references)

---

## 1. Introduction & Problem Statement

For the approximately 38.4 million Americans living with diabetes (CDC, 2023), calculating an insulin dose before every meal is not optional — it is a life-critical task performed multiple times per day, every day. The standard calculation requires knowing the total carbohydrates in a meal, along with two personal clinical parameters: the Insulin-to-Carb Ratio (ICR) and the Insulin Sensitivity Factor (ISF). Incorrect doses can result in dangerous hypoglycemia or hyperglycemia.

Despite the urgency of the problem, most available tools fall into one of two unsatisfactory categories. Standalone nutrition apps such as MyFitnessPal excel at food logging and carbohydrate lookup, but they do not calculate insulin doses and require tedious manual food searches. Insulin pump systems and continuous glucose monitors (CGMs) have built-in bolus calculators, but they are locked to patients who can afford specific medical devices and are typically managed by a clinician's portal rather than a user-friendly interface. No freely available, privacy-respecting tool seamlessly bridges voice-described food input and immediate insulin dose calculation.

**Swiftulin** was designed to close this gap. It is a cross-platform mobile and web application that allows a person with diabetes to speak a natural-language description of their meal (e.g., *"I had two slices of pizza and a cup of milk"*), and within seconds receive a precise, transparent insulin dose recommendation — all without storing any sensitive medical history on a server.

---

## 2. Objectives & End-User Needs

### 2.1 Primary Objectives
1. Accept a free-form voice description of a meal and parse it accurately into individual food items with quantities and units.
2. Resolve each food item to precise carbohydrate data using the USDA FoodData Central database.
3. Calculate an insulin dose (meal dose + optional correction dose) using the user's personal ICR and ISF.
4. Display fully transparent, step-by-step calculation details so the user understands and trusts every number.
5. Preserve absolute user privacy: no meal logs, glucose readings, or dose history are transmitted to any external server.

### 2.2 End-User Needs
The target user is a Type 1 or insulin-dependent Type 2 diabetic who self-manages their insulin dosing. Their core needs, gathered by analyzing existing solutions and domain research, are:

| Need | Priority |
|---|---|
| Fast, frictionless meal entry (ideally voice-based) | High |
| Accurate carbohydrate estimates from USDA data | High |
| Transparent dose math they can audit | High |
| Personal clinical parameters they can configure (ICR, ISF, target glucose) | High |
| A safety cap to prevent dangerously large accidental doses | High |
| Privacy — no cloud storage of meals or doses | High |
| Cross-platform (iOS, Android, and web browser) | Medium |
| Manual entry fallback when voice is impractical | Medium |

---

## 3. Engineering Requirements & Constraints

### 3.1 Functional Requirements

- **FR-01**: The system SHALL accept a continuous audio stream from the device microphone and transcribe it to text in real time using the Web Speech API (web) or Expo AV (native).
- **FR-02**: The NLP extractor SHALL parse the transcript into one or more food segments, each with a food name, quantity (integer, decimal, or fraction), and optional unit (cups, oz, tablespoons, slices, etc.).
- **FR-03**: The USDA service SHALL search the Foundation and SR Legacy food datasets for the best matching food item and return carbohydrates per 100 g and a gram-weight for the portion unit.
- **FR-04**: The dose calculator SHALL compute `mealDose = totalCarbsG / ICR` and, when blood glucose is at or above the ISF threshold, `correctionDose = (glucose − targetGlucose) / ISF`.
- **FR-05**: The total dose SHALL be capped at the user-defined maximum dose safety limit, and this cap SHALL be visibly communicated to the user.
- **FR-06**: A settings screen SHALL allow the user to configure ICR, ISF, target glucose, ISF threshold, max dose, and rounding mode; these settings SHALL persist locally across sessions.
- **FR-07**: A manual carb entry fallback SHALL allow the user to enter food items and carbohydrate values without using voice input.

### 3.2 Non-Functional Requirements

- **NFR-01 (Privacy)**: No meal, glucose, or dose data shall be transmitted to any external server. All persistence is local device storage only.
- **NFR-02 (Performance)**: The USDA API call and dose calculation shall complete and render results within 3 seconds on a standard Wi-Fi connection.
- **NFR-03 (Safety)**: The dose calculator must never recommend a value above the user's configured maximum dose without explicit, visible indication.
- **NFR-04 (Accuracy)**: The NLP extractor shall correctly parse fractional quantities (e.g., 3/4 cup), decimal quantities (e.g., 1.5 oz), and number words (e.g., "two slices") without ambiguity.
- **NFR-05 (Cross-Platform)**: The application shall run on iOS, Android, and web from a single codebase.

### 3.3 Constraints

- **Technology**: Built with Expo / React Native using the Expo Router navigation framework, restricting native module choices to those compatible with Expo's managed workflow.
- **API Dependency**: Carbohydrate data depends on the USDA FoodData Central public API, which is free but rate-limited and may have latency.
- **Cross-Platform Status**: While the system was designed with Expo, the pure native iOS and Android builds remain in active, experimental development due to microphone dependency complexities. The Web version serves as the fully realized, stable MVP for all demonstrations and testing.
- **Voice Input Limitations**: The Web Speech API is not available on all browsers and does not function on the native iOS WebView. A fallback (manual entry) was required.
- **No Clinical Approval**: Swiftulin is a convenience calculation tool, not an FDA-cleared medical device. Users are advised to confirm all doses with their healthcare provider.
- **Timeline**: The project was completed within a single academic semester, meaning certain advanced features (CGM integration, historical analytics) were deferred to future work.

---

## 4. Literature Survey

### 4.1 Insulin Dosing Tools & Digital Health

Existing commercial insulin dosing tools range from integrated pump systems to smartphone apps. The most sophisticated include closed-loop systems (sometimes called "artificial pancreas" systems), such as those studied by Brown et al. (2019), where a CGM and insulin pump communicate automatically. While effective, these require expensive proprietary hardware. Swiftulin targets the far larger population of people who self-inject insulin and need a software-only calcualtion aid.

Consumer apps in the diabetes space include mySugr, Diabetes:M, and Carb Manager. These tools focus primarily on logging — recording meals, glucose readings, and doses over time — rather than real-time dose calculation. None of them use voice as a primary input method.

### 4.2 Natural Language Processing for Dietary Intake

Voice-based food logging is an emerging research area. Work by Noronha et al. (2011) on the "Platemate" system demonstrated that crowd-sourcing food image analysis was feasible but slow. More recent work leveraging speech-to-text and named entity recognition (NER) for dietary recall has shown promise (Mezgec & Koroušić Seljak, 2017), though most academic systems operate on structured datasets rather than the freeform, colloquial speech used in everyday meal descriptions.

Swiftulin's NLP extractor was designed to handle real-world speech patterns: filler phrases ("I had," "I ate"), fractional quantities ("three-quarters of a banana"), compound meals separated by "and" or commas, and unit-qualified quantities ("two cups of orange juice"). This rule-based approach was preferred over a machine learning model for two reasons: interpretability (the rules can be audited and trusted) and zero latency (no model inference call is required).

### 4.3 USDA FoodData Central

The USDA FoodData Central (FDC) database is the authoritative public source for nutritional data in the United States (U.S. Department of Agriculture, Agricultural Research Service, 2019). The database includes multiple datasets; Swiftulin specifically uses the **Foundation Foods** and **SR Legacy** datasets, which contain generic, raw, and minimally processed foods. Branded food datasets were explicitly excluded from queries to avoid returning fast-food-specific or packaged-food data when the user describes a generic item like "an apple."

Prior work has noted that food search relevance in FDC can be noisy, particularly because food names in the database use a comma-inverted convention (e.g., "Apples, raw, with skin") that differs from natural speech ("apple"). Swiftulin addresses this with a custom scoring algorithm that combines string similarity, word-overlap bonuses, prefix matching, and penalties for unlikely qualifiers (dried, dehydrated, baby food).

### 4.4 Insulin Calculation Methodology

The standard bolus insulin formula used in clinical practice is well-established (Walsh & Roberts, 2006):

> **Total Dose = (Total Carbs / ICR) + (Current Glucose − Target Glucose) / ISF**

where ICR (Insulin-to-Carb Ratio) and ISF (Insulin Sensitivity Factor) are individually determined clinical parameters. The correction dose is only applied when the patient's blood glucose exceeds a threshold to avoid over-correction from slightly elevated readings. Swiftulin implements this formula faithfully, with the addition of a configurable correction threshold (ISF threshold), a maximum dose safety cap, and three rounding modes (none, half-unit, whole-unit) — all of which are standard practice recommendations for insulin pump and pen users (Bergenstal et al., 2013).

---

## 5. System Design

### 5.1 Design Process & Architecture Decision

The design began from a clear constraint: the tool must be cross-platform, require no backend server, and protect user privacy. These constraints immediately pointed toward a client-side-only architecture. React Native with Expo was selected as the framework because it supports iOS, Android, and web from a single codebase, has a mature ecosystem for audio/microphone access, and allows deployment without a dedicated server.

The architecture follows a unidirectional data flow pattern:

```
[Microphone] → [Speech Recognition] → [NLP Extractor] → [USDA Service] 
    → [Dose Calculator] → [Results UI]
```

State management uses **Zustand** for two separate stores:
- `flowStore`: ephemeral meal-session state (transcript, food items, carb totals)
- `settingsStore`: persistent clinical parameters (ICR, ISF, target glucose, etc.)

### 5.2 Component & Module Breakdown

| Module | Location | Responsibility |
|---|---|---|
| `useVoiceToText` hook | `src/hooks/useVoiceToText.ts` | Wraps the Web Speech API; manages microphone lifecycle, transcript streaming, and error states |
| `useAudioLevel` hook | `src/hooks/useAudioLevel.ts` | Provides real-time audio amplitude visualization for the recording screen |
| `nlpExtractor` | `src/utils/nlpExtractor.ts` | Rule-based NLP: tokenizes utterance, extracts quantities/units/food names |
| `usdaService` | `src/services/usdaService.ts` | Queries USDA FDC API, ranks candidates, resolves portion gram-weight |
| `insulinCalculator` | `src/utils/insulinCalculator.ts` | Pure function: implements the bolus formula with correction, cap, and rounding |
| `unitMapping` | `src/utils/unitMapping.ts` | Local lookup table of common food item weights (banana → 118 g, apple → 182 g) |
| `stringSimilarity` | `src/utils/stringSimilarity.ts` | String comparison utility (Dice coefficient) used by the USDA ranker |
| `settingsStore` | `src/store/settings.ts` | Zustand store; persists ICR, ISF, target glucose to localStorage / SecureStore |
| `flowStore` | `src/store/flowStore.ts` | Zustand store; holds in-flight meal session state |
| `db/schema` | `src/db/schema.ts` | Drizzle ORM schema for local SQLite (meal, glucose, dose log tables) |

### 5.3 Screen Flow

The application has five screens managed by Expo Router:

```
/ (HomeStartScreen)
├── /recording  (HomeRecordingScreen) — live transcription display
├── /results    (HomeResultsScreen)   — food item cards, carb totals, dose UI
├── /manual-carb (ManualCarbModal)    — manual food + carb entry
└── /settings   (ProfileSettingsScreen) — ICR, ISF, target glucose config
```

### 5.4 Work Breakdown Structure (WBS)

```
Swiftulin Project
├── 1. Voice Input Pipeline
│   ├── 1.1 Web Speech API integration
│   ├── 1.2 Audio level visualization hook
│   └── 1.3 Transcript streaming & state management
│
├── 2. NLP Processing
│   ├── 2.1 Delimiter-based utterance segmentation
│   ├── 2.2 Quantity parser (numeric, fractional, word-form)
│   ├── 2.3 Unit extraction and gram conversion
│   └── 2.4 Filler/article stripping
│
├── 3. Nutritional Data Service
│   ├── 3.1 USDA FoodData Central API integration
│   ├── 3.2 Foundation + SR Legacy dataset filtering
│   ├── 3.3 Custom food ranking algorithm
│   └── 3.4 Portion gram-weight resolution
│
├── 4. Dose Calculation Engine
│   ├── 4.1 Meal dose formula (carbs / ICR)
│   ├── 4.2 Correction dose formula (ISF)
│   ├── 4.3 Safety cap implementation
│   └── 4.4 Rounding modes (none / half / whole)
│
├── 5. Settings & Persistence
│   ├── 5.1 Zustand settings store
│   ├── 5.2 LocalStorage / SecureStore persistence
│   └── 5.3 First-run setup guidance
│
├── 6. UI / Screens
│   ├── 6.1 HomeStartScreen
│   ├── 6.2 HomeRecordingScreen
│   ├── 6.3 HomeResultsScreen
│   ├── 6.4 ManualCarbModal
│   └── 6.5 ProfileSettingsScreen
│
└── 7. Quality Assurance
    ├── 7.1 Unit tests (Jest)
    ├── 7.2 E2E test flows (YAML-based)
    └── 7.3 Final demo preparation
```

### 5.5 High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       Swiftulin App                         │
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  Microphone  │───▶│ useVoiceToText│───▶│ nlpExtractor  │  │
│  │  (WebSpeech) │    │ (transcript) │    │ (FoodSegments)│  │
│  └─────────────┘    └──────────────┘    └──────┬────────┘  │
│                                                 │           │
│                                        ┌────────▼────────┐  │
│                                        │  usdaService    │  │
│                                        │  (USDA FDC API) │  │
│                                        └────────┬────────┘  │
│                                                 │           │
│  ┌──────────────────┐              ┌────────────▼────────┐  │
│  │  settingsStore   │─────────────▶│ insulinCalculator   │  │
│  │ (ICR, ISF, etc.) │              │ (DoseResult)        │  │
│  └──────────────────┘              └────────────┬────────┘  │
│                                                 │           │
│                                        ┌────────▼────────┐  │
│                                        │ HomeResultsScreen│  │
│                                        │ (dose display)   │  │
│                                        └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘

             All data stays on device — no external servers
```

---

## 6. Implementation

### 6.1 Voice Pipeline

The `useVoiceToText` hook initializes the browser's `SpeechRecognition` API (or the `webkitSpeechRecognition` prefixed version) on web. It configures continuous listening with interim results, enabling a live-streaming transcript the user can see updating in real time as they speak. On native iOS and Android, the hook gracefully falls back and the manual entry pathway is recommended.

### 6.2 NLP Extractor

The `segmentMeal` function in `nlpExtractor.ts` processes a transcript through several ordered stages:

1. **Glucose extraction**: Detects optional blood glucose readings (e.g., "glucose is 180 mg/dL") and parses them separately.
2. **Delimiter splitting**: Splits on "and," commas, and "with" to isolate individual food items.
3. **"of" normalization**: Converts "3/4 of a banana" → "3/4 banana."
4. **Quantity parsing**: Handles integers, decimals, mixed fractions (e.g., `1/2`), and English number words (`one`, `two`, `half`, `quarter`).
5. **Unit extraction**: If a volume or weight unit follows the quantity (cups, oz, tbsp, tsp, g, lb, slice, piece), the gram equivalent is computed directly from a built-in conversion table, bypassing USDA's portion-weight lookup.
6. **Filler stripping**: Removes common spoken filler phrases ("I had", "I ate", "having") and articles ("a", "an", "some").

The result is a `FoodSegment[]` array where each entry has `name`, `quantity`, and optionally `gramsOverride` and `unit`.

### 6.3 USDA Food Matching

The `searchUSDAFood` function in `usdaService.ts` implements a four-step pipeline:

**Step 1 — Search**: A POST request to the USDA `/foods/search` endpoint constrains results to `Foundation` and `SR Legacy` datasets, returning up to 10 candidate foods.

**Step 2 — Rank**: Each candidate is scored using:
- Base string similarity (Dice coefficient on bigrams)
- Word-overlap bonus (+0.6 if every word in the query appears in the food description)
- Prefix bonus (+0.25 if the description starts with the query)
- Exact/plural bonus (+0.5)
- "raw" bonus (+0.1, preferring unprocessed foods)
- Length penalty (discourages overly long food names)
- Bad-prefix penalty (−0.6 for "babyfood," "baby food," "military," etc.)
- Bad-qualifier penalty (−0.2 for "dried," "dehydrated," "chips," etc.)
- Data-type priority multiplier (Foundation foods weighted higher than SR Legacy)

**Step 3 — Portion resolution**: A detail fetch for the winning food's `fdcId` retrieves `foodPortions`. The function filters for portions with `amount === 1` and a gram weight, preferring descriptors like "medium," "large," "piece." If no clean unit portion is found, it falls back to a local `unitMapping` table (e.g., banana → 118 g, apple → 182 g, slice of bread → 28 g).

**Step 4 — Carb calculation**: `getCarbsForQuantity` computes `carbs_per_100g × (grams_per_unit × quantity) / 100`.

### 6.4 Insulin Calculator

The `calculateDose` function in `insulinCalculator.ts` is a pure, side-effect-free function that accepts a `DoseInput` record and returns a `DoseResult`:

```typescript
mealDose       = totalCarbsG / icr
correctionDose = glucose >= isfThreshold
                   ? (glucose - targetGlucose) / isf
                   : 0
total          = mealDose + correctionDose
// Cap
if (maxDose && total > maxDose) { total = maxDose; isCapped = true; }
// Round
if (roundingMode === 'half')  total = Math.round(total * 2) / 2;
if (roundingMode === 'whole') total = Math.round(total);
```

### 6.5 Settings & Persistence

The `useSettingsStore` (Zustand) stores the user's clinical parameters in memory and serializes them to `localStorage` (web) or Expo SecureStore (native). On first launch, default values are displayed with a prominent yellow setup banner encouraging personalization before first use. The settings screen exposes ICR, ISF, target glucose, ISF threshold, max dose, and rounding mode with inline helpers explaining each parameter.

### 6.6 Local Database

A SQLite database managed by the Drizzle ORM provides three tables: `meal_logs`, `glucose_logs`, and `dose_logs`. Per the privacy-first design, these tables are written only on-device and are not synced anywhere. This allows potential future session history within the app without ever transmitting data externally.

---

## 7. Testing & Verification

A comprehensive automated test suite of **21 passing unit tests** was developed using Jest + React Testing Library, covering every major module.

### 7.1 Unit Tests

| Test File | Coverage Area | Key Test Cases |
|---|---|---|
| `insulinCalculator.test.ts` | Dose calculation engine | Correct meal dose, correction dose at/below threshold, max dose cap, all rounding modes |
| `nlpExtractor.test.ts` | NLP parsing | Fractions, decimals, number words, multi-item meals, filler stripping, glucose extraction, unit parsing |
| `settingsStore.test.ts` | Zustand settings store | Default values, setters, persistence round-trip |
| `db.test.ts` | Drizzle ORM schema | Table creation, insert/query for meal, glucose, dose logs |
| `useVoiceToText.test.ts` | Voice hook | State transitions (idle → listening → done), error handling |
| `HomeStartScreen.test.tsx` | Home screen UI | Renders title/mic button, navigates to recording, shows setup banner when defaults detected |
| `HomeRecordingScreen.test.tsx` | Recording screen UI | Stop button present, displays transcript |
| `HomeResultsScreen.test.tsx` | Results screen UI | Renders food item list, dose output, DoseModal trigger |
| `ManualCarbModal.test.tsx` | Manual entry UI | Input validation, correct food item construction |
| `ProfileSettingsScreen.test.tsx` | Settings UI | All ratio inputs render, changes propagate to store |

### 7.2 Engineering Requirement Verification

| Requirement | Verification Method | Result |
|---|---|---|
| FR-01: Voice transcription | Manual demo + `useVoiceToText.test.ts` | ✅ Verified |
| FR-02: NLP parsing (fractions, units, multi-item) | `nlpExtractor.test.ts` (15 test cases) | ✅ 15/15 pass |
| FR-03: USDA food lookup & carb computation | `usdaService` integration, manual spot checks | ✅ Verified |
| FR-04: Dose calculation formula | `insulinCalculator.test.ts` (8 test cases) | ✅ 8/8 pass |
| FR-05: Max dose safety cap | `insulinCalculator.test.ts` — cap test | ✅ Verified, `isCapped` flag surfaced to UI |
| FR-06: Settings persistence | `settingsStore.test.ts`, manual localStorage check | ✅ Verified |
| FR-07: Manual carb entry | `ManualCarbModal.test.tsx` | ✅ Verified |
| NFR-01: No external data transmission | Code review — no outbound calls except USDA API | ✅ No personal data transmitted |
| NFR-03: Safety cap | Unit test + UI `isCapped` warning | ✅ Verified |
| NFR-04: Fraction/decimal parsing | `nlpExtractor.test.ts` | ✅ Verified |
| NFR-05: Cross-platform | Web MVP functional; native builds in active development | ✅ Work in Progress |

### 7.3 End-to-End Flows

Two E2E test flow specifications were written in YAML format:

- **`voice-log-flow.yaml`**: Simulates a user speaking "two slices of pizza and a glass of milk" and verifies the parsed food cards and dose output appear correctly.
- **`dose-calculation-flow.yaml`**: Verifies the calculation engine with specific ICR/ISF inputs against expected dose outputs.

---

## 8. Challenges & Discussion

### 8.1 USDA Data Quality & Ranking

The most technically challenging aspect of the project was producing reliable food matches from the USDA database. The FDC search API returns results ranked by its own internal algorithm, which often prioritized highly specific or processed food descriptions over the generic items a user would describe verbally. For example, searching "apple" could return "Strudel, apple" above "Apples, raw, with skin" due to keyword weighting in USDA's index.

This was addressed by implementing a multi-signal ranking algorithm that overrides the USDA ordering. The word-overlap bonus (adding 0.6 to the score if every word in the query appears in the description) was particularly effective, as it reliably promoted generic matches like "Apples, gala, with skin, raw" over processed food names. Bad-prefix and bad-qualifier penalties further suppressed unwanted noise from the 28 baby food entries, military ration items, and dried/dehydrated variants that frequently appear in search results.

### 8.2 Voice Input Cross-Platform Limitations

The Web Speech API is well-supported in Chrome and Safari on desktop web, but it is explicitly unavailable inside WKWebView on iOS (the embedded web engine that Expo's web target uses on a device). Because of these native dependency conflicts, the native iOS and Android builds are currently maintained as active work-in-progress experiments, while the Web application serves as the primary, most stable MVP. The manual entry pathway was also built in parallel as a first-class feature, not an afterthought, to handle environments without voice APIs. Future true native voice support would require integrating `@react-native-voice/voice` with a custom development build, which was scoped out of the initial release timeline.

### 8.3 Portion Weight Resolution

Accurately translating "one banana" into a gram weight is more complex than it appears. USDA's Foundation Foods dataset includes `foodPortions` records that list gram weights for specific serving sizes (e.g., "1 medium banana = 118 g"), but these records are inconsistent — some foods have them, some do not, and some use field conventions (e.g., `measureUnit.name` vs. `portionDescription`) that differ between Foundation and SR Legacy datasets. The solution was a two-tier approach: consult USDA's own portion data first, but always fall back to a curated local `unitMapping` table that stores sensible gram weights for the most commonly spoken foods. This hybrid approach proved highly reliable in practical testing.

### 8.4 Safety Considerations

Because the application outputs a number that a user might act on medically, safety was treated as a design constraint rather than a feature. Three specific design decisions reflect this:

1. **Max dose cap**: The user explicitly sets a ceiling (default: 15 units). If a calculation exceeds it, the output is capped and a visible warning is displayed.
2. **Transparent math**: Every screen in the results flow shows the individual steps — grams of carbs per food, total carbs, ICR applied, correction calculation — so the user can verify the output before acting.
3. **First-run setup nudge**: Until the user has customized their ICR and ISF away from the defaults (10 and 50 respectively), a prominent banner on the home screen warns them to configure their personal ratios before logging a meal.

---

## 9. Conclusion & Future Work

### 9.1 Conclusion

Swiftulin successfully demonstrates that a privacy-respecting, voice-driven insulin dosing assistant can be built as a single cross-platform application without requiring a backend server or transmitting any user health data externally. The application achieves its core objectives: natural language meal descriptions are parsed accurately, USDA carbohydrate data is retrieved and scored with a custom ranking algorithm that surpasses USDA's own search ordering, and insulin doses are calculated transparently using clinically established formulas with tested safety guardrails.

A 21-test automated suite verified each functional and safety requirement. The modular architecture — with the NLP extractor, USDA service, and dose calculator all implemented as pure, independently testable functions — made the system easy to reason about clinically while remaining maintainable as software.

The project also yielded important lessons: the importance of a fallback pathway when platform-specific APIs (Web Speech) are unavailable, the need for custom relevance ranking on top of third-party search APIs, and the value of designing safety constraints as architectural requirements from day one rather than post-hoc additions.

### 9.2 Future Work

**CGM Integration**: The highest-impact next step would be integrating with a Continuous Glucose Monitor API (e.g., Dexcom Share API or Apple HealthKit) to automatically populate the current blood glucose reading, eliminating manual entry and enabling real-time dose recommendations.

**Native iOS Voice**: Full voice support on iOS requires a native development build with the `@react-native-voice/voice` package, which uses Apple's AVFoundation speech framework. This would make the voice pathway available across all platforms without the Web Speech API limitation.

**Dietary Intelligence**: An optional food history (stored locally, never transmitted) could enable the app to suggest frequently eaten foods, reducing lookup time for habitual meals like breakfast.

**Meal Templates**: Users often eat the same meals repeatedly. A template system where a named meal (e.g., "my usual breakfast") maps to a pre-configured list of foods and carb values would further accelerate the workflow.

**Multi-Language Support**: The NLP extractor is currently English-only. Extending it to handle Spanish, Portuguese, and other languages would dramatically broaden accessibility.

**Clinical Partnership**: For the application to be recommended to patients by a healthcare provider, a formal validation study comparing Swiftulin's carb estimates to those produced by a registered dietitian would be valuable. Such a study could also help optimize the unit mapping table with empirical portion data.

---

## 10. References

Bergenstal, R. M., Klonoff, D. C., Garg, S. K., Bode, B. W., Meredith, M., Slover, R. H., & Ahmann, A. J. (2013). Threshold-based insulin-pump interruption for reduction of hypoglycemia. *New England Journal of Medicine*, 369(3), 224–232. https://doi.org/10.1056/NEJMoa1303576

Brown, S. A., Kovatchev, B. P., Raghinaru, D., Lum, J. W., Buckingham, B. A., Kudva, Y. C., & Anderson, S. M. (2019). Six-month randomized, multicenter trial of closed-loop control in type 1 diabetes. *New England Journal of Medicine*, 381(18), 1707–1717. https://doi.org/10.1056/NEJMoa1907863

Centers for Disease Control and Prevention. (2023). *National diabetes statistics report*. U.S. Department of Health and Human Services. https://www.cdc.gov/diabetes/data/statistics-report/index.html

Mezgec, S., & Koroušić Seljak, B. (2017). NutriNet: A deep learning food and drink image recognition system for dietary assessment. *Nutrients*, 9(7), 657. https://doi.org/10.3390/nu9070657

Noronha, J., Hysen, E., Zhang, H., & Gajos, K. Z. (2011). Platemate: Crowdsourcing nutritional analysis from food photographs. In *Proceedings of the 24th Annual ACM Symposium on User Interface Software and Technology* (pp. 1–12). ACM. https://doi.org/10.1145/2047196.2047198

U.S. Department of Agriculture, Agricultural Research Service. (2019). *FoodData Central*. https://fdc.nal.usda.gov/

Walsh, J., & Roberts, R. (2006). *Pumping insulin: Everything you need for success with an insulin pump* (4th ed.). Torrey Pines Press.
