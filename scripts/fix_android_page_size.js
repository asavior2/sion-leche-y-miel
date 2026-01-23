#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

module.exports = function (context) {
    console.log('[Hook] Starting 16KB page size fix...');

    const rootdir = context.opts.projectRoot;
    const androidPlatformDir = path.join(rootdir, 'platforms/android');
    // DIRECT INJECTION into app/build.gradle
    // This is more robust than build-extras.gradle as it guarantees execution order.
    if (fs.existsSync(androidPlatformDir)) {
        const buildGradlePath = path.join(androidPlatformDir, 'app/build.gradle');

        if (fs.existsSync(buildGradlePath)) {
            let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');

            const packagingBlock = `
// -------------------------------------------------------------------------
// FIX: 16 KB Page Size Compatibility (Play Console)
// Enforce legacy packaging to compress native libraries.
// Injected by fix_android_page_size.js
// -------------------------------------------------------------------------
android {
    // For AGP 8+
    packaging {
        jniLibs {
            useLegacyPackaging = true
        }
    }
    // For older AGP (just in case)
    packagingOptions {
        jniLibs {
            useLegacyPackaging true
        }
    }
}
`;
            // Check if already injected to avoid duplication
            if (!buildGradleContent.includes('useLegacyPackaging = true')) {
                fs.appendFileSync(buildGradlePath, packagingBlock);
                console.log('[Hook] Injected packaging block directly into app/build.gradle');
            } else {
                console.log('[Hook] app/build.gradle already has useLegacyPackaging.');
            }
        } else {
            console.error('[Hook] app/build.gradle not found!');
        }

        // 2. (Removed) Gradle Properties flags are deprecated/removed in AGP 8.1+
        // Relying solely on useLegacyPackaging (above) which is the correct native lib packaging API.

        // 2. (Removed) Gradle Properties flags are deprecated/removed in AGP 8.1+
        // Relying solely on useLegacyPackaging (above) which is the correct native lib packaging API.

    } else {
        console.warn('[Hook] Android platform directory not found. Skipping fix.');
    }
};
