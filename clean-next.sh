#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

show_help() {
  echo -e "${GREEN}Next.js Cleanup Script${NC}"
  echo ""
  echo "Usage: ./clean-next.sh [option]"
  echo ""
  echo "Options:"
  echo "  -c, --cache-only     Clean only cache directories (default)"
  echo "  -f, --full           Full cleanup (removes entire .next directory)"
  echo "  -r, --rebuild        Full cleanup and rebuild (removes .next and runs build)"
  echo "  -h, --help           Show this help message"
  echo ""
}

clean_cache() {
  echo -e "${YELLOW}Cleaning .next cache directories...${NC}"

  # Remove the webpack cache directory
  if [ -d ".next/cache/webpack" ]; then
    echo "Removing webpack cache..."
    rm -rf .next/cache/webpack
  fi

  # Remove the SWC cache directory
  if [ -d ".next/cache/swc" ]; then
    echo "Removing SWC cache..."
    rm -rf .next/cache/swc
  fi

  # Recreate cache structure
  mkdir -p .next/cache/webpack
  mkdir -p .next/cache/swc

  echo -e "${GREEN}Cache directories cleaned successfully.${NC}"
}

full_cleanup() {
  echo -e "${YELLOW}Performing full cleanup of .next directory...${NC}"
  
  if [ -d ".next" ]; then
    rm -rf .next
    echo -e "${GREEN}Full cleanup completed. The .next directory has been completely removed.${NC}"
  else
    echo -e "${GREEN}No .next directory found. Nothing to clean.${NC}"
  fi
}

rebuild() {
  echo -e "${YELLOW}Rebuilding Next.js application...${NC}"
  npm run build
  echo -e "${GREEN}Rebuild completed.${NC}"
}

# Default to cache-only if no arguments provided
if [ $# -eq 0 ]; then
  clean_cache
  exit 0
fi

# Process arguments
case "$1" in
  -c|--cache-only)
    clean_cache
    ;;
  -f|--full)
    full_cleanup
    ;;
  -r|--rebuild)
    full_cleanup
    rebuild
    ;;
  -h|--help)
    show_help
    ;;
  *)
    echo -e "${RED}Error: Unknown option $1${NC}"
    show_help
    exit 1
    ;;
esac

echo -e "${GREEN}Done! Run 'npm run dev' or 'npm run build' if you need to regenerate the .next directory.${NC}" 