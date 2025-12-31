#!/bin/bash

# OpenAPI schema URL (backend must be running)
OPENAPI_URL="http://localhost:8000/openapi.json"
OUTPUT_FILE="src/types/api.generated.ts"

echo "Fetching OpenAPI schema from $OPENAPI_URL..."

# Fetch the schema and generate types
npx openapi-typescript "$OPENAPI_URL" -o "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
  echo "Types generated successfully at $OUTPUT_FILE"
else
  echo "Failed to generate types. Is the backend running?"
  exit 1
fi
