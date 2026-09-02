#!/bin/bash
# One-click push script for Gaucho

echo "🚀 Pushing to main..."
git add -A
git commit -m "$(date '+%Y-%m-%d %H:%M:%S') - App update"
git push origin main

if [ $? -eq 0 ]; then
  echo "✅ Successfully pushed to main!"
else
  echo "❌ Push failed"
  exit 1
fi
