#!/bin/bash
DIR=${1:-./dist}

# Collect clean top-level directories
mapfile -t dirs < <(
  find "${DIR}" -mindepth 1 -maxdepth 1 -type d \
  -exec basename {} \; | grep -vE '^\.$' | grep -vE '^$'
)

# Collect version directories only (excluding 'develop' and 'latest')
versions=()
for dir in "${dirs[@]}"; do
  [[ -n "$dir" && "$dir" != "develop" && "$dir" != "latest" ]] && versions+=("$dir")
done

# Sort version numbers
sorted_versions=()
if (( ${#versions[@]} > 0 )); then
  mapfile -t sorted_versions < <(printf "%s\n" "${versions[@]}" | sort -V)
fi

# Add 'latest' at the start and 'develop' at the end
sorted_versions=("latest" "${sorted_versions[@]}" "develop")

# Output to versions.json
printf "%s\n" "${sorted_versions[@]}" | jq -R . | jq -s . > "${DIR}/versions.json"
