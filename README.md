# Portion – iOS & Android app

This project turns the Portion website into a real installable app for **iPhone/iPad and Android**, using [Capacitor](https://capacitorjs.com) (version 8).

Your website file is used **exactly as it is** (`src/index.html`), so every color, font, image, animation, screen and interaction is identical: intro animation, all 12 screens, cart, sealing ceremony, slide-to-dispatch, live tracking, cook-mode timer, weekly planner, and the saved demo state.

## What was added for the app (nothing visual changes)

| Website feature | In the app |
|---|---|
| `navigator.vibrate` tap feedback (didn't work on iPhone browsers) | Native haptics on **both** iOS and Android |
| "Stay awake" in Cook mode (`wakeLock`) | Native keep-awake plugin (works on both) |
| "Voice coach" (`speechSynthesis`, missing in Android WebView) | Native text-to-speech on both |
| Browser back | Android back button/gesture: closes an open sheet → goes back a screen → home → exits |
| Safe areas (notch, home bar) | Same insets, read reliably on all Android versions |
| Long-press on images | No "Save image" pop-up, like a native app |

Files:
- `src/index.html`: your website, **untouched**
- `src/native-bridge.js`, `src/native.css`: the additions above (they do nothing in a normal browser)
- `capacitor.config.json`: app name, ID, status bar, splash
- `resources/`: app icon and splash screen (olive + apricot bowl from your logo)
- `scripts/build.mjs`: builds `www/` and **bundles the Google Fonts into the app** so the typography works offline

## Requirements

- **Node.js 22+**
- **Android:** Android Studio (Otter 2025.2.1 or newer)
- **iOS:** a Mac with Xcode 26+ (Apple requires a Mac to build iOS apps)

## First-time setup

```bash
cd portion-app
npm install

npm run android:add      # creates the android/ project
npm run ios:add          # creates the ios/ project (on a Mac)

npm run assets           # generates all icon & splash sizes from resources/
```

## Run / build

```bash
npm run android          # build + open in Android Studio → Run ▶ or Build > Generate Signed Bundle
npm run ios              # build + open in Xcode → pick your Team in Signing, then Run ▶ or Product > Archive
```

Or straight to a connected phone/emulator: `npm run run:android` / `npm run run:ios`.

## Updating the website later

Replace `src/index.html` with your new version and run `npm run sync`. Both apps update.

## Before publishing to the stores

- Change `appId` in `capacitor.config.json` (now `com.portion.app`) to your own reverse-domain ID **before** running `android:add` / `ios:add`.
- Set the version in Android Studio (`versionCode`/`versionName`) and in Xcode (Version/Build).
- On iPad and on large tablets in landscape (width 860px or more), the app shows the website's wide-screen layout: the phone frame on the olive background with the screen index. That's how the website behaves too. If you'd rather tablets show the full-screen phone layout, that's a one-line change.
