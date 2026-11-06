# Sheets

An agent-writable spreadsheet panel for DeepSeek Harness. Open **Sheets** from the left sidebar, then ask the agent in chat to build, fill, or update a table. The panel refreshes while it is open, so agent edits appear without a reload.

## Install

Requirements: DeepSeek Harness `>=0.2.2-0 <0.3.0-0` and Node.js 20 or newer.

From the GitHub release (available now):

```sh
dsh plugin --profile <profile> add https://github.com/iggypcnfsky/dsh-sheets/releases/download/v1.0.0/iggylove-dsh-sheets-1.0.0.tgz
```

From npm (once published):

```sh
dsh plugin --profile <profile> add @iggylove/dsh-sheets
```

Restart `dsh web` after installing. The **Sheets** panel appears in the sidebar.

In an installed Harness build, the same package can be installed from the Plugins page by its npm name, or from this directory with the local bundle installer.

## What it does

- Multiple workbooks and multiple tabs per workbook.
- Editable cell grid with arrow-key navigation, Enter/Tab editing, block paste, column resizing, and row/column insertion or deletion.
- Formatting controls: fill and text colours with automatic contrast on dark fills, bold, italic, left/center/right alignment, wrap text with auto-growing rows, clear formatting, and fit columns to content.
- Range selection with Shift+click or Shift+arrow keys, so formatting and clearing apply to a block. Click a row number or column letter to select the whole row/column.
- Lightweight formulas: arithmetic, cell references, ranges, and `SUM`, `AVERAGE`, `MIN`, `MAX`, `COUNT`, `COUNTA`, `SUMIF`, `SUMIFS`, `COUNTIF`, `AVERAGEIF`, `IF`, `IFERROR`, `AND`, `OR`, `NOT`, `ROUND`, `ROUNDUP`, `ROUNDDOWN`, `ABS`, `SQRT`, `POWER`, `PI`, `SIN`, `COS`, `TAN`, `ASIN`, `ACOS`, `ATAN`, `ATAN2`, `DEGREES`, `RADIANS`, `TEXT`, `LEN`, `UPPER`, `LOWER`, `TRIM`, `CONCAT`, and cross-sheet `'Sheet'!A1` references.
- Import `.csv`, `.tsv`, `.txt`, and `.xlsx` files.
- Export the active sheet as CSV or the whole workbook as Excel (`.xlsx`), including formulas.
- Persistent storage under `DSH_PROFILE_DIR/data/dsh-sheets` when that environment variable is available, otherwise `~/.dsh/data/dsh-sheets`; set `DSH_SHEETS_DIR` to override.

## Agent tools

| Tool | Purpose |
| --- | --- |
| `spreadsheet_list` | List workbooks, sheets, and dimensions. |
| `spreadsheet_create` | Create a workbook from a name, header columns, and rows. |
| `spreadsheet_read` | Read a sheet or A1 range, with optional row/column caps. |
| `spreadsheet_write` | Set a range, append rows, replace rows, or clear a range. |
| `spreadsheet_manage` | Rename/delete workbooks, add/rename/delete sheets, add/delete rows and columns. |
| `spreadsheet_import` | Import a local `.xlsx`, `.xls`, `.xlsm`, `.csv`, `.tsv`, or `.txt` path into a new or existing workbook. |

A system-prompt section tells the agent to use these tools when the user asks for a table, comparison, or research matrix instead of printing a Markdown table. When the user hands over a file path, the agent uses `spreadsheet_import` instead of asking them to import it manually.

## Package

- npm: `@iggylove/dsh-sheets`
- source: [iggypcnfsky/dsh-sheets](https://github.com/iggypcnfsky/dsh-sheets)
- license: MIT

## Development

The host half is `index.js`; the browser half is `client.js` and is loaded through `window.__ModuleLoader__`. The bundle row is declared in `cordis.patch.yml` and the package manifest `dsh` field.

Before publishing:

```sh
node --check index.js
node --check client.js
npm pack --dry-run
```

## Notes and limits

- Up to 500 workbooks, 60 sheets per workbook, 5,000 rows and 120 columns per sheet, and 250,000 cells per workbook.
- Formulas are evaluated in the panel; structural edits do not rewrite existing formula references, so update formulas after inserting or deleting rows/columns if a range moved.
- Excel import preserves values, formulas, cell fill colours, and custom column widths. Borders, merged ranges, font families, and conditional formatting are not imported; dates fall back to their formatted text or serial number.
- The XLSX reader/writer is self-contained and uses the browser's `CompressionStream`/`DecompressionStream`. Current Chromium-based Harness builds support both.

## License

MIT © Iggy Love
