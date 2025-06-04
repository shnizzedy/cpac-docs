#!/bin/bash
DIR=${1:-./dist}

# Collect clean top-level directories, excluding specific names
mapfile -t dirs < <(
  find "${DIR}" -mindepth 1 -maxdepth 1 -type d \
  -exec basename {} \; |
  grep -vE '^\.$' |
  grep -vE '^(develop|latest|\.git|assets|pages)$'
)

# Sort version numbers
sorted_versions=()
if (( ${#dirs[@]} > 0 )); then
  mapfile -t sorted_versions < <(printf "%s\n" "${dirs[@]}" | sort -V)
fi

# Add 'latest' at the start and 'develop' at the end
sorted_versions=("latest" "${sorted_versions[@]}" "develop")

# Output to versions.json
printf "%s\n" "${sorted_versions[@]}" | jq -R . | jq -s . > "${DIR}/versions.json"
