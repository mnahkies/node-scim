#!/usr/bin/env bash

set -e

rm -rf ./src/generated

# Relies on https://github.com/mnahkies/openapi-code-generator/pull/241 being released
 yarn openapi-code-generator \
  --input ./openapi.yaml \
  --input-type openapi3 \
  --output ./src/generated \
  --template typescript-koa \
  --schema-builder zod \
  --grouping-strategy first-tag \
  --extract-inline-schemas \
  --ts-allow-any

yarn format
yarn lint
