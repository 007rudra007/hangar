# Hangar Flutter Design System

This document translates every visual design element from the original React + Tailwind + Material Color Utilities implementation on `main` (`src/index.css`, `tailwind.config.js`, `src/services/themeService.ts`, `src/components/Layout.tsx`, `src/pages/*.tsx`, `src/services/pdfService.ts`, and `android/app/src/main/res/`) into **Flutter Material 3** equivalents.

Machine-readable tokens are also stored in [assets/design/design_tokens.json](../assets/design/design_tokens.json) and bundled via `pubspec.yaml`.

---

## 1. Material You Dynamic Color & Seed Swatches

In the original app (`src/services/themeService.ts`), Hangar uses `@material/material-color-utilities` (`themeFromSourceColor`) with a default **Redwood** seed color and 5 preset swatches in `Settings.tsx` plus a custom color picker.

### Flutter Equivalent
- Use `ThemeData(useMaterial3: true, colorScheme: ColorScheme.fromSeed(seedColor: ..., brightness: ...))` paired with `dynamic_color` (`DynamicColorBuilder`) for optional Android system wallpaper theming fallback/override.
- Persist the selected seed color hex (`theme_seed`) and dark mode boolean (`theme`) in `shared_preferences` (`preferences_service.dart`).

### Preset Seed Colors (`Settings.tsx` -> `theme_color_picker.dart`)
| Preset Name | Original Hex | Flutter `Color` Value |
| --- | --- | --- |
| Redwood (Default) | `#A35C4E` | `0xFFA35C4E` |
| Slate Blue | `#4E6472` | `0xFF4E6472` |
| Sage Green | `#4E725C` | `0xFF4E725C` |
| Plum | `#724E64` | `0xFF724E64` |
| Sandstone | `#72644E` | `0xFF72644E` |
| Ocean Teal | `#006780` | `0xFF006780` |

Custom picker (`<input type="color">`): renders as a circular `40x40` button (`surfaceContainerHighest` background, `2px` `outline` border at 20% opacity, centered `+` label) that opens a color selector dialog and updates `ThemeController`.

---

## 2. Light & Dark Fallback Color Schemes

When dynamic seed generation is initialized or before a custom seed overrides tokens, `src/index.css` and `tailwind.config.js` define the exact Warm Redwood light/dark palette (note: `src/index.css` provides both reference hexes in comments and rounded CSS HSL values):

### Light Mode (`Brightness.light`)
| CSS Variable / Tailwind Token | CSS HSL / Value | Exact Flutter ARGB (`Color(...)`) | Comment Reference Hex | Flutter `ColorScheme` / `ThemeData` Slot |
| --- | --- | --- | --- | --- |
| `--p` (`primary`) | `15 50% 40%` | `0xFF994C33` | `#A35C4E` | `colorScheme.primary` |
| `--op` (`on-primary`) | `0 0% 100%` | `0xFFFFFFFF` | `#FFFFFF` | `colorScheme.onPrimary` |
| `--pc` (`primary-container`) | `15 65% 90%` | `0xFFF6DDD5` | `#F5E3E0` | `colorScheme.primaryContainer` |
| `--opc` (`on-primary-container`) | `15 40% 20%` | `0xFF47291F` | — | `colorScheme.onPrimaryContainer` |
| `--bg` (`background`) | `0 0% 98%` | `0xFFFAFAFA` | `#FAFAFA` | `scaffoldBackgroundColor` |
| `--obg` (`on-background`) | `0 0% 11%` | `0xFF1C1C1C` | `#1C1C1C` | `textTheme.body*.color` |
| `--s` (`surface`) | `0 0% 100%` | `0xFFFFFFFF` | `#FFFFFF` | `colorScheme.surface` |
| `--os` (`on-surface`) | `0 0% 11%` | `0xFF1C1C1C` | `#1C1C1C` | `colorScheme.onSurface` |
| `--sv` (`surface-variant`) | `0 0% 96%` | `0xFFF5F5F5` | — | `colorScheme.surfaceContainerHighest` |
| `--osv` (`on-surface-variant`) | `0 0% 40%` | `0xFF666666` | — | `colorScheme.onSurfaceVariant` |
| `--sec` (`secondary`) | `35 100% 45%` | `0xFFE68600` | `#E6A300` | `colorScheme.secondary` |
| `--on-sec` (`on-secondary`) | `0 0% 100%` | `0xFFFFFFFF` | — | `colorScheme.onSecondary` |
| `--sec-c` (`secondary-container`) | `35 100% 90%` | `0xFFFFEACC` | — | `colorScheme.secondaryContainer` |
| `--on-sec-c` (`on-secondary-container`) | `35 100% 20%` | `0xFF663C00` | — | `colorScheme.onSecondaryContainer` |
| `outline` | `#79747E` | `0xFF79747E` | `#79747E` | `colorScheme.outline` |
| `error` | `#B3261E` | `0xFFB3261E` | `#B3261E` | `colorScheme.error` |
| `on-error` | `#FFFFFF` | `0xFFFFFFFF` | `#FFFFFF` | `colorScheme.onError` |

