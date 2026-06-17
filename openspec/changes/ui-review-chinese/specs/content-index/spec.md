## MODIFIED Requirements

### Requirement: Content index displays a table of contents from document headings
The application SHALL display a navigable table of contents sidebar with Chinese-labeled header ("目录") and modern styling consistent with the app design.

#### Scenario: TOC displays all headings
- **WHEN** a Markdown document with headings of various levels (h1, h2, h3) is opened
- **THEN** the content index sidebar shows all headings with a "目录" header, using the app's design system styling

### Requirement: TOC can be toggled visible/hidden
The application SHALL provide a toggle button with Chinese label to show or hide the content index sidebar.

#### Scenario: Hide the TOC sidebar
- **WHEN** the user clicks the toggle button while the TOC is visible
- **THEN** the TOC sidebar slides out of view and the document area expands to fill the available space
