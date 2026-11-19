#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
(cd frontend && npm ci && npm run build)
mkdir -p src/main/resources/static
cp -R frontend/dist/adp/browser/. src/main/resources/static/
mvn -f pom.xml clean package
cp target/adp.jar adp.jar

