#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

module.exports = function (context) {
    const rootdir = context.opts.projectRoot;
    const androidManifestPath = path.join(
        rootdir,
        'platforms/android/app/src/main/AndroidManifest.xml'
    );

    if (fs.existsSync(androidManifestPath)) {
        let manifestContent = fs.readFileSync(androidManifestPath).toString();

        // Permissions to remove
        const permissionsToRemove = [
            'android.permission.USE_CREDENTIALS',
            'android.permission.GET_ACCOUNTS'
        ];

        let hasChanges = false;

        permissionsToRemove.forEach((perm) => {
            const regex = new RegExp(
                `<uses-permission[^>]*android:name="${perm}"[^>]*/>`,
                'g'
            );
            if (regex.test(manifestContent)) {
                console.log(`[Hook] Removing deprecated permission: ${perm}`);
                manifestContent = manifestContent.replace(regex, '');
                hasChanges = true;
            }
        });

        if (hasChanges) {
            fs.writeFileSync(androidManifestPath, manifestContent);
            console.log('[Hook] AndroidManifest.xml cleaned successfully.');
        } else {
            console.log('[Hook] No deprecated permissions found to remove.');
        }
    } else {
        console.warn(
            `[Hook] AndroidManifest.xml not found at ${androidManifestPath}`
        );
    }
};
