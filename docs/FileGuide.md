# Hangar Flutter File-by-File Implementation Guide

This guide describes what belongs in **every file** of the `flutter` branch so you can implement the Dart codebase cleanly without guessing business logic, schema fields, API contracts, routes, or visual styling.

For exact color codes, typography, shadows, radii, icons, and responsive breakpoints translated from `main`, see [DesignSystem.md](DesignSystem.md) and [assets/design/design_tokens.json](../assets/design/design_tokens.json).

---

## 1. Root, Design Tokens & Android Platform Files (Already Configured)

- [pubspec.yaml](../pubspec.yaml): Flutter manifest (`name: hangar`, Dart `^3.5.0`) declaring dependencies (`provider`, `go_router`, `dynamic_color`, `sqflite`, `path`, `path_provider`, `shared_preferences`, `http`, `image_picker`, `pdf`, `printing`, `image`, `intl`) and assets (`assets/icon.png`, `assets/images/`, `assets/design/design_tokens.json`).
- [analysis_options.yaml](../analysis_options.yaml): Enables `package:flutter_lints/flutter.yaml`.
- [assets/design/design_tokens.json](../assets/design/design_tokens.json): Machine-readable Flutter-compatible colors, typography scale, border radii (`xl` overridden to `28.0`), shadows (`md3Level1`, `md3Level2`), layout breakpoints, animations, and PDF styling from `main`.
- [.github/workflows/android-release.yml](../.github/workflows/android-release.yml): Runs `flutter pub get`, `flutter analyze`, `flutter test`, and `flutter build apk --debug` on pushes to `flutter` or `v*` tags.
- [android/app/build.gradle](../android/app/build.gradle), [android/settings.gradle](../android/settings.gradle), [android/build.gradle](../android/build.gradle), [android/gradle.properties](../android/gradle.properties): Flutter Gradle plugin configuration (`com.openwardrobe.app`, `minSdk = 23`).
- [android/app/src/main/kotlin/com/openwardrobe/app/MainActivity.kt](../android/app/src/main/kotlin/com/openwardrobe/app/MainActivity.kt): `FlutterActivity` entrypoint.
- `android/app/src/main/res/`: Preserved Hangar launcher icons (`mipmap-*`), splash images (`drawable*/splash.png`), light/dark splash drawables (`launch_background.xml`), and color tokens (`values/colors.xml`, `values-night/colors.xml`).

---

## 2. Entrypoint & Core (`lib/`)

### Entrypoint
- [lib/main.dart](../lib/main.dart): Initialize `WidgetsFlutterBinding.ensureInitialized()`, open `AppDatabase` and `PreferencesService`, load initial `ThemeController` state (seed color + dark mode) and auth/onboarding state, wrap the root widget with `MultiProvider`, and call `runApp(const HangarApp())`.
- [lib/app.dart](../lib/app.dart): Define `HangarApp` (`StatelessWidget`). Wrap `MaterialApp.router` in `DynamicColorBuilder` / `Consumer<ThemeController>`, attach `AppRouter.router`, configure `lightTheme`, `darkTheme`, `themeMode`, and title `'Hangar'`.

### `lib/core/constants/`
- [lib/core/constants/app_constants.dart](../lib/core/constants/app_constants.dart): Hold app-wide constants: app name (`'Hangar'`, brand `'OpenWardrobe'`), version (`'0.0.1'` / `'1.0.0'`), default API base URL (`'http://localhost:8000'`), categories (`['all', 'tops', 'bottoms', 'dresses', 'shoes', 'accessories']`), seasons (`['all', 'summer', 'winter', 'spring', 'autumn']`), occasions (`['casual', 'formal', 'party', 'sports']`), LLM provider IDs (`'gemini'`, `'openai'`, `'anthropic'`, `'openrouter'`), default OpenRouter model (`'google/gemini-2.0-flash-001'`), and preset theme seed hex list from `DesignSystem.md`.
- [lib/core/constants/storage_keys.dart](../lib/core/constants/storage_keys.dart): Centralize `SharedPreferences` keys matching `main`'s `localStorage` keys (`'token'`, `'theme'`, `'theme_seed'`) plus SQLite table/column name constants.

