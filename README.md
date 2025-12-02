# JSON Formatter with Tree View

A web-based JSON formatter with tree visualization and comparison features.

## Features

- **JSON Formatting**: Pretty-print JSON with proper indentation
- **Tree View**: Interactive collapsible tree structure for JSON data
- **Single Line**: Minify JSON to single line format
- **JSON Comparison**: Compare two JSON objects and highlight differences
- **Line Numbers**: Code editor-like line numbers for better navigation

## Project Structure

```
jsonformatter/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All CSS styles
├── js/
│   └── script.js       # JavaScript functionality
└── README.md           # This file
```

## Usage

1. Open `index.html` in a web browser
2. Paste JSON data in either panel
3. Use the buttons to:
   - Format JSON with indentation
   - View as interactive tree
   - Convert to single line
   - Compare two JSONs
   - Expand/collapse tree nodes

## Functions

### Main Functions
- `formatJSON(num)` - Format JSON in specified panel
- `compareJSON()` - Compare two JSON objects
- `switchView(num, view)` - Switch between text/single/tree views
- `renderTree(num)` - Generate tree view from JSON

### Utility Functions
- `updateLineNumbers(num)` - Update line numbers for text areas
- `syncScroll(num)` - Synchronize scroll between text and line numbers
- `toggleNode(element)` - Toggle tree node expansion
- `escapeHtml(text)` - Escape HTML characters

## Dependencies

- React 18 (CDN)
- React DOM 18 (CDN)
- Iconify Icons (CDN)

## Browser Compatibility

Modern browsers with ES6+ support required.

## Copyright

Copyright © 2025 Shino JSON Formatter - All Rights Reserved