### Dark Mode (`Brightness.dark`)
| CSS Variable / Tailwind Token | CSS HSL / Value | Exact Flutter ARGB (`Color(...)`) | Comment Reference Hex | Flutter `ColorScheme` / `ThemeData` Slot |
| --- | --- | --- | --- | --- |
| `--p` (`primary`) | `15 50% 75%` | `0xFFDFAF9F` | `#D6A59A` | `colorScheme.primary` |
| `--op` (`on-primary`) | `0 0% 12%` | `0xFF1F1F1F` | `#1F1F1F` | `colorScheme.onPrimary` |
| `--pc` (`primary-container`) | `15 40% 20%` | `0xFF47291F` | `#452D28` | `colorScheme.primaryContainer` |
| `--opc` (`on-primary-container`) | `15 65% 90%` | `0xFFF6DDD5` | `#F5E3E0` | `colorScheme.onPrimaryContainer` |
| `--bg` (`background`) | `0 0% 12%` | `0xFF1F1F1F` | `#1F1F1F` | `scaffoldBackgroundColor` |
| `--obg` (`on-background`) | `0 0% 89%` | `0xFFE3E3E3` | `#E4E4E4` | `textTheme.body*.color` |
| `--s` (`surface`) | `0 0% 16%` | `0xFF292929` | `#282828` | `colorScheme.surface` |
| `--os` (`on-surface`) | `0 0% 89%` | `0xFFE3E3E3` | `#E4E4E4` | `colorScheme.onSurface` |
| `--sv` (`surface-variant`) | `0 0% 20%` | `0xFF333333` | — | `colorScheme.surfaceContainerHighest` |
| `--osv` (`on-surface-variant`) | `0 0% 80%` | `0xFFCCCCCC` | — | `colorScheme.onSurfaceVariant` |
| `--sec` (`secondary`) | `35 100% 45%` | `0xFFE68600` | `#E6A300` | `colorScheme.secondary` |
| `--on-sec` (`on-secondary`) | `0 0% 12%` | `0xFF1F1F1F` | — | `colorScheme.onSecondary` |
| `--sec-c` (`secondary-container`) | `35 100% 20%` | `0xFF663C00` | — | `colorScheme.secondaryContainer` |
| `--on-sec-c` (`on-secondary-container`) | `35 100% 90%` | `0xFFFFEACC` | — | `colorScheme.onSecondaryContainer` |
| `outline` | `#79747E` | `0xFF79747E` | `#79747E` | `colorScheme.outline` |
| `error` | `#B3261E` | `0xFFB3261E` | `#B3261E` | `colorScheme.error` |
| `on-error` | `#FFFFFF` | `0xFFFFFFFF` | `#FFFFFF` | `colorScheme.onError` |

> **Subtle Border Rule:** Almost all cards use `border-outline/10` -> `BorderSide(color: colorScheme.outline.withValues(alpha: 0.10), width: 1)`.

---

## 3. Typography (`Roboto`)

`tailwind.config.js` configures `fontFamily.sans = ['Roboto', 'sans-serif']`, which is Flutter's native Android default font (`fontFamily: 'Roboto'`).

