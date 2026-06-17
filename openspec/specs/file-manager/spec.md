# file-manager

## Purpose

Provides the main page file manager with recently-read Markdown file tracking, add new file via system file picker, remove entries from history, and click-to-open navigation to the viewer.

## Requirements

### Requirement: Application displays a file manager as the main page
The application SHALL display a file manager page as the default view when launched, showing a list of recently-read Markdown files.

#### Scenario: App launches with empty file list
- **WHEN** the application is launched for the first time with no reading history
- **THEN** the file manager displays an empty state with a message prompting the user to add a Markdown file

#### Scenario: App launches with existing file history
- **WHEN** the application is launched and previously-read files exist in history
- **THEN** the file manager displays the list of recently-read files sorted by last-opened timestamp (most recent first)

### Requirement: User can add a new Markdown file to the reading list
The application SHALL allow users to browse and select a `.md` file from the local file system to add to the recently-read list.

#### Scenario: User adds a valid Markdown file
- **WHEN** the user clicks "Add File" and selects a `.md` file from the file picker
- **THEN** the file is added to the recently-read list and displayed in the file manager with its filename and file path

#### Scenario: User adds a file that is already in the list
- **WHEN** the user adds a `.md` file that already exists in the recently-read list
- **THEN** the existing entry is moved to the top of the list (updated timestamp) without creating a duplicate

### Requirement: User can remove a file from the reading list
The application SHALL allow users to remove entries from the recently-read list without deleting the actual file from disk.

#### Scenario: User removes a file entry
- **WHEN** the user triggers the remove action on a file entry in the recently-read list
- **THEN** the entry is removed from the list and no longer displayed in the file manager, but the original file on disk remains untouched

### Requirement: User can open a file from the reading list
The application SHALL allow users to tap or click a file in the recently-read list to open it in the Markdown viewer.

#### Scenario: User opens a file from the list
- **WHEN** the user clicks on a file entry in the recently-read list
- **THEN** the application navigates to the Markdown viewer and renders the selected file's content

### Requirement: File list is persisted across app restarts
The application SHALL persist the recently-read file list to local storage and restore it when the application restarts.

#### Scenario: File list survives app restart
- **WHEN** the user closes and reopens the application
- **THEN** the recently-read file list displays the same entries as before closing, in the same order
