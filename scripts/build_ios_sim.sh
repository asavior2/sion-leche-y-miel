#!/bin/bash
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

echo "========================================="
echo "   Build Script for iPhone 15 Simulator  "
echo "========================================="

# 1. Build Web Assets
echo "Step 1: Building Ionic Web App..."
ionic build --prod --release

# 2. Build Native Project
echo "Step 2: Building iOS Native Project (Target: iPhone 15)..."
# Using npx to ensure we use local cordova if available, or global
npx cordova build ios --release --target="21813437-AB41-4A2C-BCC1-B3E523F85ADB"
