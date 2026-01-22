#!/bin/bash

# Automated Frontend Deployment Script for GitHub Pages
# This script builds and deploys the Akolite frontend to GitHub Pages with HTTPS

set -e

echo "=========================================="
echo "Akolite Frontend Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if in frontend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found!${NC}"
    echo "Please run this script from the frontend directory"
    exit 1
fi

echo -e "${YELLOW}Step 1: Checking Git Status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
    echo "Commit or stash changes before deploying"
    echo ""
    git status
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${YELLOW}Step 2: Installing Dependencies...${NC}"
npm install

echo ""
echo -e "${YELLOW}Step 3: Building Production Bundle...${NC}"
npm run build

echo ""
echo -e "${YELLOW}Step 4: Deploying to GitHub Pages...${NC}"
npm run deploy

echo ""
echo -e "${GREEN}=========================================="
echo "Deployment Complete!"
echo "=========================================${NC}"
echo ""
echo "Frontend URL: https://akoliteresin.github.io/akoliteFrontEnd"
echo "Backend URL: https://dj4haaiis0la7.cloudfront.net"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Visit https://akoliteresin.github.io/akoliteFrontEnd"
echo "2. Test login and API calls"
echo "3. Check browser console (F12) for any errors"
echo "4. Verify CORS and API connectivity"
echo ""
