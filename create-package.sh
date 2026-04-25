#!/bin/bash

###############################################################################
# Sky Icon Travel & Tourism System - Package Creator
# إنشاء حزمة النشر الكاملة
# Version: 5.3.5
###############################################################################

PACKAGE_NAME="skyicon-deployment-v5.3.5"
OUTPUT_DIR="./deployment-package"
ARCHIVE_NAME="${PACKAGE_NAME}.zip"

echo "=========================================="
echo "  Sky Icon Deployment Package Creator"
echo "  Version 5.3.5"
echo "=========================================="
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "📦 Creating deployment package..."
echo ""

# List of essential files
ESSENTIAL_FILES=(
    "index.html"
    "README.md"
    "nginx.conf"
    "deploy-automated.sh"
    "DEPLOYMENT_PACKAGE_README.md"
    "QUICK_START.md"
    "DEPLOYMENT_GUIDE_skyicon.matrxe.com.md"
)

# Copy essential files
echo "Copying essential files..."
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$OUTPUT_DIR/"
        echo "  ✓ $file"
    else
        echo "  ⚠ Missing: $file"
    fi
done
echo ""

# Copy directories
echo "Copying directories..."
for dir in css js images; do
    if [ -d "$dir" ]; then
        cp -r "$dir" "$OUTPUT_DIR/"
        echo "  ✓ $dir/"
    else
        echo "  ⚠ Missing: $dir/"
    fi
done
echo ""

# Copy documentation files
echo "Copying documentation..."
DOCS=(
    "USER_MANAGEMENT_GUIDE.md"
    "MULTI_CURRENCY_GUIDE.md"
    "TROUBLESHOOTING.md"
    "VPS_DEPLOYMENT_COMPLETE_v5.3.5.md"
    "RELEASE_NOTES_v5.3.5.md"
    "LOGIN_CREDENTIALS_v5.3.5.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        cp "$doc" "$OUTPUT_DIR/"
        echo "  ✓ $doc"
    fi
done
echo ""

# Create archive
echo "📦 Creating ZIP archive..."
cd "$OUTPUT_DIR/.." || exit
zip -r "$ARCHIVE_NAME" "deployment-package" -q
echo "  ✓ Archive created: $ARCHIVE_NAME"
echo ""

# Calculate size
SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
echo "=========================================="
echo "✅ Package created successfully!"
echo "=========================================="
echo ""
echo "📦 Package: $ARCHIVE_NAME"
echo "📊 Size: $SIZE"
echo "📁 Location: $(pwd)/$ARCHIVE_NAME"
echo ""
echo "=========================================="
echo "Next Steps:"
echo "1. Upload to your server"
echo "2. Extract the archive"
echo "3. Run deploy-automated.sh"
echo "=========================================="
echo ""
