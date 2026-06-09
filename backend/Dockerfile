# Stage 1: Build JAR inside container
FROM eclipse-temurin:26-jdk AS builder
WORKDIR /app
COPY . .
# Normalize line endings in mvnw script for Unix environment
RUN tr -d '\r' < mvnw > mvnw_unix && mv mvnw_unix mvnw && chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime image
FROM eclipse-temurin:26-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
