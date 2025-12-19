# Hangar

Hangar is a "smart wardrobe + virtual try-on" Android application.
Local-first, privacy-focused, and open source.

## Features

- **Digital Wardrobe**: Archive your clothes with metadata (Category, Season, Color).
- **Outfit Planner**: Create outfits or get AI-rule-based recommendations.
- **Virtual Try-On**: Visualize how clothes look on your own base photos.

## Tech Stack

- **Framework**: React Native / Capacitor
- **UI**: React, TypeScript, Tailwind CSS
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 18+
- Android Studio (for building the APK locally)

### Development Setup
1. `npm install`
2. `npm run dev` (Runs the web version in browser)

### Build Android APK

#### Option 1: GitHub Actions (Automatic)
This repository uses GitHub Actions to automatically build the APK.
1.  Go to the **Actions** tab in this repository.
2.  Select the latest workflow run.
3.  Download the **app-debug** artifact to get the APK.

#### Option 2: Local Build (Android Studio)
1.  Build the web assets:
    ```bash
    npm run build
    npx cap sync
    ```
2.  Open in Android Studio:
    ```bash
    npx cap open android
    ```
3.  In Android Studio:
    -   Wait for Gradle sync to finish.
    -   Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
    -   The APK will be generated in `android/app/build/outputs/apk/debug/`.

## Contributing
We welcome contributions! Please feel free to check our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to proceed.

## License
MIT © 2025 Hangar Contributors
