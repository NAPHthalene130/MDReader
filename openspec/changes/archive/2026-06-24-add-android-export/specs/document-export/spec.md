## ADDED Requirements

### Requirement: Android viewer toolbar displays an Export button
The Android viewer toolbar SHALL display an "导出" (Export) button positioned immediately to the left of the existing "目录" (Table of Contents) toggle button.

#### Scenario: Android Export button rendered left of TOC button
- **WHEN** the Android viewer displays a document
- **THEN** an Export button is displayed in the native toolbar immediately to the left of the TOC toggle button

### Requirement: Android viewer export button opens a format selection menu
Tapping the Android viewer's Export button SHALL open a menu listing the export formats PDF, JPG, and PNG.

#### Scenario: Open Android format menu
- **WHEN** the user taps the Export button on Android
- **THEN** a menu appears listing PDF, JPG, and PNG as format options

#### Scenario: Dismiss Android menu on outside tap
- **WHEN** the format menu is open and the user taps outside the menu
- **THEN** the menu closes and no export is performed

### Requirement: Android viewer can export to PDF via system print dialog
The Android viewer SHALL export the currently displayed document to PDF when the user selects PDF, using the Android system print framework (`PrintManager` + `WebView.createPrintDocumentAdapter()`). The system print dialog SHALL allow the user to save the document as a PDF file or send it to a printer. The exported PDF SHALL preserve rendered content including background colors, syntax-highlighted code blocks, blockquotes, Mermaid diagrams, and LaTeX formulas.

#### Scenario: Successful Android PDF export
- **WHEN** the user selects PDF from the Android export menu
- **THEN** the Android system print dialog opens showing the rendered document
- **AND** the user can save the document as a PDF file through the print dialog
- **AND** the PDF preserves backgrounds, code highlighting, blockquotes, Mermaid diagrams, and LaTeX formulas

#### Scenario: Android PDF export preserves Mermaid diagrams
- **WHEN** the open document contains a valid Mermaid diagram and the user exports to PDF on Android
- **THEN** the exported PDF contains the rendered Mermaid SVG diagram, not error placeholder text

#### Scenario: User cancels the Android print dialog
- **WHEN** the user selects PDF and then dismisses the system print dialog
- **THEN** no file is written and no error notification is shown

### Requirement: Android viewer can export to JPG
The Android viewer SHALL export the currently displayed document to a JPEG image file when the user selects JPG, capturing the full rendered WebView content (not just the visible viewport) including background colors, syntax-highlighted code blocks, blockquotes, Mermaid diagrams, and LaTeX formulas. The image SHALL be saved to a user-chosen location via the Storage Access Framework.

#### Scenario: Successful Android JPG export
- **WHEN** the user selects JPG from the Android export menu
- **THEN** a system save dialog prompts for a destination location with a default filename derived from the open document name and a `.jpg` extension
- **AND** a JPEG image containing the full rendered document is written to the chosen location
- **AND** the image preserves backgrounds, code highlighting, blockquotes, Mermaid diagrams, and LaTeX formulas

#### Scenario: Android JPG export preserves Mermaid diagrams
- **WHEN** the open document contains a valid Mermaid diagram and the user exports to JPG on Android
- **THEN** the exported image contains the rendered Mermaid SVG diagram, not error placeholder text

#### Scenario: User cancels the Android JPG save dialog
- **WHEN** the user selects JPG and then cancels the system save dialog
- **THEN** no file is written and no error notification is shown

#### Scenario: Android JPG export fails
- **WHEN** image capture or file writing encounters an error
- **THEN** the user is notified with an error message and no partial file remains

### Requirement: Android viewer can export to PNG
The Android viewer SHALL export the currently displayed document to a PNG image file when the user selects PNG, capturing the full rendered WebView content (not just the visible viewport) including background colors, syntax-highlighted code blocks, blockquotes, Mermaid diagrams, and LaTeX formulas. The image SHALL be saved to a user-chosen location via the Storage Access Framework.

#### Scenario: Successful Android PNG export
- **WHEN** the user selects PNG from the Android export menu
- **THEN** a system save dialog prompts for a destination location with a default filename derived from the open document name and a `.png` extension
- **AND** a PNG image containing the full rendered document is written to the chosen location
- **AND** the image preserves backgrounds, code highlighting, blockquotes, Mermaid diagrams, and LaTeX formulas

#### Scenario: Android PNG export preserves Mermaid diagrams
- **WHEN** the open document contains a valid Mermaid diagram and the user exports to PNG on Android
- **THEN** the exported image contains the rendered Mermaid SVG diagram, not error placeholder text

#### Scenario: User cancels the Android PNG save dialog
- **WHEN** the user selects PNG and then cancels the system save dialog
- **THEN** no file is written and no error notification is shown

#### Scenario: Android PNG export fails
- **WHEN** image capture or file writing encounters an error
- **THEN** the user is notified with an error message and no partial file remains

### Requirement: Export is available on Windows and Android
The export capability SHALL be available on both the Windows (Electron) viewer and the Android viewer. iOS SHALL remain unchanged by this change.

#### Scenario: Windows viewer offers export
- **WHEN** a document is opened in the Windows viewer
- **THEN** the Export button is present in the toolbar

#### Scenario: Android viewer offers export
- **WHEN** a document is opened in the Android viewer
- **THEN** the Export button is present in the toolbar

#### Scenario: iOS unaffected
- **WHEN** the change is applied
- **THEN** the iOS client exposes no export UI and its behavior is unchanged

## REMOVED Requirements

### Requirement: PDF export is available only on the Windows viewer
**Reason**: Export (PDF, JPG, and PNG) is now implemented on both Windows and Android, so the Windows-only restriction no longer applies.
**Migration**: Selecting PDF, JPG, or PNG from the export menu on Android now triggers the corresponding export instead of being unavailable. See the new "Export is available on Windows and Android" requirement.
