#!/usr/bin/env bash

set -e

rm -rf ./src/generated

 yarn openapi-code-generator \
  --input ./openapi.yaml \
  --input-type openapi3 \
  --output ./src/generated \
  --template typescript-koa \
  --schema-builder zod \
  --grouping-strategy first-tag \
  --extract-inline-schemas \
  --ts-allow-any \
  --ts-server-implementation-method abstract-class

yarn peggy -o ./parser.js --format commonjs --dts ./parser.peggy

yarn format
yarn lint
