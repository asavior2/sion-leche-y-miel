#!/bin/bash

# 1. Clean previous build
echo "🧹 Cleaning previous builds..."
rm -rf www
rm -rf deploy_public

# 2. Build Ionic Web App (Production Mode) WITH Base Href
# --base-href=/app/ es CRUCIAL: Le dice a Angular que la app ya no vive en la raíz, sino en /app/
echo "🏗️ Building Ionic App..."
npm run build -- --configuration=production --base-href=/app/

# 3. Create Deployment Directory
echo "📂 Assembling Deployment Package..."
mkdir deploy_public

# 4. Copy Landing Page (Site) to Root
echo "📄 Copying Landing Page..."
cp -r site/* deploy_public/

# 5. Copy Ionic App (www) to /app subdirectory
echo "📱 Copying Web App..."
mkdir deploy_public/app
cp -r www/* deploy_public/app/

echo "✅ Build Complete!"
echo "🚀 Run 'firebase deploy' to publish."
