# Swiftulin

**Swiftulin** is a high-precision, privacy-first insulin dosing assistant for diabetics. It uses high-accuracy natural language processing to extract nutritional data from voice commands, providing real-time insulin calculations without storing sensitive medical history.

## Core Philosophical Principles
1. **Privacy Above All**: No meal or insulin logs are persisted. The app is a calculation tool, not a tracker.
2. **Clinical Precision**: Supports decimal (1.5) and fractional (3/4) portions with 0.1 step adjustments.
3. **Safety First**: Transparent math displays every step of the dose calculation (ICR + ISF).

## Technical Blueprint
- **Voice Engine**: expo-speech-recognition + custom NLP extractor with fractional support.
- **Nutritional Data**: USDA FoodData Central API with robust local fallbacks.
- **Architecture**: Zustand for flow state, React Query for API data, and SQLite (via Drizzle) for clinical settings.

## Getting Started (Step-by-Step for Beginners)

This section provides a foolproof, step-by-step guide to cloning, setting up, and running this project on a brand-new computer. There are absolutely **no API keys or .env files required** to run this app—it is pre-configured to authenticate securely without manual setup.

### Step 1: Prerequisites
Before starting, ensure you have the following installed on your computer:
- **Node.js** (version 18 or higher): Download and install from [nodejs.org](https://nodejs.org/).
- **Git**: Download and install from [git-scm.com](https://git-scm.com/).
- **Expo Go App (Optional)**: Download "Expo Go" on your physical iPhone or Android to run the app directly on your device.

### Step 2: Clone the Repository
Open a terminal (Mac: Terminal, Windows: Command Prompt or PowerShell) and run the following command to download the code:
```bash
git clone https://github.com/gmg5651/DS440Project.git
```
*(Replace the URL above if your repository URL differs).*

To enter the project folder, run:
```bash
cd DS440Project
```

### Step 3: Install Dependencies
Inside the project folder, install all required packages by running:
```bash
npm install
```
*(This might take a minute or two depending on your internet connection).*

### Step 4: Run the Application
Start the Expo development server:
```bash
npx expo start
```
This will display a QR code in your terminal. 
- **Web:** Press the `w` key on your keyboard. Expo will instantly open a new browser tab with your application running!
- **Physical Device:** Open the Camera app on your iPhone (or use the Expo Go app directly on Android) and scan the QR code to open the app.
- **Simulator:** Press `i` to open the app in the iOS Simulator (Mac only) or `a` to open it in an Android Emulator.

### Step 5: Run Tests (Verification)
If you need to verify the code runs perfectly without errors, open a new terminal window inside the project folder and run:
```bash
npm test
```
