# Hangar (Flutter)

Hangar is a "smart wardrobe + virtual try-on" Android application translated into **Flutter**.
Local-first, privacy-focused, and open source.

> **Branch Note:** This `flutter` branch contains the complete Flutter project scaffold (folders, 72 empty `.dart` files, `pubspec.yaml`, Android configuration, CI workflow, and Flutter-translated design assets/docs) with **no Dart code written yet**.

## Implementation & Design Documentation

- **[File-by-File Implementation Guide](docs/FileGuide.md)** — Detailed specification of **what to implement in every single file** (`lib/`, `test/`, `assets/`, `android/`, and configs), ported directly from `main`.
- **[Flutter Design System](docs/DesignSystem.md)** — Complete translation of all design elements from `main` (Material You seeds, Light/Dark `ColorScheme` tokens, Roboto typography, MD3 shadows, custom `28px` border radii, icon mappings, responsive layout rules, and PDF styling) into Flutter Material 3 equivalents.
- **[Design Tokens JSON](assets/design/design_tokens.json)** — Machine-readable Flutter-compatible design tokens bundled in `pubspec.yaml`.
- **[Development Setup](docs/Setup.md)** & **[Building and Releasing](docs/Building.md)**.

## Features

- **Digital Wardrobe**: Archive your clothes locally in SQLite with metadata (Category, Season, Color, Occasion, Notes, Favorites).
- **Outfit Planner**: Create outfits manually or get AI-powered outfit recommendations (`Gemini`, `OpenAI`, `Anthropic`, `OpenRouter`).
- **Outfit Recreation**: Upload an inspiration photo and match items from your own wardrobe.
- **Virtual Try-On**: Visualize how clothes look on your own base photos (offline compositing & online VTON).
- **Material You Theming**: Dynamic color scheme generation (`#A35C4E` Redwood default + 5 presets + custom picker) with light/dark mode support.
- **Catalog Export**: Export your wardrobe catalog as a styled PDF.

## Tech Stack

- **Framework**: Flutter (Android, `com.openwardrobe.app`)
- **Language**: Dart (`^3.5.0`)
- **State Management**: `provider`
- **Navigation**: `go_router`
- **Local Storage**: `sqflite` & `shared_preferences`
- **Theming**: Material 3 + `dynamic_color`
- **Media & Export**: `image_picker`, `image`, `pdf`, `printing`

## Project Structure

```text
assets/
  icon.png
  images/
  design/
    design_tokens.json     # Translated Flutter Material 3 design tokens
docs/
  Home.md                  # Wiki overview
  FileGuide.md             # What to implement in every file
  DesignSystem.md          # Tailwind/CSS -> Flutter Material 3 design translation
  Setup.md                 # Local environment setup
  Building.md              # APK builds and releases
lib/
  main.dart                # App initialization & Provider setup
  app.dart                 # MaterialApp.router & DynamicColorBuilder
  core/
    constants/             # App constants & storage keys
    router/                # GoRouter routes & auth/onboarding guards
    theme/                 # Material 3 themes, color schemes & ThemeController
    utils/                 # Image, JSON extraction & SnackBar helpers
  data/
    local/                 # SQLite database & SharedPreferences wrapper
    models/                # WardrobeItem, Outfit, AppSettings, BasePhoto, TryOnImage, UserProfile
    repositories/          # Local repositories for items, outfits, settings, try-ons
    services/              # API client, LLM providers, VTON, PDF export & camera
  shared/
    widgets/               # AppShell, ItemCard, ConfirmDialog, EmptyState, LoadingOverlay
  features/
    auth/                  # Login & Register screens
    onboarding/            # 3-step onboarding & profile setup
    dashboard/             # Stats & quick actions
    wardrobe/              # Wardrobe grid, ItemForm (AI auto-fill) & ItemDetail (Try-On)
    outfits/               # Outfits list, OutfitForm & OutfitDetail
    ai_styling/            # AI Stylist Recommend & Recreate Outfit screens
    try_on/                # Try-On history gallery
    settings/              # Theme/VTON/LLM settings & in-app Docs
test/
  widget_test.dart
  unit/
  widgets/
android/                   # Flutter Android embedding v2 + preserved Hangar icons & splash screens
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
2. Follow [docs/FileGuide.md](docs/FileGuide.md) and [docs/DesignSystem.md](docs/DesignSystem.md) to implement the empty `.dart` files.
3. Run on an Android device or emulator:
   ```bash
   flutter run
   ```

### Build Android APK

#### Option 1: GitHub Actions (Automatic)
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
