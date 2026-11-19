FROM node:24-bookworm AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --no-audit
COPY frontend/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-17 AS backend
WORKDIR /app
COPY pom.xml ./
COPY src ./src
COPY --from=frontend /app/frontend/dist/adp/browser ./frontend/dist/adp/browser
RUN mkdir -p src/main/resources/static \
    && cp -R frontend/dist/adp/browser/. src/main/resources/static/ \
    && mvn -q clean package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=backend /app/target/adp.jar ./adp.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "adp.jar", "--server.address=0.0.0.0"]
