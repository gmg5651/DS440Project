# Setup Environment (Zero Human Intervention)

This document is for an agent setting up the project from scratch.

## Prerequisites
- Node.js 20+
- npm (ships with Node)

## Setup Steps
1. Clone the repository and checkout `develop`:
   ```bash
   git clone <repo_url> swiftulin
   cd swiftulin
   git checkout develop
   ```
2. Install dependencies:
   ```bash
   npm ci
   ```
3. Run tests to verify the setup:
   ```bash
   npm run test
   ```
4. Start the development server (iOS Simulator recommended):
   ```bash
   npm run ios
   ```

No external API keys or manual .env setup are required for the MVP offline mode.