| Original Tailwind Class | Size (`sp`) | Weight | Usage Across Screens | Flutter `TextTheme` Slot |
| --- | --- | --- | --- | --- |
| `text-3xl font-bold` | `30.0` | `w700` | Page headers (`My Wardrobe`, `Settings`, `AI Stylist`, `Recreate Outfit`, `Docs`, `Login`, `Onboarding`), stat values | `headlineLarge` |
| `text-2xl font-bold` | `24.0` | `w700` | `Start your day`, `My Outfits`, `Register`, `Virtual Try-On History` | `headlineMedium` |
| `text-xl font-bold` | `20.0` | `w700` | Section titles (`Appearance`, `Virtual Try-On`, `AI Styling`, `OpenWardrobe`, `Suggestion`) | `titleLarge` |
| `text-lg font-semibold` / `font-bold` | `18.0` | `w600` / `w700` | Item/Outfit card titles, primary CTA labels, onboarding body copy | `titleMedium` |
| `text-base` | `16.0` | `w400` | Body prose, desktop nav labels | `bodyLarge` |
| `text-sm font-medium` | `14.0` | `w500` | Form labels, filter chips, nav labels, subtitles | `bodyMedium` |
| `text-xs font-medium` | `12.0` | `w500` | Metadata badges (`color`, `season`, `occasion`), timestamps | `labelMedium` |
| `text-[10px]` | `10.0` | `w500` | Mobile bottom navigation bar labels | `labelSmall` |

Special text treatment in `Recommend.tsx`:
- Title `"AI Stylist"` uses a linear gradient shader (`primary` -> `secondary`) -> in Flutter, `ShaderMask` with `LinearGradient(colors: [colorScheme.primary, colorScheme.secondary])`.

---

## 4. Shapes, Radii & MD3 Shadows

> **Important Tailwind Override in `tailwind.config.js`:** `theme.extend.borderRadius['xl']` was overridden to **`28px`**! Keep that distinction when converting `rounded-xl` vs `rounded-2xl` vs `rounded-3xl`:

| Original Class | Radius (`dp`) | Flutter Equivalent | Where Used |
| --- | --- | --- | --- |
| `rounded-md` | `6.0` | `BorderRadius.circular(6)` | Item tag badges (`color`, `season`) |
| `rounded-lg` | `8.0` | `BorderRadius.circular(8)` | Nav links, action icon boxes, error banners, `OutfitForm` inputs |
| `rounded-2xl` | `16.0` | `BorderRadius.circular(16)` | Stat cards, Wardrobe cards, Dashboard containers, Docs cards |
| `rounded-3xl` | `24.0` | `BorderRadius.circular(24)` | Settings sections, ItemForm card, Auth/Onboarding cards, Recreate card |
| `rounded-xl` (custom) | `28.0` | `BorderRadius.circular(28)` | Outfit cards, primary buttons, form inputs, modals |
| `rounded-full` | `999.0` | `CircleBorder()` / `StadiumBorder()` | Search pill, category filter chips, color swatches, FAB/submit pill, stat icon circles |

### Elevation Shadows (`tailwind.config.js`)
- **`md3-1`** (`0px 1px 3px 1px rgba(0,0,0,0.15), 0px 1px 2px 0px rgba(0,0,0,0.30)`):
  Two `BoxShadow` entries in `BoxDecoration`:
  1. `BoxShadow(color: Color(0x26000000), offset: Offset(0, 1), blurRadius: 3, spreadRadius: 1)`
  2. `BoxShadow(color: Color(0x4D000000), offset: Offset(0, 1), blurRadius: 2, spreadRadius: 0)`
- **`md3-2`** (`0px 2px 6px 2px rgba(0,0,0,0.15), 0px 1px 2px 0px rgba(0,0,0,0.30)`):
  Two `BoxShadow` entries in `BoxDecoration`:
  1. `BoxShadow(color: Color(0x26000000), offset: Offset(0, 2), blurRadius: 6, spreadRadius: 2)`
  2. `BoxShadow(color: Color(0x4D000000), offset: Offset(0, 1), blurRadius: 2, spreadRadius: 0)`

---

## 5. Motion, Transitions & Feedback