### `lib/core/router/`
- [lib/core/router/route_names.dart](../lib/core/router/route_names.dart): Named route constants matching `src/App.tsx`: `/login`, `/register`, `/onboarding`, `/dashboard`, `/wardrobe`, `/items/new`, `/items/:id`, `/outfits`, `/outfits/new`, `/outfits/:id`, `/recommend`, `/recreate`, `/tryon-history`, `/settings`, `/docs`.
- [lib/core/router/app_router.dart](../lib/core/router/app_router.dart): Configure `GoRouter` with:
  - Auth guard redirect: if no `'token'` in `PreferencesService`, redirect protected routes to `/login` (matches `ProtectedRoute`).
  - First-run / onboarding guard: if `settings` row `id = 1` does not exist, insert defaults (`useOnlineVton: false`, `selectedLlmProvider: 'gemini'`) and redirect to `/onboarding`; if `!onboardingComplete`, redirect to `/onboarding` (matches `InitCheck`).
  - `ShellRoute` wrapping `AppShell` around `/dashboard`, `/wardrobe`, `/items/new`, `/items/:id`, `/outfits`, `/outfits/new`, `/outfits/:id`, `/recommend`, `/recreate`, `/tryon-history`, `/settings`, `/docs`.

### `lib/core/theme/`
- [lib/core/theme/color_schemes.dart](../lib/core/theme/color_schemes.dart): Build light and dark `ColorScheme` objects from a seed color (`ColorScheme.fromSeed`) plus fallback Redwood palettes (`0xFFA35C4E` default seed, `0xFF1F1F1F` dark background, `0xFF282828`/`0xFF292929` dark surface, `0xFFFAFAFA` light background, `0xFFE6A300` secondary, `0xFFB3261E` error, `0xFF79747E` outline) and preset swatch definitions.
- [lib/core/theme/app_theme.dart](../lib/core/theme/app_theme.dart): Build `ThemeData` (`useMaterial3: true`, `fontFamily: 'Roboto'`, `CardThemeData`, `InputDecorationTheme`, `ElevatedButtonThemeData`, `ChipThemeData`, `NavigationBarThemeData`) and custom MD3 `BoxShadow` helpers (`md3Level1`, `md3Level2`) from `DesignSystem.md`.
- [lib/core/theme/theme_controller.dart](../lib/core/theme/theme_controller.dart): `ChangeNotifier` managing `seedColor`, `isDarkMode`, `ThemeMode`, persistence via `PreferencesService`, and dynamic updates (replaces `themeService.ts` + `MutationObserver` in `App.tsx`).

### `lib/core/utils/`
- [lib/core/utils/image_utils.dart](../lib/core/utils/image_utils.dart): Image helpers for saving picked photos into app documents directory, reading bytes/base64 (`data:image/jpeg;base64,...` stripping header for Gemini/OpenAI APIs), and loading `File` or asset/network images safely.
- [lib/core/utils/json_utils.dart](../lib/core/utils/json_utils.dart): Implement `extractJson(String text)` regex extraction (`\{[\s\S]*\}`) and safe JSON decoding (port of `extractJSON` in `llmService.ts` and JSON parsing in `Recommend.tsx` / `RecreateOutfit.tsx`).
- [lib/core/utils/snackbar_utils.dart](../lib/core/utils/snackbar_utils.dart): Floating `SnackBar` helpers (`showSuccess`, `showError`, `showInfo` with 2-second default for exit prompt) replacing `react-hot-toast`.

---

## 3. Data Layer (`lib/data/`)

