# AgocCare Flutter App — Setup Guide

## Prerequisites

### 1. Install Flutter SDK
Download from: https://docs.flutter.dev/get-started/install/windows

```powershell
# After downloading, extract to C:\flutter then add to PATH:
$env:PATH += ";C:\flutter\bin"
# Or add permanently via System Environment Variables
```

### 2. Verify installation
```powershell
flutter doctor
```

### 3. Install Android Studio + Android SDK
- Download from: https://developer.android.com/studio
- Install Android SDK via SDK Manager (API level 33+)
- Accept licenses: `flutter doctor --android-licenses`

---

## Project Setup

### 1. Install dependencies
```powershell
cd d:\AgocCare\mobile
flutter pub get
```

### 2. Environment (already configured for production)
The `.env` file points to the live backend:
```
API_BASE_URL=https://api.agoccarepvtltd.com/api
IMAGE_BASE_URL=https://api.agoccarepvtltd.com
```

### 3. Add fonts (optional — Google Fonts fallback works without these)
Place these font files in `assets/fonts/`:
- `Figtree-Regular.ttf`
- `Figtree-Medium.ttf`
- `Figtree-SemiBold.ttf`
- `Figtree-Bold.ttf`

Download from: https://fonts.google.com/specimen/Figtree

Or simply remove the `fonts:` section from `pubspec.yaml` — `google_fonts` package
will download Figtree at runtime automatically.

---

## Running the App

### On Android Emulator
```powershell
flutter emulators --launch <emulator_id>
flutter run
```

### On Physical Android Device
1. Enable Developer Options → USB Debugging on your phone
2. Connect via USB
3. `flutter run`

### Build release APK
```powershell
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### Build App Bundle (for Play Store)
```powershell
flutter build appbundle --release
```

---

## Architecture Overview

```
lib/
├── main.dart              # App entry, GoRouter config
├── core/
│   ├── theme.dart         # Colors, typography, component themes
│   ├── constants.dart     # Route names, app constants
│   ├── api_client.dart    # Dio HTTP client with JWT interceptor
│   └── helpers.dart       # Price formatting, image URLs, dates
├── models/                # Data models (fromJson/toJson)
├── services/
│   └── api_service.dart   # All API endpoint methods
├── providers/             # Riverpod state (auth, cart, products, orders)
├── screens/
│   ├── auth/              # Splash, Onboarding, Login, Register
│   └── user/              # Home, Products, Detail, Cart, Checkout,
│                          # Orders, Prescription, Profile, About
└── widgets/               # ProductCard, BottomNav, Shimmer
```

## Key Features
- OTP-based login (matches web app)
- Cart persisted to SharedPreferences
- Razorpay payment integration
- AI prescription scanner (Gemini)
- GoRouter navigation
- Riverpod state management
- Navy/Cyan/Olive theme matching web app exactly

## Backend Connection
Ensure the backend is running:
```powershell
cd d:\AgocCare\backend
node server.js
```
