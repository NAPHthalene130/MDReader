## MODIFIED Requirements

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
The exported PDF SHALL contain only the rendered document body and SHALL exclude application chrome such as the toolbar, back button, Table of Contents sidebar, export status toast, and export format dropdown menu.

#### Scenario: PDF excludes toolbar and sidebar
- **WHEN** a PDF is exported from the viewer
- **THEN** the resulting PDF pages contain the rendered document body without the toolbar, back button, or TOC sidebar

#### Scenario: PDF excludes export UI elements
- **WHEN** a PDF is exported while the export status toast or format dropdown menu is visible
- **THEN** the resulting PDF pages do not contain the export status toast or the format dropdown menu