### `lib/data/local/`
- [lib/data/local/app_database.dart](../lib/data/local/app_database.dart): SQLite database setup via `sqflite` (`wardrobe.db`, replacing Dexie `WardrobeDB`). Define tables:
  - `items`: `id INTEGER PRIMARY KEY AUTOINCREMENT`, `category TEXT`, `sub_category TEXT`, `color TEXT`, `season TEXT`, `occasion TEXT`, `image_path TEXT`, `notes TEXT`, `is_favorite INTEGER DEFAULT 0`, `created_at TEXT`.
  - `outfits`: `id INTEGER PRIMARY KEY AUTOINCREMENT`, `name TEXT`, `season TEXT`, `occasion TEXT`, `main_image_path TEXT`, `item_ids TEXT` (JSON array of item IDs, or join table `outfit_items`), `created_at TEXT`.
  - `settings`: singleton row `id = 1` with `openai_key`, `gemini_key`, `anthropic_key`, `openrouter_key`, `openrouter_model`, `nano_banana_key`, `use_online_vton INTEGER`, `selected_llm_provider TEXT`, `onboarding_complete INTEGER`, `user_age TEXT`, `user_gender TEXT`, `user_style TEXT`.
  - `base_photos` & `try_on_images`: local storage for `BasePhoto` and `TryOnImage` records (allowing offline try-on history without requiring the backend server).
- [lib/data/local/preferences_service.dart](../lib/data/local/preferences_service.dart): Wrapper over `SharedPreferences` for auth token (`token`), dark mode (`theme`), and theme seed color hex (`theme_seed`).

### `lib/data/models/`
- [lib/data/models/wardrobe_item.dart](../lib/data/models/wardrobe_item.dart): Immutable `WardrobeItem` model (`id`, `imagePath`, `category`, `subCategory`, `color`, `season`, `occasion`, `notes`, `isFavorite`, `createdAt`) with `toMap()`, `fromMap()`, `toJson()`, `fromJson()`, and `copyWith()` (combines `Item` and `LocalItem`).
- [lib/data/models/outfit.dart](../lib/data/models/outfit.dart): `Outfit` model (`id`, `name`, `season`, `occasion`, `mainImagePath`, `itemIds`, `items: List<WardrobeItem>`, `createdAt`) with serialization helpers (combines `Outfit` and `LocalOutfit`).
- [lib/data/models/app_settings.dart](../lib/data/models/app_settings.dart): `AppSettings` model (`id`, `openaiKey`, `geminiKey`, `anthropicKey`, `openrouterKey`, `openrouterModel`, `nanoBananaKey`, `useOnlineVton`, `selectedLlmProvider`, `onboardingComplete`, `userAge`, `userGender`, `userStyle`).
- [lib/data/models/base_photo.dart](../lib/data/models/base_photo.dart): `BasePhoto` model (`id`, `imagePath`, `createdAt`) matching `src/types/index.ts`.
- [lib/data/models/try_on_image.dart](../lib/data/models/try_on_image.dart): `TryOnImage` model (`id`, `imagePath`, `itemId`, `basePhotoId`, `createdAt`) matching `src/types/index.ts`.
- [lib/data/models/user_profile.dart](../lib/data/models/user_profile.dart): `UserProfile` model (`id`, `email`, `name`, plus optional onboarding `age`, `gender`, `style`) matching `User` in `src/types/index.ts` and `Onboarding.tsx`.

### `lib/data/repositories/`
- [lib/data/repositories/wardrobe_repository.dart](../lib/data/repositories/wardrobe_repository.dart): CRUD operations for `WardrobeItem` (`getItems`, `getItem`, `createItem`, `deleteItem`, `toggleFavorite`) backed by `AppDatabase` (port of `dataService.ts` item methods).
- [lib/data/repositories/outfit_repository.dart](../lib/data/repositories/outfit_repository.dart): CRUD operations for `Outfit` (`getOutfits`, `getOutfit`, `createOutfit`, `deleteOutfit`), resolving each outfit's `itemIds` into `List<WardrobeItem>` (port of `dataService.ts` outfit methods).
- [lib/data/repositories/settings_repository.dart](../lib/data/repositories/settings_repository.dart): Load/create/update singleton `AppSettings` (`id = 1`), onboarding profile persistence, and API key lookup.
- [lib/data/repositories/try_on_repository.dart](../lib/data/repositories/try_on_repository.dart): Manage saved `BasePhoto` and `TryOnImage` history locally (and optionally sync via `ApiClient` `/tryon` when online backend is configured).

