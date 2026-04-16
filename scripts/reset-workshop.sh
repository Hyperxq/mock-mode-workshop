#!/usr/bin/env bash
#
# reset-workshop.sh
#
# Wipes every local change and puts the repo back at the public
# `main` branch — the workshop's starting state. Useful during the
# session when an attendee has gone sideways and wants a fresh
# baseline without re-cloning.
#
# Run from the repo root:
#   bash scripts/reset-workshop.sh

set -euo pipefail

BRANCH="${1:-main}"

# Colours — skip if stdout is not a terminal.
if [ -t 1 ]; then
  RED=$'\033[31m'
  GREEN=$'\033[32m'
  RESET=$'\033[0m'
else
  RED=''
  GREEN=''
  RESET=''
fi

echo "${RED}This will discard ALL local changes and reset to origin/${BRANCH}.${RESET}"
read -r -p "Continue? [y/N] " reply
if [[ ! "${reply}" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

echo "Fetching origin..."
git fetch origin "${BRANCH}"

echo "Checking out ${BRANCH}..."
git checkout "${BRANCH}"

echo "Hard-resetting to origin/${BRANCH}..."
git reset --hard "origin/${BRANCH}"

echo "Cleaning untracked files (keeping node_modules and .env.development.local)..."
git clean -fdx \
  --exclude=node_modules \
  --exclude=.env.development.local

echo "${GREEN}Done. You're back at the workshop's starting state.${RESET}"
echo "Run: npm install && npm run dev:mock"
