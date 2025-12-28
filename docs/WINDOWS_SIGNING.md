# Preventing Windows Defender Flags

Windows Defender and SmartScreen flag applications that are:
1.  **Unsigned**: The application has no digital signature to verify its author.
2.  **Unknown Reputation**: The application hasn't been seen by Microsoft's servers enough times to be trusted.

## Step 1: Obtain a Code Signing Certificate

To fix this properly, you must purchase a **Code Signing Certificate**. You cannot generate one for free that is trusted globally.

### Options:
1.  **Standard Code Signing Certificate (~$60-$100/year)**
    *   Removes the "Unknown Publisher" warning.
    *   **However**, you will still likely see the "Windows SmartScreen prevented an unrecognized app from starting" blue popup until your app gains "reputation" (enough downloads/installs).
2.  **EV (Extended Validation) Certificate (~$300+/year)**
    *   Requires a hardware token (USB) or cloud-signing setup.
    *   **Instantly builds reputation**. No SmartScreen warnings.
    *   Requires strict business verification.

### Providers:
*   Sectigo
*   DigiCert
*   Certum (often cheaper for open source/individuals)

## Step 2: Configure Electron Builder

Once you have your certificate file (usually `.pfx` or `.p12`), you need to tell `electron-builder` to use it.

### Using Environment Variables (Recommended)
This keeps secrets out of your source code.

Set these in your CI/CD or local terminal before building:
```bash
export CSC_LINK="/path/to/certificate.pfx"
export CSC_KEY_PASSWORD="your-certificate-password"
```

### Or via `package.json` (Not recommended for public repos)
```json
"win": {
  "certificateFile": "./certs/cert.pfx",
  "certificatePassword": "password"
}
```

## Step 3: Switch to Installer (NSIS)
Portable executables (`.exe` that runs directly) are scrutinized more heavily than Installers. We have updated your configuration to use `nsis` (Standard Windows Installer) which helps establish a proper install location in `Program Files`.

## Step 4: Submit for Malware Analysis (Free)
If you cannot afford a certificate, or if you have one but are still getting flagged:
1.  Go to [Microsoft Security Intelligence - Submit a file](https://www.microsoft.com/en-us/wdsi/filesubmission)
2.  Select "Software developer".
3.  Upload your `.exe`.
4.  If clean, Microsoft will clear the specific version of your file from their definitions. *Note: You have to do this for every new version.*

## Notes for Certification Submission

When submitting the application for certification (e.g., Microsoft Store, Windows App Certification Kit, or Malware Analysis), you may be asked to provide "Notes for certification". Use the following template based on the current game configuration:

**Notes for Testers:**
*   **Dependencies**: This application is a standalone Electron-based game. It does not require any non-Microsoft drivers, NT services, or external hardware dependencies.
*   **Test Accounts**: No user accounts or login credentials are required. The game is fully accessible immediately upon launch.
*   **Hidden Features**: There are no hidden, conditional, or locked features that require special steps to access for testing purposes.
*   **Background Audio**: The application is designed to be a foreground experience. It does not utilize background audio playback when minimized.
*   **External Dependencies**: This application does not depend on other installed products or software.

## Summary
*   **Best Fix**: Buy an EV Certificate.
*   **Good Fix**: Buy a Standard Certificate + Wait for reputation.
*   **Free Fix**: Submit every build to Microsoft manually.
*   **User Workaround**: Tell users to click "More Info" -> "Run Anyway".