### `lib/data/services/`
- [lib/data/services/api_client.dart](../lib/data/services/api_client.dart): HTTP client (`http.Client`) targeting configurable `baseUrl` (`http://localhost:8000`), injecting `Authorization: Bearer <token>` from `PreferencesService`, clearing token and routing to `/login` on HTTP `401` (port of `src/api.ts` used by `/auth/register` and `/tryon`).
- [lib/data/services/camera_service.dart](../lib/data/services/camera_service.dart): Wrap `image_picker` (`pickFromCamera`, `pickFromGallery`, `quality: 80`) and persist selected images to local app storage (replaces `@capacitor/camera`).
- [lib/data/services/llm_service.dart](../lib/data/services/llm_service.dart): Port `src/services/llmService.ts` and `RecreateOutfit.tsx` LLM calls:
  - `generateRecommendationPrompt(...)`: build JSON prompt with `task`, `occasion`, `preferences`, `wardrobe`, and strict JSON return instructions (`notes` + `items` array of numeric IDs).
  - `callLlm(...)`: support `gemini` (`gemini-2.5-flash:generateContent`), `openai` (`gpt-4o`), `anthropic` (`claude-3-5-sonnet-20240620`, `anthropic-version: 2023-06-01`), and `openrouter` (`openrouter.ai/api/v1/chat/completions`, `HTTP-Referer`, `X-Title: Hangar`, configurable `model`).
  - `analyzeClothingImage(...)`: vision call returning JSON keys `category`, `color`, `season`, `occasion`, `notes`.
  - `matchOutfitFromImage(...)`: vision call comparing inspiration photo against wardrobe catalog JSON and returning `matched_item_ids`.
- [lib/data/services/vton_service.dart](../lib/data/services/vton_service.dart): Port `src/services/vtonService.ts`:
  - `offlineTryOn(...)`: composite clothing image centered/scaled (`0.5x`, shifted slightly down) onto base photo using the `image` package.
  - `onlineTryOn(...)`: send base + item images using the configured online VTON API key (Nano Banana) with connectivity check (`ItemDetail.tsx` enforces online mode + valid API key).
- [lib/data/services/pdf_export_service.dart](../lib/data/services/pdf_export_service.dart): Port `src/services/pdfService.ts` using `pdf` and `printing` packages, matching the `#496472` header, item thumbnails (`40x50`), metadata text, `#DCDCDC` dividers, and `wardrobe_catalog_<timestamp>.pdf` export/save/share.

---

## 4. Shared Widgets (`lib/shared/widgets/`)

- [lib/shared/widgets/app_shell.dart](../lib/shared/widgets/app_shell.dart): Responsive layout shell porting `src/components/Layout.tsx` + `BackButtonHandler` in `App.tsx`:
  - `< 768px`: `BottomNavigationBar` / Material 3 `NavigationBar` with 6 items (`Dashboard`, `Wardrobe`, `Outfits`, `Try On`, `Recreate`, `Settings`).
  - `>= 768px`: `256px` persistent left sidebar / `NavigationRail` with `OpenWardrobe` brand header (`Icons.checkroom`) and bottom `Logout` action.
  - `PopScope` double-back within `2000ms` on `/dashboard` to exit; otherwise navigate back or fallback to `/dashboard`.
- [lib/shared/widgets/confirm_dialog.dart](../lib/shared/widgets/confirm_dialog.dart): Reusable Material 3 `AlertDialog` for delete confirmations (item delete, outfit delete).
- [lib/shared/widgets/empty_state.dart](../lib/shared/widgets/empty_state.dart): Centered empty-state message widget used in Wardrobe, Outfits, and Try-On History.
- [lib/shared/widgets/item_card.dart](../lib/shared/widgets/item_card.dart): `3:4` aspect-ratio wardrobe card (`rounded-2xl`, `md3Level1` shadow, color dot indicator, color & season pills, hover/tap scale transition).
- [lib/shared/widgets/loading_overlay.dart](../lib/shared/widgets/loading_overlay.dart): Loading spinner / modal overlay for AI analysis, outfit recommendation, and VTON generation.

