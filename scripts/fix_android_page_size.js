#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

module.exports = function (context) {
    console.log('[Hook] Starting 16KB page size fix...');

    const rootdir = context.opts.projectRoot;
    const androidPlatformDir = path.join(rootdir, 'platforms/android');
    const appBuildExtrasPath = path.join(androidPlatformDir, 'app/build-extras.gradle');
    const gradlePropertiesPath = path.join(androidPlatformDir, 'gradle.properties');

    // 1. Ensure build-extras.gradle enforces legacy packaging for jniLibs
    // This compresses native libs, extracting them on install, avoiding 16KB alignment requirement.
    if (fs.existsSync(androidPlatformDir)) {
        const legacyPackagingBlock = `
// -------------------------------------------------------------------------
// FIX: 16 KB Page Size Compatibility (Play Console)
// Enforce legacy packaging to compress native libraries, bypassing
// the alignment check for uncompressed libs on AGP 8.7+
// -------------------------------------------------------------------------
android {
    packagingOptions {
        jniLibs {
            useLegacyPackaging true
        }
    }
}
`;

        // Append if not already present
        if (fs.existsSync(appBuildExtrasPath)) {
            let content = fs.readFileSync(appBuildExtrasPath, 'utf8');
            if (!content.includes('useLegacyPackaging')) {
                fs.appendFileSync(appBuildExtrasPath, legacyPackagingBlock);
                console.log('[Hook] Added useLegacyPackaging to app/build-extras.gradle');
            } else {
                console.log('[Hook] app/build-extras.gradle already has useLegacyPackaging.');
            }
        } else {
            fs.writeFileSync(appBuildExtrasPath, legacyPackagingBlock);
            console.log('[Hook] Created app/build-extras.gradle with useLegacyPackaging.');
        }

        // 2. (Removed) Gradle Properties flags are deprecated/removed in AGP 8.1+
        // Relying solely on useLegacyPackaging (above) which is the correct native lib packaging API.

    } else {
        console.warn('[Hook] Android platform directory not found. Skipping fix.');
    }
};
