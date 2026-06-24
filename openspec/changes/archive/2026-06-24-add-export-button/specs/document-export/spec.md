## ADDED Requirements

### Requirement: Viewer toolbar displays an Export button
The Windows viewer toolbar SHALL display an "导出" (Export) button positioned immediately to the left of the existing "目录" (Table of Contents) toggle button.

#### Scenario: Export button rendered left of TOC button
- **WHEN** the viewer renders a document toolbar
- **THEN** an Export button is displayed in the toolbar immediately to the left of the TOC toggle button

#### Scenario: Export button matches toolbar styling
- **WHEN** the Export button is rendered
- **THEN** it uses the same button styling as the other toolbar buttons (back and TOC toggle)

### Requirement: Export button opens a format selection menu
Clicking the Export button SHALL open a menu listing the export formats PDF, JPG, and PNG.

#### Scenario: Open format menu
- **WHEN** the user clicks the Export button
- **THEN** a menu appears listing PDF, JPG, and PNG as format options

#### Scenario: Dismiss menu on outside click
- **WHEN** the format menu is open and the user clicks outside the menu
- **THEN** the menu closes and no export is performed

#### Scenario: Dismiss menu when selecting a format
- **WHEN** the user selects any format option from the menu
- **THEN** the menu closes

### Requirement: User can export the rendered document to PDF
The system SHALL export the currently displayed document to a PDF file when the user selects PDF, preserving rendered content including background colors, syntax-highlighted code blocks, blockquotes, Mermaid diagrams, and LaTeX formulas.

#### Scenario: Successful PDF export
- **WHEN** the user selects PDF from the export menu
- **THEN** a save dialog prompts for a destination location with a default filename derived from the open document name and a `.pdf` extension
- **AND** a PDF containing the rendered document is written to the chosen path
- **AND** the PDF preserves backgrounds, code highlighting, blockquotes, Mermaid diagrams, and LaTeX formulas

#### Scenario: User cancels the save dialog
- **WHEN** the user selects PDF and then cancels the save dialog
- **THEN** no file is written and no error notification is shown

#### Scenario: PDF generation fails
- **WHEN** PDF generation or file writing encounters an error
- **THEN** the user is notified with an error message and no partial file remains on disk

### Requirement: Exported PDF contains only document content
The exported PDF SHALL contain only the rendered document body and SHALL exclude application chrome such as the toolbar, back button, and Table of Contents sidebar.

#### Scenario: PDF excludes toolbar and sidebar
- **WHEN** a PDF is exported from the viewer
- **THEN** the resulting PDF pages contain the rendered document body without the toolbar, back button, or TOC sidebar

### Requirement: JPG and PNG export options are reserved for future implementation
The format menu SHALL list JPG and PNG options, but they SHALL be marked as not yet available and SHALL NOT trigger an export when selected.

#### Scenario: Select an unavailable format
- **WHEN** the user selects the JPG or PNG option from the export menu
- **THEN** no export is performed and the option is visually indicated as not yet available

### Requirement: PDF export is available only on the Windows viewer
The export capability SHALL be exposed only in the Windows (Electron) viewer. Android and iOS clients SHALL be unchanged by this change.

#### Scenario: Windows viewer offers export
- **WHEN** a document is opened in the Windows viewer
- **THEN** the Export button is present in the toolbar

#### Scenario: Non-Windows platforms unaffected
- **WHEN** the change is applied
- **THEN** the Android and iOS clients expose no export UI and their behavior is unchanged
