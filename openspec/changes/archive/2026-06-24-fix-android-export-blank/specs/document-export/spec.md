## MODIFIED Requirements

### Requirement: User can export the rendered document to JPG
The system SHALL export the currently displayed document to a JPEG image file when the user selects JPG, capturing the full rendered document body including background colors, syntax-highlighted code blocks, blockquotes, Mermaid diagrams, and LaTeX formulas. The capture SHALL include the entire document, not just the visible viewport. The exported image SHALL contain visible document content, not a blank or empty image.

#### Scenario: Successful JPG export
- **WHEN** the user selects JPG from the export menu
- **THEN** a save dialog prompts for a destination location with a default filename derived from the open document name and a `.jpg` extension
- **AND** a JPEG image containing the full rendered document is written to the chosen path
- **AND** the image preserves backgrounds, code highlighting, blockquotes, Mermaid diagrams, and LaTeX formulas

#### Scenario: Android JPG export contains visible content
- **WHEN** the user exports to JPG on Android
- **THEN** the exported image contains visible rendered document content, not a blank or entirely white image

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
The system SHALL export the currently displayed document to a PNG image file when the user selects PNG, capturing the full rendered document body including background colors, syntax-highlighted code blocks, blockquotes, Mermaid diagrams, and LaTeX formulas. The capture SHALL include the entire document, not just the visible viewport. The exported image SHALL contain visible document content, not a blank or empty image.

#### Scenario: Successful PNG export
- **WHEN** the user selects PNG from the export menu
- **THEN** a save dialog prompts for a destination location with a default filename derived from the open document name and a `.png` extension
- **AND** a PNG image containing the full rendered document is written to the chosen path
- **AND** the image preserves backgrounds, code highlighting, blockquotes, Mermaid diagrams, and LaTeX formulas

#### Scenario: Android PNG export contains visible content
- **WHEN** the user exports to PNG on Android
- **THEN** the exported image contains visible rendered document content, not a blank or entirely white image

#### Scenario: Mermaid diagrams render in exported PNG
- **WHEN** the open document contains a valid Mermaid diagram and the user exports to PNG
- **THEN** the exported image contains the rendered Mermaid SVG diagram, not error placeholder text

#### Scenario: User cancels the PNG save dialog
- **WHEN** the user selects PNG and then cancels the save dialog
- **THEN** no file is written and no error notification is shown

#### Scenario: PNG export fails
- **WHEN** image capture or file writing encounters an error
- **THEN** the user is notified with an error message and no partial file remains on disk
