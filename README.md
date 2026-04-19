# simtranschinese

Chromium extension for Simplified/Traditional Chinese conversion.

## Features

- Convert selected text between Simplified and Traditional Chinese.
- Convert the current page between Simplified and Traditional Chinese.
- Convert user input content:
	- Active input/textarea/contenteditable elements on web pages.
	- Text entered in the extension popup.
- Right-click context menu options are available for:
	- Selected text
	- Entire page
	- Editable fields

## Project Structure

- `extension/manifest.json`: Extension manifest (MV3).
- `extension/background.js`: Context menu registration and action routing.
- `extension/contentScript.js`: Page, selection, and input conversion logic.
- `extension/popup/popup.html`: Popup UI.
- `extension/popup/popup.css`: Popup styling.
- `extension/popup/popup.js`: Popup action handlers.
- `extension/shared/converter.js`: Embedded conversion dictionary and functions.

## How to Load in Chromium

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `extension` folder in this repository.

## Usage

1. On any web page, select Chinese text and right-click to convert selection.
2. Right-click on page background to convert the whole page.
3. Right-click in editable input fields to convert input content.
4. Click the extension icon to open the popup and:
	 - Convert typed text directly in popup.
	 - Trigger selection/page conversion for the active tab.

## Notes

- Conversion uses an embedded one-to-one dictionary.
- Some region-specific wording/semantic conversions are not covered.