| Original CSS / React Behavior | Flutter Equivalent |
| --- | --- |
| Theme color transitions (`duration-300`) | `AnimatedTheme(duration: Duration(milliseconds: 300), ...)` |
| `.animate-fade-in` (`400ms ease-out`, `translateY(10px -> 0)`, `opacity(0 -> 1)`) | `TweenAnimationBuilder` / `FadeTransition` + `SlideTransition` (`400ms`, `Curves.easeOut`) |
| Card image hover zoom (`scale-105 duration-500`) | `AnimatedScale` (`1.0` -> `1.05`, `500ms`) on hover/press (`InkWell` / `MouseRegion`) |
| `react-hot-toast` (`Toaster` / `toast.success` / `toast.error` / `duration: 2000`) | `ScaffoldMessenger.of(context).showSnackBar(...)` floating `SnackBar` (`SnackBarBehavior.floating`, `2000ms` duration for back-button exit prompt) |
| `no-scrollbar` | `ScrollConfiguration` with `ScrollBehavior` hiding scrollbars on horizontal category chip bar |
| `BackButtonHandler` (double-tap back within `2000ms` on `/dashboard` or `/login` to exit; otherwise navigate back or fallback to `/dashboard`) | `PopScope` in `AppShell` + `LoginScreen` tracking `DateTime` of last back press |

---

## 6. Iconography Mapping (`react-icons` -> Flutter `Icons`)

| Original Icon / Emoji | Usage | Flutter `IconData` |
| --- | --- | --- |
| `MdDashboard` | Bottom/Side Nav — Dashboard | `Icons.dashboard_outlined` / `Icons.dashboard` |
| `MdCheckroom` | Bottom/Side Nav — Wardrobe & Brand logo | `Icons.checkroom` |
| `MdStyle` | Bottom/Side Nav — Outfits | `Icons.style_outlined` / `Icons.style` |
| `MdCameraAlt` | Bottom/Side Nav — Try On | `Icons.camera_alt_outlined` / `Icons.camera_alt` |
| `MdAutoFixHigh` | Bottom/Side Nav — Recreate | `Icons.auto_fix_high` |
| `MdSettings` | Bottom/Side Nav — Settings | `Icons.settings_outlined` / `Icons.settings` |
| `MdLogout` | Desktop Sidebar — Logout | `Icons.logout` |
| `GiClothes` | Dashboard Total Items stat icon | `Icons.dry_cleaning` or `Icons.checkroom` |
| `AiOutlineSkin` | Dashboard Saved Outfits, ItemDetail Try-On, Onboarding, Docs | `Icons.checkroom_outlined` |
| `AiOutlinePlus` | Add Item / Create Outfit / Upload Base Photo | `Icons.add` |
| `AiOutlineSearch` | Wardrobe search bar prefix | `Icons.search` |
| `AiOutlineCloudDownload` | Wardrobe Export PDF button | `Icons.cloud_download_outlined` |
| `AiOutlineCamera` | Take Photo button | `Icons.camera_alt_outlined` |
| `AiOutlineCloudUpload` | Pick from Gallery button | `Icons.cloud_upload_outlined` |
| `AiOutlineReload` | AI analyzing spinner | `CircularProgressIndicator` / `Icons.refresh` |
| `AiOutlineDelete` | Delete Item / Delete Outfit | `Icons.delete_outline` |
| `AiOutlineCalendar` | Outfit season chip | `Icons.calendar_today_outlined` |
| `AiOutlineArrowLeft` | Docs back button | `Icons.arrow_back` |
| `AiOutlineArrowRight` | Onboarding Next button | `Icons.arrow_forward` |
| `AiOutlineCheck` | Onboarding Get Started / Selected item badge | `Icons.check` |
| `AiOutlineRocket` | Onboarding AI Styling / Docs AI Stylist | `Icons.rocket_launch_outlined` |
| `♥` / `♡` | Favorite toggle in ItemDetail | `Icons.favorite` / `Icons.favorite_border` |
| `✨` | AI Recommendation & Auto-fill CTA | `Icons.auto_awesome` |
| `📖` / `👤` / `🤖` | Settings Docs button / Onboarding / Docs AI Models | `Icons.menu_book_outlined` / `Icons.person_outline` / `Icons.smart_toy_outlined` |

---

## 7. Responsive Navigation Shell & Screen Blueprints

