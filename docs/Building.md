# Building and Releasing

## Local Android Build

1.  **Build Web Assets**:
    ```bash
    npm run build
    ```

2.  **Sync with Capacitor**:
    ```bash
    npx cap sync android
    ```

3.  **Open in Android Studio**:
    ```bash
    npx cap open android
    ```
    From Android Studio, you can run the app on an emulator or connected device.

## Automated Releases (CI/CD)

The project uses GitHub Actions for continuous integration and deployment.

### Triggers
-   **Push to `main`**: Runs the build to verify integrity.
-   **Tag `v*` (e.g., `v1.0.0`)**: Triggers a Release Build.
    -   Builds the Debug APK.
    -   Creates a GitHub Release.
    -   Uploads the APK (`app-debug.apk`) to the release.

### How to Release
To publish a new version:
1.  Commit your changes.
2.  Create a tag:
    ```bash
    git tag v1.1.0
    git push origin v1.1.0
    ```
3.  Wait for the GitHub Action to complete. The text APK will be available in the "Releases" section of the repository.
