# Hangar (Flutter)

Hangar is a "smart wardrobe + virtual try-on" Android application built with **Flutter**.
Local-first, privacy-focused, and open source.

> **Branch Note:** This `flutter` branch contains the scaffolded Flutter project structure (folders, empty `.dart` files, `pubspec.yaml`, Android configuration, and CI workflow) ready for Dart implementation.

## Features

- **Digital Wardrobe**: Archive your clothes with metadata (Category, Season, Color, Occasion, Notes, Favorites).
- **Outfit Planner**: Create outfits manually or get AI-powered outfit recommendations.
- **Outfit Recreation**: Upload an inspiration photo and match items from your own wardrobe.
- **Virtual Try-On**: Visualize how clothes look on your own base photos (offline & online modes).
- **Material You Theming**: Dynamic color scheme generation with light/dark mode support.
- **Catalog Export**: Export your wardrobe catalog as a PDF.

## Tech Stack

- **Framework**: Flutter (Android)
- **Language**: Dart
- **State Management**: Provider
- **Navigation**: GoRouter
- **Local Storage**: SQLite (`sqflite`) & `shared_preferences`
- **Theming**: Material 3 + `dynamic_color`

## Project Structure

```text
lib/
  main.dart
  app.dart
  core/
    constants/
    router/
    theme/
    utils/
  data/
    local/
    models/
    repositories/
    services/
  shared/
    widgets/
  features/
    auth/
    onboarding/
    dashboard/
    wardrobe/
    outfits/
    ai_styling/
    try_on/
    settings/
test/
  unit/
  widgets/
assets/
  icon.png
  images/
android/
```

## Getting Started

### Prerequisites
- Flutter SDK (Dart `^3.5.0`)
- Java JDK 17+
- Android Studio / Android SDK (for building the APK locally)

### Development Setup
1. Install dependencies:
   ```bash
   flutter pub get
   ```
2. Run on an Android device or emulator (after implementing Dart entrypoints):
   ```bash
   flutter run
   ```

### Build Android APK

#### Option 1: GitHub Actions (Automatic)
This repository uses GitHub Actions to build the APK automatically.
1. Go to the **Actions** tab in this repository.
2. Select the latest workflow run.
3. Download the **app-debug** artifact to get the APK.

#### Option 2: Local Build
```bash
flutter build apk --debug
```
The APK will be generated in `build/app/outputs/apk/debug/app-debug.apk`.

## Contributing
We welcome contributions! Please feel free to check our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to proceed.

## License
MIT © 2025 Hangar Contributors
