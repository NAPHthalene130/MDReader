## MODIFIED Requirements

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