---

## 5. Feature Modules (`lib/features/`)

### `auth`
- [lib/features/auth/screens/login_screen.dart](../lib/features/auth/screens/login_screen.dart): Centered `maxWidth: 448` card (`rounded-3xl`, `md3Level2`), title `"Welcome Back"`, subtitle `"Offline Personal Wardrobe"`, `"Enter Wardrobe"` primary button saving `'offline-token'` and navigating to `/dashboard`, plus link to `/register`.
- [lib/features/auth/screens/register_screen.dart](../lib/features/auth/screens/register_screen.dart): Centered `maxWidth: 448` registration card (`Name (Optional)`, `Email`, `Password`), error banner (`error` at 10% opacity), submits `POST /auth/register` via `ApiClient`, navigates to `/login`, link back to `/login`.

### `onboarding`
- [lib/features/onboarding/screens/onboarding_screen.dart](../lib/features/onboarding/screens/onboarding_screen.dart): 3-step onboarding flow (`Welcome to Hangar`, `AI Powered Styling`, `Create Your Profile`) with animated step dots (`w-2 -> w-6` pill indicator) and Next / Get Started action updating `SettingsRepository` (`onboardingComplete: true`, `userAge`, `userGender`, `userStyle`) and redirecting to `/dashboard`.
- [lib/features/onboarding/widgets/onboarding_step_view.dart](../lib/features/onboarding/widgets/onboarding_step_view.dart): Displays step icon (`60sp`), title (`30sp` bold), and description copy.
- [lib/features/onboarding/widgets/profile_setup_form.dart](../lib/features/onboarding/widgets/profile_setup_form.dart): Step 3 form fields for `Age` (numeric), `Gender` dropdown (`male`, `female`, `non-binary`, `other`), and `Style Preference` text input.

### `dashboard`
- [lib/features/dashboard/screens/dashboard_screen.dart](../lib/features/dashboard/screens/dashboard_screen.dart): `"Start your day"` header, 2-column responsive grid showing `Total Items` and `Saved Outfits` counts from repositories, plus quick-action cards for `Add New Item` (`/items/new`) and `Get Outfit Suggestion` (`/recommend`).
- [lib/features/dashboard/widgets/stat_card.dart](../lib/features/dashboard/widgets/stat_card.dart): Metric card (`surface`, `rounded-2xl`, count `30sp` bold, circular icon container in `primaryContainer` or `secondaryContainer`).
- [lib/features/dashboard/widgets/quick_action_card.dart](../lib/features/dashboard/widgets/quick_action_card.dart): Action tile supporting both subtle `surface` card (`Add New Item`) and highlighted `primary` CTA card (`Get Outfit Suggestion`).

