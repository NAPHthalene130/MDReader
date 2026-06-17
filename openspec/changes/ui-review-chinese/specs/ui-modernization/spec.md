## ADDED Requirements

### Requirement: UI uses modern card-based design
The application SHALL use a modern visual design with card-based layouts, rounded corners, consistent spacing, and a unified color palette.

#### Scenario: File list displays as cards
- **WHEN** the file manager page is displayed
- **THEN** each file entry appears as a card with rounded corners, subtle shadow, and proper padding

#### Scenario: Consistent color scheme across platforms
- **WHEN** the app is viewed on Windows or Android
- **THEN** the primary blue (#0366d6), background (#f0f2f5), and typography are identical

### Requirement: All UI text is in Chinese
The application SHALL display all interface text in Chinese (Simplified).

#### Scenario: File manager displays Chinese text
- **WHEN** the file manager is displayed with no files
- **THEN** the empty state message reads in Chinese prompting user to add a file

#### Scenario: Buttons and labels in Chinese
- **WHEN** any button or label is rendered
- **THEN** the text displayed is in Chinese (e.g., "添加文件" not "Add File")
