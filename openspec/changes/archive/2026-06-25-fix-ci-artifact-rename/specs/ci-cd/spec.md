## MODIFIED Requirements

### Requirement: Release artifacts are versioned
The CI/CD pipeline SHALL include a version identifier in the produced artifact filenames (e.g., `MDReader-v1.0.0-setup.exe`, `MDReader-v1.0.0.apk`) and SHALL tolerate the absence of any platform artifact during the rename step without failing the workflow.

#### Scenario: Versioned artifact filenames
- **WHEN** the build completes and the project version is `1.0.0`
- **THEN** the produced artifacts are named `MDReader-v1.0.0-setup.exe` and `MDReader-v1.0.0.apk` and `MDReader-v1.0.0-ios.app.zip`

#### Scenario: Missing Windows artifact does not fail rename
- **WHEN** the release job runs but no `.exe` file exists in the artifacts directory
- **THEN** the rename step completes successfully and the workflow continues without error

#### Scenario: Missing Android artifact does not fail rename
- **WHEN** the release job runs but no `.apk` file exists in the artifacts directory
- **THEN** the rename step completes successfully and the workflow continues without error

#### Scenario: Missing iOS artifact does not fail rename
- **WHEN** the release job runs but no `.app` directory exists in the artifacts directory
- **THEN** the rename step completes successfully and the workflow continues without error
