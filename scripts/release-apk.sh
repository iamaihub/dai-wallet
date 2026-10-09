#!/bin/bash
# Build the Android wallet APK locally and drop it straight into the node
# landing page's binaries/ folder -- no expo.dev upload, nothing to expire.
#
# `npm run build:android` uses EAS's CLOUD build, which uploads the finished
# .apk to expo.dev. Those artifacts expire and get deleted after EAS's
# retention window, silently breaking the download link if nobody re-copies a
# fresh one in time. `--local` builds right here and never touches expo.dev,
# so there's nothing to expire -- the apk lands directly where the landing
# page serves it from.
#
# Needs the Android SDK at $ANDROID_SDK below. The shell profile's own
# ANDROID_HOME points at a path that doesn't exist; android/local.properties
# has the real one, but EAS's local build copies the project through
# .easignore (which excludes local.properties), so the real SDK path has to
# be passed as an env var explicitly or the build fails at configuration with
# "SDK location not found".

set -e

cd "$(dirname "$0")/.."

ANDROID_SDK="${ANDROID_SDK:-/home/bo/dorahacks-whatsapp/android-sdk}"
NODE_REPO="${NODE_REPO:-../node}"
OUT_APK="$NODE_REPO/landing/binaries/dai-miner-wallet.apk"

if [ ! -d "$ANDROID_SDK" ]; then
  echo "❌ Android SDK not found at $ANDROID_SDK — pass ANDROID_SDK=/path/to/sdk if it moved."
  exit 1
fi
if [ ! -d "$NODE_REPO/landing/binaries" ]; then
  echo "❌ $NODE_REPO/landing/binaries not found — set NODE_REPO=/path/to/dev/node, or run this from dev/wallet with dev/node as a sibling."
  exit 1
fi

VERSION=$(node -p "require('./app.json').expo.version")
echo "🔨 Building DAI Wallet v$VERSION locally (profile: preview, apk, no expo.dev upload)..."
echo "   This is a full native Gradle build — first run with a cold cache can take 10-20+ minutes."

# expo-doctor reliably flags this project (it has both a committed android/
# folder AND native config in app.json — a known, harmless mismatch for a
# prebuilt project) and sometimes times out reaching exp.host. Either way the
# local build run continues past a failed doctor check; this is not a sign
# the build itself is broken.
EAS_NO_VCS=1 \
ANDROID_HOME="$ANDROID_SDK" \
ANDROID_SDK_ROOT="$ANDROID_SDK" \
npx eas build --platform android --profile preview --local --non-interactive \
  --output "$OUT_APK"

echo ""
echo "✅ Built and copied to $OUT_APK"
echo ""
echo "   Landing pages link to it with a cache-busting ?v=$VERSION query"
echo "   (landing/wallet/index.html, landing/miner.html). Bump that query"
echo "   string too if this build's actual content changed, then deploy:"
echo "     cd $NODE_REPO && ./scripts/deploy-landing.sh"
