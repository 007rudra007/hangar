# Building and Releasing

## Local Android Build

1. **Fetch Flutter Packages**:
   ```bash
   flutter pub get
   ```

2. **Build Debug APK**:
   ```bash
   flutter build apk --debug
   ```
   Output: `build/app/outputs/apk/debug/app-debug.apk`

3. **Build Release APK**:
   ```bash
   flutter build apk --release
   ```

## Automated Releases (CI/CD)

The project uses GitHub Actions for continuous integration and deployment.

### Triggers
- **Push to `flutter`**: Runs `flutter analyze`, `flutter test`, and builds the debug APK.
- **Tag `v*` (e.g., `v1.0.0`)**: Triggers a Release Build, creates a GitHub Release, and uploads `app-debug.apk`.

### How to Release
1. Commit your changes.
2. Create and push a tag:
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```
3. Download the APK from the **Releases** section of the repository.
