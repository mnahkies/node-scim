#!/usr/bin/env bash

set -e

yarn openapi-code-generator \
  --input ./openapi.yaml \
  --input-type openapi3 \
  --output ./src/generated \
  --template typescript-koa \
  --schema-builder zod \
  --grouping-strategy first-slug \
  --extract-inline-schemas \
  --ts-allow-any

yarn format
yarn lint