### `wardrobe`
- [lib/features/wardrobe/screens/wardrobe_screen.dart](../lib/features/wardrobe/screens/wardrobe_screen.dart): `"My Wardrobe"` header, pill search input filtering by `color` or `category`, `PDF` export button (`PdfExportService`), `Add` button (`/items/new`), horizontal `CategoryFilterBar`, and responsive `ItemGrid`.
- [lib/features/wardrobe/screens/item_form_screen.dart](../lib/features/wardrobe/screens/item_form_screen.dart): Centered `maxWidth: 672` form (`rounded-3xl`): Camera & Gallery `1:1` picker buttons -> `3:4` photo preview + `"Auto-Fill with AI"` button (`LlmService.analyzeClothingImage`) -> Category, Color, Season, Occasion, Notes fields -> `"Add to Wardrobe"` pill button.
- [lib/features/wardrobe/screens/item_detail_screen.dart](../lib/features/wardrobe/screens/item_detail_screen.dart): Two-column responsive detail view: full item photo (`rounded-xl`), metadata grid (`Color`, `Season`, `Occasion`, `Notes`), `"Virtual Try-On"` button opening `TryOnBottomSheet`, Favorite toggle (`♥ Favorited` / `♡ Add to Favorites`), and Delete confirmation.
- [lib/features/wardrobe/widgets/category_filter_bar.dart](../lib/features/wardrobe/widgets/category_filter_bar.dart): Scrollable pill chips for `All`, `Tops`, `Bottoms`, `Dresses`, `Shoes`, `Accessories` (`secondary` active fill).
- [lib/features/wardrobe/widgets/item_grid.dart](../lib/features/wardrobe/widgets/item_grid.dart): Responsive grid (2 / 3 / 4 columns) rendering `ItemCard` tiles and empty state.
- [lib/features/wardrobe/widgets/try_on_bottom_sheet.dart](../lib/features/wardrobe/widgets/try_on_bottom_sheet.dart): Modal bottom sheet / dialog for uploading/selecting a base photo (`3:4` dashed container), enforcing online VTON + API key checks, running `VtonService`, showing result with `Try Another`, `Done`, and `Save` (saves to `TryOnRepository` / device storage).

### `outfits`
- [lib/features/outfits/screens/outfits_screen.dart](../lib/features/outfits/screens/outfits_screen.dart): `"My Outfits"` header with `"Get Recommendation"` (`/recommend`) and `"Create Outfit"` (`/outfits/new`) buttons, responsive grid (1 / 2 / 3 columns) of `OutfitCard` widgets.
- [lib/features/outfits/screens/outfit_form_screen.dart](../lib/features/outfits/screens/outfit_form_screen.dart): Centered `maxWidth: 896` form with `Outfit Name`, `Occasion`, `Season`, `ItemSelectorGrid`, and sticky bottom bar showing selected item count and `"Create Outfit"` submit button.
- [lib/features/outfits/screens/outfit_detail_screen.dart](../lib/features/outfits/screens/outfit_detail_screen.dart): Outfit header card with name, `Season` chip (`Icons.calendar_today_outlined`), `Occasion` chip, delete button, and 2/4-column grid of included `WardrobeItem` cards.
- [lib/features/outfits/widgets/outfit_card.dart](../lib/features/outfits/widgets/outfit_card.dart): `16:9` `2x2` photo collage preview of up to 4 items, outfit name, `occasion` & `season` chips, and `N items` footer.
- [lib/features/outfits/widgets/item_selector_grid.dart](../lib/features/outfits/widgets/item_selector_grid.dart): Multi-select `3:4` item grid (2 / 4 / 5 columns) with `2px primary` highlight border and top-right checkmark circle.

### `ai_styling`
- [lib/features/ai_styling/screens/recommend_screen.dart](../lib/features/ai_styling/screens/recommend_screen.dart): Gradient `"AI Stylist"` header, `Occasion` input, `Personal Preferences / Notes` multiline input, `"Get Recommendation"` button calling `LlmService.callLlm`, parsing `notes` + `items` IDs, rendering `RecommendationResultCard`, and `"Save Outfit"` button.
- [lib/features/ai_styling/screens/recreate_outfit_screen.dart](../lib/features/ai_styling/screens/recreate_outfit_screen.dart): `"Recreate Outfit"` screen with Camera & Gallery `16:9` picker buttons, `"Recreate with My Wardrobe"` button calling `LlmService.matchOutfitFromImage`, and 2-column grid of matching wardrobe items.
- [lib/features/ai_styling/widgets/recommendation_result_card.dart](../lib/features/ai_styling/widgets/recommendation_result_card.dart): Card showing AI styling rationale text and the 2-column grid of recommended `WardrobeItem` tiles with `"Save Outfit"` action.