### `AppShell` (`src/components/Layout.tsx` -> `lib/shared/widgets/app_shell.dart`)
- **Mobile (`width < 768px`)**: `Scaffold` with bottom `NavigationBar` (`surface` background, `secondaryContainer` indicator pill, `onSecondaryContainer` active icon/label, `onSurfaceVariant` inactive, `10sp` labels) and `96px` bottom content clearance (`pb-24`).
- **Tablet / Desktop (`width >= 768px`)**: Persistent `256px` left `NavigationRail` / sidebar (`surface` background, `1px` right border `outline` at 10%, top `OpenWardrobe` brand header with `Icons.checkroom` in `primary`, bottom `Logout` button in `error`), and scrollable main body centered inside `ConstrainedBox(maxWidth: 1024)` (`max-w-5xl`) with `32px` padding.
- **6 Primary Nav Destinations**:
  1. `Dashboard` (`/dashboard`)
  2. `Wardrobe` (`/wardrobe`)
  3. `Outfits` (`/outfits`)
  4. `Try On` (`/tryon-history`)
  5. `Recreate` (`/recreate`)
  6. `Settings` (`/settings`)

### Key Card Aspect Ratios & Grid Column Counts
- **Wardrobe Grid (`Wardrobe.tsx`)**: `GridView` with `2` columns (`< 768px`), `3` columns (`768px–1023px`), `4` columns (`>= 1024px`), `16px` spacing. Card image uses **`3:4` aspect ratio (`0.75`)**, category title + circular color dot (`12x12`), and two pills (`color` in `secondaryContainer`, `season` in `tertiaryContainer`).
- **Outfits Grid (`Outfits.tsx`)**: `1` / `2` / `3` columns (`24px` spacing). Card preview uses **`16:9` aspect ratio (`1.7778`)** containing a `2x2` collage of up to 4 item photos (`BoxFit.cover`).
- **Outfit Item Selector (`OutfitForm.tsx`)**: `2` / `4` / `5` columns (`3:4` aspect ratio), selected border `2px primary` + checkmark circle badge top-right, sticky bottom bar with `N items selected` and `Create Outfit` button.
- **Item Form (`ItemForm.tsx`)**: Centered `maxWidth: 672` card (`rounded-3xl`), `1:1` Camera (`primaryContainer`) and Gallery (`secondaryContainer`) tiles, switching to `3:4` preview + `Auto-Fill with AI` button (`tertiaryContainer`), 2-column metadata grid, full-width pill submit (`rounded-full`).
- **Virtual Try-On Modal (`ItemDetail.tsx`)**: Modal bottom sheet / dialog (`maxWidth: 672`), `3:4` dashed upload placeholder (`1/2` width) -> `Generate Preview` button -> result preview with `Try Another`, `Done`, and `Save` actions.
- **Try-On History (`TryOnHistory.tsx`)**: `2` / `4` columns (`24px` gap), `3:4` image cards with formatted date footer.

---

## 8. PDF Catalog Styling (`src/services/pdfService.ts`)

When building `lib/data/services/pdf_export_service.dart` with the `pdf` package, match the exact styling from `pdfService.ts`:
- Header title `"My Wardrobe Catalog"`: `22pt`, Slate Blue `PdfColor.fromInt(0xFF496472)`.
- Date subtitle `"Generated on: <date>"`: `10pt`, `PdfColor.fromInt(0xFF646464)`.
- Item rows (`height: 60`):
  - Left thumbnail (`40x50`) or bordered `"No Image"` box if missing.
  - Category heading (`uppercase`, `14pt`, black), followed by `Color`, `Season`, `Occasion`, and wrapped `Notes` (`11pt`, `#3C3C3C`).
  - Bottom horizontal divider line in `#DCDCDC` (`PdfColor.fromInt(0xFFDCDCDC)`).
- Output filename: `wardrobe_catalog_<timestamp>.pdf` saved via `path_provider` / shared via `printing`.

---

## 9. Native Android Design Assets (`android/app/src/main/res/`)

All visual brand assets from `main` are preserved and wired into Flutter Android embedding v2:
- **App Icon**: [assets/icon.png](../assets/icon.png) + `mipmap-ldpi` through `mipmap-xxxhdpi` (`ic_launcher`, `ic_launcher_round`, `ic_launcher_foreground`, `ic_launcher_background`), `mipmap-anydpi-v26`, `mipmap-anydpi-v33`, and `drawable/ic_launcher_monochrome.xml`.
- **Splash Screen**: `drawable/splash.png`, `drawable-night/splash.png`, and density-specific `drawable-port-*` / `drawable-land-*` splash PNGs wired via `launch_background.xml` (light `#FAFAFA` in `values/colors.xml`, dark `#1F1F1F` in `values-night/colors.xml`).
