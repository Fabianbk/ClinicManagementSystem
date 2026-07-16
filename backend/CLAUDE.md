# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

```bash
# Build the project
./mvnw clean install

# Run the application
./mvnw spring-boot:run

# Run tests
./mvnw test

# Run a single test class
./mvnw test -Dtest=DoctorServiceTest

# Run a single test method
./mvnw test -Dtest=DoctorControllerTest#testCreateDoctor
```

## Architecture

This is a Spring Boot REST API for clinic management with a layered architecture:

- **Entity Layer** (`entity/`): JPA entities representing domain models
- **Repository Layer** (`repository/`): Spring Data JPA interfaces extending `JpaRepository`
- **Mapper Layer** (`mapper/`): MapStruct mappers for DTO-entity conversion
- **DTO Layer** (`dto/`): Request/response DTOs with validation annotations
- **Service Layer** (`service/`): Business logic with `@Transactional` boundaries
- **Controller Layer** (`controller/`): REST endpoints returning `ApiResponse<T>`
- **Exception Layer** (`exception/`): Custom exceptions and `GlobalExceptionHandler`
- **Enum Layer** (`enums/`): Status enums for appointments and slots

## Key Domain Model

```
Doctor ──< WorkingSchedule >── AppointmentSlot >── Appointment >── RecordTreatment
                                    │
                                    └── (slot status: AVAILABLE, BOOKED, BLOCKED)
                                    
Patient ── ContactPerson (1-to-many)
      │
      └── PatientAccount (1-to-1)
      └── Principle (1-to-1)
      └── HealthProfile (1-to-1)
      └── Appointment (1-to-many)
             └── RecordTreatment
```

### Cascade Policy

Entity relationships intentionally avoid `CascadeType.REMOVE` to prevent accidental data loss of historical records. For example:
- Deleting a `Doctor` will fail if they have associated `WorkingSchedule` or `RecordTreatment` records
- Deleting an `AppointmentSlot` with a `BOOKED` status is rejected
- These constraints are enforced at both DB and service layer

### Appointment Lifecycle

1. **WorkingSchedule** is created for a doctor on a specific date with shift times
2. **AppointmentSlot** instances are created within a WorkingSchedule's time window
3. **Booking**: Patient selects an AVAILABLE slot via `AppointmentService.book()` - atomically sets slot to BOOKED and creates Appointment with SCHEDULED status
4. Status transitions: `SCHEDULED → CANCELLED | COMPLETED | NO_SHOW` (only SCHEDULED appointments can be updated)

## Patterns

### API Responses
All endpoints return `ApiResponse<T>` wrapper with `PageResponse<T>` for paginated results.

### Validation
- Request DTOs use `@Valid` with Jakarta validation annotations
- Business validation occurs in services (e.g., slot availability, time constraints)

### DTOs
- Request DTOs: `XRequestDTO` (input only)
- Response DTOs: `XResponseDTO` (output only, excludes sensitive/internal fields)

### Error Handling
- `BadRequestException` (400) - validation failures
- `ResourceNotFoundException` (404) - missing resources
- `DuplicateResourceException` (409) - conflicts (e.g., duplicate username)
- `GlobalExceptionHandler` converts exceptions to appropriate HTTP responses

## Dependencies

- Spring Boot 4.0.6
- Java 21
- MySQL Connector/J
- Lombok (entity boilerplate)
- MapStruct 1.5.5.Final (DTO mapping)
- Spring Security Crypto (password encoding)