### `try_on`
- [lib/features/try_on/screens/try_on_history_screen.dart](../lib/features/try_on/screens/try_on_history_screen.dart): `"Virtual Try-On History"` screen loading saved `TryOnImage` records (from `TryOnRepository` / optional `ApiClient` `/tryon`) and displaying empty state when empty.
- [lib/features/try_on/widgets/try_on_gallery_grid.dart](../lib/features/try_on/widgets/try_on_gallery_grid.dart): Responsive 2 / 4 column grid of `3:4` try-on preview cards with formatted creation date footer.

### `settings`
- [lib/features/settings/screens/settings_screen.dart](../lib/features/settings/screens/settings_screen.dart): Centered `maxWidth: 672` scrollable settings sections (`Appearance`, `Virtual Try-On`, `AI Styling`, `About Hangar` with `"Get Started / Documentation"` -> `/docs`), plus full-width `"Save Settings"` button persisting `AppSettings`.
- [lib/features/settings/screens/docs_screen.dart](../lib/features/settings/screens/docs_screen.dart): In-app help screen with back button and cards for Welcome, `1. Add Items`, `2. AI Stylist`, `3. Virtual Try-On`, `4. AI Models (OpenRouter)`, and `Need Help?`.
- [lib/features/settings/widgets/theme_color_picker.dart](../lib/features/settings/widgets/theme_color_picker.dart): Dark Mode switch + 6 preset Material You circular swatches (`#A35C4E`, `#4E6472`, `#4E725C`, `#724E64`, `#72644E`, `#006780`) + custom `+` color picker updating `ThemeController`.
- [lib/features/settings/widgets/llm_provider_section.dart](../lib/features/settings/widgets/llm_provider_section.dart): Provider dropdown (`gemini`, `openai`, `anthropic`, `openrouter`) dynamically showing the corresponding obscured API key input (and `Model ID` input for OpenRouter).
- [lib/features/settings/widgets/vton_settings_section.dart](../lib/features/settings/widgets/vton_settings_section.dart): `"Enable Online VTON (Nano Banana)"` checkbox/switch revealing the obscured `Nano Banana API Key` input when enabled.

---

## 6. Test Suite (`test/`)

- [test/widget_test.dart](../test/widget_test.dart): Smoke test verifying `HangarApp` boots without exceptions and routes unauthenticated users to `LoginScreen` (or `OnboardingScreen` when authenticated without completed onboarding).
- [test/unit/models/wardrobe_item_test.dart](../test/unit/models/wardrobe_item_test.dart): Verify `WardrobeItem` `toMap`/`fromMap`, `toJson`/`fromJson`, `isFavorite` boolean/int mapping, and `copyWith`.
- [test/unit/models/outfit_test.dart](../test/unit/models/outfit_test.dart): Verify `Outfit` serialization, `itemIds` list handling, and `copyWith`.
- [test/unit/services/llm_service_test.dart](../test/unit/services/llm_service_test.dart): Mock `http.Client` to test `generateRecommendationPrompt`, `callLlm` across all 4 providers + error paths, `analyzeClothingImage`, `matchOutfitFromImage`, and `extractJson`.
- [test/unit/services/vton_service_test.dart](../test/unit/services/vton_service_test.dart): Verify `offlineTryOn` image compositing dimensions/output and `onlineTryOn` error handling when offline or missing API key.
- [test/unit/services/pdf_export_service_test.dart](../test/unit/services/pdf_export_service_test.dart): Verify non-empty PDF byte generation for sample `WardrobeItem` lists (with and without images/notes).
- [test/widgets/dashboard_screen_test.dart](../test/widgets/dashboard_screen_test.dart): Verify item/outfit counters render mocked repository counts and quick-action buttons trigger expected navigation.
- [test/widgets/wardrobe_screen_test.dart](../test/widgets/wardrobe_screen_test.dart): Verify category chip filtering, search filtering by color/category, empty state, and PDF export action.
- [test/widgets/settings_screen_test.dart](../test/widgets/settings_screen_test.dart): Verify Dark Mode toggle, Material You swatch selection, provider dropdown switching, VTON toggle visibility, and Save persistence.
