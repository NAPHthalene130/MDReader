# content-index

## Purpose

Provide a table of contents sidebar generated from document headings, with heading hierarchy indentation, click-to-scroll navigation to corresponding sections, current-heading highlighting on scroll, and show/hide toggle.

## Requirements

### Requirement: Content index displays a table of contents from document headings
The application SHALL display a navigable table of contents sidebar that lists all headings found in the currently open Markdown document.

#### Scenario: TOC displays all headings
- **WHEN** a Markdown document with headings of various levels (h1, h2, h3) is opened
- **THEN** the content index sidebar shows all headings as a nested list with indentation reflecting heading hierarchy

#### Scenario: Empty document shows no TOC
- **WHEN** a Markdown document with no headings is opened
- **THEN** the content index sidebar displays an empty state or is hidden

### Requirement: TOC entries are indented by heading level
The table of contents SHALL visually indent entries based on heading depth (h1 = no indent, h2 = one level, h3 = two levels, etc.).

#### Scenario: Nested heading hierarchy
- **WHEN** a document contains:
  ```
  # Chapter 1
  ## Section 1.1
  ### Subsection 1.1.1
  ## Section 1.2
  ```
- **THEN** the TOC displays "Chapter 1" at level 0, "Section 1.1" indented once, "Subsection 1.1.1" indented twice, and "Section 1.2" indented once

### Requirement: Clicking a TOC entry scrolls to the corresponding heading
The application SHALL scroll the document view to the heading position when the user clicks or taps a TOC entry.

#### Scenario: Navigate to a heading
- **WHEN** the user clicks on "Section 1.2" in the TOC
- **THEN** the document view scrolls to position "Section 1.2" heading smoothly, bringing it to the top of the viewport

### Requirement: TOC updates when a different document is opened
The content index SHALL regenerate and display the table of contents for the newly opened document.

#### Scenario: Switch between documents
- **WHEN** the user closes the current document and opens a different Markdown file
- **THEN** the content index clears and repopulates with headings from the new document

### Requirement: Current heading is highlighted in the TOC
The content index SHALL highlight the TOC entry corresponding to the heading currently visible at the top of the document viewport as the user scrolls.

#### Scenario: Scroll-triggered highlighting
- **WHEN** the user scrolls the document so that "Section 1.2" becomes the topmost visible heading
- **THEN** the "Section 1.2" entry in the TOC is visually highlighted (e.g., bold or colored background) to indicate current position

### Requirement: TOC can be toggled visible/hidden
The application SHALL provide a toggle to show or hide the content index sidebar.

#### Scenario: Hide the TOC sidebar
- **WHEN** the user clicks the toggle button while the TOC is visible
- **THEN** the TOC sidebar slides out of view and the document area expands to fill the available space

#### Scenario: Show the TOC sidebar
- **WHEN** the user clicks the toggle button while the TOC is hidden
- **THEN** the TOC sidebar slides into view and the document area shrinks accordingly
