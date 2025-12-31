#!/bin/bash
set -euo pipefail

# OpenAPI schema URL (backend must be running)
OPENAPI_URL="http://localhost:8000/openapi.json"
OUTPUT_FILE="src/types/api.generated.ts"

echo "Fetching OpenAPI schema from $OPENAPI_URL..."

# Fetch the schema and generate types
if ! npx openapi-typescript "$OPENAPI_URL" -o "$OUTPUT_FILE"; then
  echo "Failed to generate types. Is the backend running?"
  exit 1
fi

echo "Types generated successfully at $OUTPUT_FILE"
