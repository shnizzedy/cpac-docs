#!/bin/bash
DIR=${1:-./cpac-docs}

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
  mapfile -t sorted_versions < <(printf "%s\n" "${dirs[@]}" | sort -rV)
fi

# Add 'latest' at the start and 'develop' at the end
sorted_versions=("latest" "${sorted_versions[@]}" "develop")
echo "Sorted versions: ${sorted_versions[*]}"
# Output to versions.json
printf "%s\n" "${sorted_versions[@]}" | jq -R . | jq -s . > "${DIR}/versions.json"
