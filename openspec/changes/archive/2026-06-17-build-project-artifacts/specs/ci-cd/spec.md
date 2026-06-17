## ADDED Requirements

### Requirement: Local build is available as an alternative to CI/CD
The project SHALL provide a local build mechanism that mirrors the CI/CD pipeline, allowing developers to produce artifacts without pushing to the repository.

#### Scenario: Local build produces same artifacts as CI/CD
- **WHEN** a developer runs the local build command
- **THEN** the resulting `.exe` and `.apk` files are functionally identical to those produced by the CI/CD pipeline (same code, same dependencies, same packaging)
