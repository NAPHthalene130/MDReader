# document-export

## Purpose

Export the rendered Markdown document to portable file formats from the Windows viewer toolbar. PDF, JPG, and PNG export are implemented. Export operates on the already-rendered DOM and preserves backgrounds, syntax highlighting, Mermaid diagrams, and LaTeX formulas.

## Requirements

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
The system SHALL export the currently displayed document to a PDF file when the user selects PDF, preserving rendered content including background colors, syntax-highlighted code blocks, blockquotes, Mermaid diagrams, and LaTeX formulas. Mermaid diagrams SHALL be rendered as SVG in the exported PDF, not as error placeholder text.

#### Scenario: Successful PDF export
- **WHEN** the user selects PDF from the export menu
- **THEN** a save dialog prompts for a destination location with a default filename derived from the open document name and a `.pdf` extension
- **AND** a PDF containing the rendered document is written to the chosen path
- **AND** the PDF preserves backgrounds, code highlighting, blockquotes, Mermaid diagrams, and LaTeX formulas

#### Scenario: Mermaid diagrams render in exported PDF
- **WHEN** the open document contains a valid Mermaid diagram and the user exports to PDF
- **THEN** the exported PDF contains the rendered Mermaid SVG diagram, not error placeholder text such as "Syntax error in text"

#### Scenario: User cancels the save dialog
- **WHEN** the user selects PDF and then cancels the save dialog
- **THEN** no file is written and no error notification is shown

#### Scenario: PDF generation fails
- **WHEN** PDF generation or file writing encounters an error
- **THEN** the user is notified with an error message and no partial file remains on disk

### Requirement: Exported PDF contains only document content
The exported PDF SHALL contain the entire rendered document body across as many pages as needed and SHALL exclude application chrome such as the toolbar, back button, Table of Contents sidebar, export status toast, and export format dropdown menu. The full document content SHALL NOT be clipped to a single viewport or page.

#### Scenario: PDF excludes toolbar and sidebar
- **WHEN** a PDF is exported from the viewer
- **THEN** the resulting PDF pages contain the rendered document body without the toolbar, back button, or TOC sidebar

#### Scenario: PDF excludes export UI elements
- **WHEN** a PDF is exported while the export status toast or format dropdown menu is visible
- **THEN** the resulting PDF pages do not contain the export status toast or the format dropdown menu

#### Scenario: Multi-page document exports completely
- **WHEN** the open document is longer than one printed page and the user exports to PDF
- **THEN** the exported PDF contains content on every page with no blank pages following the first page
- **AND** no document content is clipped or missing from the export

### Requirement: User can export the rendered document to JPG
The system SHALL export the currently displayed document to a JPEG image file when the user selects JPG, capturing the full rendered document body including background colors, syntax-highlighted code blocks, blockquotes, Mermaid diagrams, and LaTeX formulas. The capture SHALL include the entire document, not just the visible viewport.

#### Scenario: Successful JPG export
- **WHEN** the user selects JPG from the export menu
- **THEN** a save dialog prompts for a destination location with a default filename derived from the open document name and a `.jpg` extension
- **AND** a JPEG image containing the full rendered document is written to the chosen path
- **AND** the image preserves backgrounds, code highlighting, blockquotes, Mermaid diagrams, and LaTeX formulas

#### Scenario: Mermaid diagrams render in exported JPG
- **WHEN** the open document contains a valid Mermaid diagram and the user exports to JPG
- **THEN** the exported image contains the rendered Mermaid SVG diagram, not error placeholder text

#### Scenario: User cancels the JPG save dialog
- **WHEN** the user selects JPG and then cancels the save dialog
- **THEN** no file is written and no error notification is shown

#### Scenario: JPG export fails
- **WHEN** image capture or file writing encounters an error
- **THEN** the user is notified with an error message and no partial file remains on disk

### Requirement: User can export the rendered document to PNG
The system SHALL export the currently displayed document to a PNG image file when the user selects PNG, capturing the full rendered document body including background colors, syntax-highlighted code blocks, blockquotes, Mermaid diagrams, and LaTeX formulas. The capture SHALL include the entire document, not just the visible viewport.

#### Scenario: Successful PNG export
- **WHEN** the user selects PNG from the export menu
- **THEN** a save dialog prompts for a destination location with a default filename derived from the open document name and a `.png` extension
- **AND** a PNG image containing the full rendered document is written to the chosen path
- **AND** the image preserves backgrounds, code highlighting, blockquotes, Mermaid diagrams, and LaTeX formulas

#### Scenario: Mermaid diagrams render in exported PNG
- **WHEN** the open document contains a valid Mermaid diagram and the user exports to PNG
- **THEN** the exported image contains the rendered Mermaid SVG diagram, not error placeholder text

#### Scenario: User cancels the PNG save dialog
- **WHEN** the user selects PNG and then cancels the save dialog
- **THEN** no file is written and no error notification is shown

#### Scenario: PNG export fails
- **WHEN** image capture or file writing encounters an error
- **THEN** the user is notified with an error message and no partial file remains on disk

### Requirement: PDF export is available only on the Windows viewer
The export capability SHALL be exposed only in the Windows (Electron) viewer. Android and iOS clients SHALL be unchanged by this change.

#### Scenario: Windows viewer offers export
- **WHEN** a document is opened in the Windows viewer
- **THEN** the Export button is present in the toolbar

#### Scenario: Non-Windows platforms unaffected
- **WHEN** the change is applied
- **THEN** the Android and iOS clients expose no export UI and their behavior is unchanged
