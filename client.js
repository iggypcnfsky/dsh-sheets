window.__ModuleLoader__.load({
  id: '@iggylove/dsh-sheets',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useState, useEffect, useRef, useMemo, useCallback } = React

    const NS = 'dsh-sheets'
    const API = '/dsh-sheets/api'
    const MAX_ROWS = 5000
    const MAX_COLS = 120

    // ---------------------------------------------------------------------
    // Locale
    // ---------------------------------------------------------------------

    const en = {
      title: 'Sheets',
      subtitle: 'Tables you and the agent fill together.',
      panelLabel: 'Sheets',
      newWorkbook: 'New spreadsheet',
      importFile: 'Import',
      export: 'Export',
      exportCsv: 'Export sheet as CSV',
      exportXlsx: 'Export workbook as Excel',
      deleteWorkbook: 'Delete spreadsheet',
      deleteWorkbookConfirm: 'Delete this spreadsheet?',
      workbookName: 'Spreadsheet name',
      untitled: 'Untitled spreadsheet',
      noBooks: 'No spreadsheets yet',
      noBooksHint: 'Ask in chat to build a table, or start one here. Agent edits appear live.',
      createFirst: 'New spreadsheet',
      search: 'Search spreadsheets',
      sheets: 'Sheets',
      sheet: 'Sheet',
      addSheet: 'Add sheet',
      deleteSheet: 'Delete sheet',
      deleteSheetConfirm: 'Delete this sheet?',
      renameSheet: 'Rename sheet',
      addRow: 'Add row',
      deleteRow: 'Delete row',
      addColumn: 'Add column',
      deleteColumn: 'Delete column',
      formula: 'Formula',
      cell: 'Cell',
      updated: 'updated',
      updatedJustNow: 'just now',
      updatedMinutes: '{n}m ago',
      updatedHours: '{n}h ago',
      updatedDays: '{n}d ago',
      saving: 'Saving…',
      saved: 'Saved',
      created: 'Spreadsheet created.',
      saveFailed: 'Could not save that change.',
      importFailed: 'Could not import that file.',
      exportFailed: 'Could not export that file.',
      imported: 'Imported {name}.',
      exported: 'Exported.',
      loading: 'Loading…',
      resizeColumn: 'Resize column {column}',
      fillColor: 'Fill color',
      textColor: 'Text color',
      bold: 'Bold',
      italic: 'Italic',
      alignLeft: 'Align left',
      alignCenter: 'Align center',
      alignRight: 'Align right',
      wrapText: 'Wrap text',
      clearFormatting: 'Clear formatting',
      fitColumns: 'Fit columns to content',
      noFill: 'No fill',
      automatic: 'Automatic',
      format: 'Format',
      customColor: 'Custom color',
      unsupportedFile: 'Please choose a .csv, .tsv, or .xlsx file.',
      xlsxUnsupported: 'This browser cannot read Excel files here. Export as CSV instead.',
      reading: 'Reading file…',
      allSheets: 'All sheets',
      showMore: 'Show more rows',
      dropHint: 'Drop a CSV or Excel file to import it',
      emptyCell: 'Empty',
      gridHint: 'Arrow keys move, Enter edits, Tab moves right. Paste a whole table with ⌘V.',
      copyCell: 'Copy cell',
      cutCell: 'Cut cell',
      deleteCell: 'Clear cell',
      nameRequired: 'Give the spreadsheet a name.',
      sheetNameRequired: 'Give the sheet a name.',
      bookCount: '{n} spreadsheets',
      sheetCount: '{n} sheets',
      rowColCount: '{rows} rows × {cols} columns',
      noMatches: 'No spreadsheets match.',
      openInPanel: 'Sheets panel',
      errorTitle: 'Sheets hit an error',
      errorBody: 'Close this panel and open it again. Your workbook is saved on the host.',
      close: 'Close',
      rename: 'Rename',
      cancel: 'Cancel',
      save: 'Save',
      statusReady: 'Ready',
      statusEditing: 'Editing',
      statusError: 'Error',
      localOnly: 'Local',
    }

    const pl = {
      title: 'Arkusze',
      subtitle: 'Tabele, które wypełniasz razem z agentem.',
      panelLabel: 'Arkusze',
      newWorkbook: 'Nowy arkusz',
      importFile: 'Importuj',
      export: 'Eksportuj',
      exportCsv: 'Eksportuj arkusz jako CSV',
      exportXlsx: 'Eksportuj skoroszyt jako Excel',
      deleteWorkbook: 'Usuń arkusz',
      deleteWorkbookConfirm: 'Usunąć ten arkusz?',
      workbookName: 'Nazwa arkusza',
      untitled: 'Nowy arkusz',
      noBooks: 'Nie ma jeszcze arkuszy',
      noBooksHint: 'Poproś w czacie o tabelę albo zacznij tutaj. Zmiany agenta pojawiają się na żywo.',
      createFirst: 'Nowy arkusz',
      search: 'Szukaj arkuszy',
      sheets: 'Arkusze',
      sheet: 'Arkusz',
      addSheet: 'Dodaj arkusz',
      deleteSheet: 'Usuń arkusz',
      deleteSheetConfirm: 'Usunąć ten arkusz?',
      renameSheet: 'Zmień nazwę arkusza',
      addRow: 'Dodaj wiersz',
      deleteRow: 'Usuń wiersz',
      addColumn: 'Dodaj kolumnę',
      deleteColumn: 'Usuń kolumnę',
      formula: 'Formuła',
      cell: 'Komórka',
      updated: 'zaktualizowano',
      updatedJustNow: 'przed chwilą',
      updatedMinutes: '{n} min temu',
      updatedHours: '{n} godz. temu',
      updatedDays: '{n} dni temu',
      saving: 'Zapisywanie…',
      saved: 'Zapisano',
      created: 'Utworzono arkusz.',
      saveFailed: 'Nie udało się zapisać tej zmiany.',
      importFailed: 'Nie udało się zaimportować pliku.',
      exportFailed: 'Nie udało się wyeksportować pliku.',
      imported: 'Zaimportowano {name}.',
      exported: 'Wyeksportowano.',
      loading: 'Ładowanie…',
      resizeColumn: 'Zmień szerokość kolumny {column}',
      fillColor: 'Kolor wypełnienia',
      textColor: 'Kolor tekstu',
      bold: 'Pogrubienie',
      italic: 'Kursywa',
      alignLeft: 'Do lewej',
      alignCenter: 'Do środka',
      alignRight: 'Do prawej',
      wrapText: 'Zawijanie tekstu',
      clearFormatting: 'Wyczyść formatowanie',
      fitColumns: 'Dopasuj kolumny do treści',
      noFill: 'Bez wypełnienia',
      automatic: 'Automatyczny',
      format: 'Format',
      customColor: 'Kolor niestandardowy',
      unsupportedFile: 'Wybierz plik .csv, .tsv lub .xlsx.',
      xlsxUnsupported: 'Ta przeglądarka nie potrafi tutaj czytać Excela. Użyj CSV.',
      reading: 'Czytanie pliku…',
      allSheets: 'Wszystkie arkusze',
      showMore: 'Pokaż więcej wierszy',
      dropHint: 'Przeciągnij plik CSV lub Excel, aby go zaimportować',
      emptyCell: 'Puste',
      gridHint: 'Strzałki przesuwają, Enter edytuje, Tab w prawo. Wklej całą tabelę przez ⌘V.',
      copyCell: 'Kopiuj komórkę',
      cutCell: 'Wytnij komórkę',
      deleteCell: 'Wyczyść komórkę',
      nameRequired: 'Podaj nazwę arkusza.',
      sheetNameRequired: 'Podaj nazwę zakładki.',
      bookCount: '{n} arkuszy',
      sheetCount: '{n} zakładek',
      rowColCount: '{rows} wierszy × {cols} kolumn',
      noMatches: 'Brak pasujących arkuszy.',
      openInPanel: 'Panel arkuszy',
      errorTitle: 'Arkusze napotkały błąd',
      errorBody: 'Zamknij ten panel i otwórz go ponownie. Skoroszyt jest zapisany na hoście.',
      close: 'Zamknij',
      rename: 'Zmień nazwę',
      cancel: 'Anuluj',
      save: 'Zapisz',
      statusReady: 'Gotowe',
      statusEditing: 'Edycja',
      statusError: 'Błąd',
      localOnly: 'Lokalnie',
    }

    function makeTranslate(dict) {
      return (key, values) => {
        const raw = dict[key] ?? en[key] ?? key
        if (!values) return raw
        return raw.replace(/\{(\w+)\}/g, (_match, name) => String(values[name] ?? ''))
      }
    }

    // ---------------------------------------------------------------------
    // Small helpers
    // ---------------------------------------------------------------------

    function clone(value) {
      return JSON.parse(JSON.stringify(value))
    }

    function colLetter(index) {
      let value = Math.max(0, Number(index) || 0)
      let out = ''
      do {
        out = String.fromCharCode(65 + (value % 26)) + out
        value = Math.floor(value / 26) - 1
      } while (value >= 0)
      return out
    }

    function colIndex(letter) {
      const normalized = String(letter ?? '').trim().replace(/\$/g, '').toUpperCase()
      if (!/^[A-Z]{1,3}$/.test(normalized)) return null
      let value = 0
      for (const char of normalized) value = value * 26 + (char.charCodeAt(0) - 64)
      return value - 1
    }

    function parseA1(reference) {
      const match = /^\$?([A-Za-z]{1,3})\$?([1-9][0-9]*)$/.exec(String(reference ?? '').trim())
      if (!match) return null
      const col = colIndex(match[1])
      const row = Number(match[2]) - 1
      if (col === null || row < 0) return null
      return { row, col }
    }

    function parseRange(reference) {
      const raw = String(reference ?? '').trim()
      const [startRaw, endRaw] = raw.split(':')
      const start = parseA1(startRaw)
      if (!start) return null
      const end = endRaw ? parseA1(endRaw) : { ...start }
      if (!end) return null
      return {
        startRow: Math.min(start.row, end.row),
        endRow: Math.max(start.row, end.row),
        startCol: Math.min(start.col, end.col),
        endCol: Math.max(start.col, end.col),
      }
    }

    function maxCols(rows) {
      let width = 0
      for (const row of rows) width = Math.max(width, row.length)
      return width
    }

    function cellText(value) {
      if (value === null || value === undefined) return ''
      if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
      return String(value)
    }

    function trimTrailing(row) {
      while (row.length > 0 && row[row.length - 1] === '') row.pop()
    }

    function ensureSize(rows, rowCount, colCountValue) {
      while (rows.length < rowCount) rows.push([])
      for (const row of rows) {
        while (row.length < colCountValue) row.push('')
      }
    }

    function normalizeRows(input) {
      if (!Array.isArray(input)) return []
      const rows = []
      for (const row of input) {
        if (!Array.isArray(row)) continue
        const next = row.slice(0, MAX_COLS).map(cellText)
        trimTrailing(next)
        rows.push(next)
        if (rows.length >= MAX_ROWS) break
      }
      while (rows.length > 0 && rows[rows.length - 1].every((cell) => cell === '')) rows.pop()
      return rows
    }

    function findSheet(book, reference) {
      if (!book) return null
      if (!reference) return book.sheets.find((sheet) => sheet.id === book.activeSheetId) ?? book.sheets[0] ?? null
      const raw = String(reference).trim()
      return (
        book.sheets.find((sheet) => sheet.id === raw) ??
        book.sheets.find((sheet) => sheet.name.toLowerCase() === raw.toLowerCase()) ??
        null
      )
    }

    function uniqueSheetName(book, wanted, exceptId) {
      const base = String(wanted ?? '').trim().slice(0, 60) || 'Sheet'
      const taken = new Set(
        book.sheets.filter((sheet) => sheet.id !== exceptId).map((sheet) => sheet.name.toLowerCase()),
      )
      if (!taken.has(base.toLowerCase())) return base
      let n = 2
      while (taken.has(`${base} ${n}`.toLowerCase())) n += 1
      return `${base} ${n}`.slice(0, 60)
    }

    function sanitizeFileName(name) {
      return String(name ?? 'spreadsheet')
        .replace(/[\\/:*?"<>|]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 80) || 'spreadsheet'
    }

    function sameWorkbookList(a, b) {
      if (a.length !== b.length) return false
      return a.every((entry, index) => {
        const other = b[index]
        return entry.id === other.id && entry.rev === other.rev && entry.updatedAt === other.updatedAt && entry.name === other.name
      })
    }

    function formatRelative(iso, t) {
      const then = Date.parse(iso)
      if (!Number.isFinite(then)) return ''
      const seconds = Math.max(0, Math.round((Date.now() - then) / 1000))
      if (seconds < 45) return t('updatedJustNow')
      const minutes = Math.round(seconds / 60)
      if (minutes < 60) return t('updatedMinutes', { n: minutes })
      const hours = Math.round(minutes / 60)
      if (hours < 24) return t('updatedHours', { n: hours })
      return t('updatedDays', { n: Math.round(hours / 24) })
    }

    function formatNumber(value) {
      if (!Number.isFinite(value)) return '#DIV/0!'
      const normalized = Object.is(value, -0) ? 0 : value
      const abs = Math.abs(normalized)
      if (abs !== 0 && (abs >= 1e12 || abs < 1e-6)) {
        return normalized.toExponential(6).replace(/\.?0+e/, 'e')
      }
      return Number(normalized.toFixed(10)).toString()
    }

    function downloadBlob(filename, blob) {
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 2000)
    }

    // ---------------------------------------------------------------------
    // Formula engine
    // ---------------------------------------------------------------------

    class FormulaError extends Error {
      constructor(code) {
        super(code)
        this.code = code
      }
    }

    function isErrorValue(value) {
      return value !== null && typeof value === 'object' && typeof value.__error === 'string'
    }

    function errorValue(code) {
      return { __error: code || '#ERROR!' }
    }

    function tokenizeFormula(source) {
      const tokens = []
      let i = 0
      const input = String(source ?? '')
      while (i < input.length) {
        const ch = input[i]
        if (/\s/.test(ch)) {
          i += 1
          continue
        }
        if (ch === '"' || ch === "'") {
          const quote = ch
          let value = ''
          i += 1
          let closed = false
          while (i < input.length) {
            if (input[i] === quote) {
              if (input[i + 1] === quote) {
                value += quote
                i += 2
              } else {
                i += 1
                closed = true
                break
              }
            } else {
              value += input[i]
              i += 1
            }
          }
          if (!closed) throw new FormulaError('#ERROR!')
          tokens.push({ type: 'string', value })
          continue
        }
        if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(input[i + 1]))) {
          let start = i
          while (i < input.length && /[0-9.]/.test(input[i])) i += 1
          const raw = input.slice(start, i)
          const value = Number(raw)
          if (!Number.isFinite(value)) throw new FormulaError('#ERROR!')
          tokens.push({ type: 'number', value })
          continue
        }
        if (/[A-Za-z_$]/.test(ch)) {
          let start = i
          while (i < input.length && /[A-Za-z0-9_$.]/.test(input[i])) i += 1
          const raw = input.slice(start, i)
          if (/^\$?[A-Za-z]{1,3}\$?[0-9]+$/.test(raw)) {
            tokens.push({ type: 'cell', value: raw })
          } else {
            tokens.push({ type: 'name', value: raw.toUpperCase() })
          }
          continue
        }
        const pair = input.slice(i, i + 2)
        if (pair === '<=' || pair === '>=' || pair === '<>') {
          tokens.push({ type: 'op', value: pair })
          i += 2
          continue
        }
        if ('+-*/^&%=<>'.includes(ch)) {
          tokens.push({ type: 'op', value: ch })
          i += 1
          continue
        }
        if ('(),:!'.includes(ch)) {
          tokens.push({ type: ch })
          i += 1
          continue
        }
        throw new FormulaError('#ERROR!')
      }
      return tokens
    }

    function numericString(value) {
      return /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(String(value).trim())
    }

    function literalValue(raw) {
      const trimmed = String(raw ?? '').trim()
      if (trimmed === '') return ''
      if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) return Number(trimmed)
      if (/^true$/i.test(trimmed)) return true
      if (/^false$/i.test(trimmed)) return false
      return String(raw)
    }

    function toNumber(value) {
      if (isErrorValue(value)) throw new FormulaError(value.__error)
      if (value && typeof value === 'object' && Array.isArray(value.__range)) throw new FormulaError('#VALUE!')
      if (typeof value === 'number') return value
      if (typeof value === 'boolean') return value ? 1 : 0
      if (typeof value === 'string') {
        if (value.trim() === '') return 0
        if (numericString(value)) return Number(value)
        throw new FormulaError('#VALUE!')
      }
      return 0
    }

    function toDisplayString(value) {
      if (isErrorValue(value)) throw new FormulaError(value.__error)
      if (value && typeof value === 'object' && Array.isArray(value.__range)) throw new FormulaError('#VALUE!')
      if (typeof value === 'number') return formatNumber(value)
      if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
      if (value === null || value === undefined) return ''
      return String(value)
    }

    function truthy(value) {
      if (isErrorValue(value)) throw new FormulaError(value.__error)
      if (value && typeof value === 'object' && Array.isArray(value.__range)) throw new FormulaError('#VALUE!')
      if (typeof value === 'boolean') return value
      if (typeof value === 'number') return value !== 0
      if (typeof value === 'string') return value !== '' && value.toUpperCase() !== 'FALSE'
      return false
    }

    function compareValues(left, right, op) {
      if (isErrorValue(left)) throw new FormulaError(left.__error)
      if (isErrorValue(right)) throw new FormulaError(right.__error)
      if (left && typeof left === 'object' && Array.isArray(left.__range)) throw new FormulaError('#VALUE!')
      if (right && typeof right === 'object' && Array.isArray(right.__range)) throw new FormulaError('#VALUE!')
      const leftNumber = typeof left === 'number' ? left : (typeof left === 'string' && numericString(left) ? Number(left) : null)
      const rightNumber = typeof right === 'number' ? right : (typeof right === 'string' && numericString(right) ? Number(right) : null)
      const useNumbers = leftNumber !== null && rightNumber !== null
      const a = useNumbers ? leftNumber : toDisplayString(left).toLowerCase()
      const b = useNumbers ? rightNumber : toDisplayString(right).toLowerCase()
      if (op === '=') return a === b
      if (op === '<>') return a !== b
      if (op === '<') return a < b
      if (op === '>') return a > b
      if (op === '<=') return a <= b
      if (op === '>=') return a >= b
      throw new FormulaError('#ERROR!')
    }

    function rangeValues(startRef, endRef, sheet, currentRow, currentCol, cache, stack, book) {
      const start = parseA1(startRef)
      const end = parseA1(endRef)
      if (!start || !end) throw new FormulaError('#REF!')
      const values = []
      const startRow = Math.min(start.row, end.row)
      const endRow = Math.max(start.row, end.row)
      const startCol = Math.min(start.col, end.col)
      const endCol = Math.max(start.col, end.col)
      for (let r = startRow; r <= endRow; r += 1) {
        for (let c = startCol; c <= endCol; c += 1) {
          values.push(cellValue(sheet, r, c, cache, stack, book))
        }
      }
      return { __range: values }
    }

    function cellValue(sheet, row, col, cache, stack, book) {
      if (!sheet || row < 0 || col < 0) return ''
      const key = `${sheet.id ?? 'sheet'}:${row}:${col}`
      if (cache.has(key)) return cache.get(key)
      if (stack.has(key)) return errorValue('#CYCLE!')
      const raw = sheet.rows[row]?.[col] ?? ''
      if (typeof raw === 'string' && raw.startsWith('=') && raw.length > 1) {
        stack.add(key)
        try {
          const value = evaluateFormula(raw.slice(1), sheet, row, col, cache, stack, book)
          const normalized = value && typeof value === 'object' && Array.isArray(value.__range)
            ? errorValue('#VALUE!')
            : value
          cache.set(key, normalized)
          return normalized
        } catch (error) {
          const code = error instanceof FormulaError ? error.code : '#ERROR!'
          cache.set(key, errorValue(code))
          return errorValue(code)
        } finally {
          stack.delete(key)
        }
      }
      const value = literalValue(raw)
      cache.set(key, value)
      return value
    }

    function flattenArgs(args) {
      const values = []
      for (const arg of args) {
        if (arg && typeof arg === 'object' && Array.isArray(arg.__range)) values.push(...arg.__range)
        else values.push(arg)
      }
      return values
    }


    function rangeList(value) {
      if (isErrorValue(value)) throw new FormulaError(value.__error)
      if (value && typeof value === 'object' && Array.isArray(value.__range)) return value.__range
      return [value]
    }

    function numericOrNull(value) {
      if (isErrorValue(value)) throw new FormulaError(value.__error)
      if (typeof value === 'number') return value
      if (typeof value === 'boolean') return value ? 1 : 0
      if (typeof value === 'string' && value.trim() !== '' && numericString(value)) return Number(value)
      return null
    }

    function wildcardPattern(pattern) {
      let out = '^'
      const text = String(pattern)
      for (let index = 0; index < text.length; index += 1) {
        const char = text[index]
        if (char === '~' && index + 1 < text.length) {
          index += 1
          out += text[index].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        } else if (char === '*') {
          out += '.*'
        } else if (char === '?') {
          out += '.'
        } else {
          out += char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        }
      }
      out += '$'
      return new RegExp(out, 'i')
    }

    function criteriaMatches(value, criteria) {
      if (isErrorValue(value)) return false
      if (isErrorValue(criteria)) throw new FormulaError(criteria.__error)
      let operator = '='
      let target = criteria
      if (typeof criteria === 'string') {
        const match = /^(<=|>=|<>|=|<|>)([\s\S]*)$/.exec(criteria)
        if (match) {
          operator = match[1]
          target = match[2]
        }
      }
      if (operator === '=' && typeof target === 'string' && (target.includes('*') || target.includes('?'))) {
        return wildcardPattern(target).test(toDisplayString(value))
      }
      const left = numericOrNull(value)
      const right = numericOrNull(target)
      if (left !== null && right !== null) {
        if (operator === '=') return left === right
        if (operator === '<>') return left !== right
        if (operator === '<') return left < right
        if (operator === '>') return left > right
        if (operator === '<=') return left <= right
        if (operator === '>=') return left >= right
      }
      const a = toDisplayString(value).toLowerCase()
      const b = toDisplayString(target).toLowerCase()
      if (operator === '=') return a === b
      if (operator === '<>') return a !== b
      if (operator === '<') return a < b
      if (operator === '>') return a > b
      if (operator === '<=') return a <= b
      if (operator === '>=') return a >= b
      return false
    }

    function formatTextValue(value, format) {
      if (isErrorValue(value)) throw new FormulaError(value.__error)
      if (typeof value !== 'number') return toDisplayString(value)
      const spec = String(format ?? '')
      if (spec === '') return formatNumber(value)
      const decimalPart = spec.includes('.') ? spec.split('.')[1] : ''
      const decimals = Math.min(10, (decimalPart.match(/[0#]+/) ?? [''])[0].length)
      const grouping = /#,##|0,000/.test(spec)
      let number = value
      let suffix = ''
      if (spec.includes('%')) {
        number *= 100
        suffix = '%'
      }
      try {
        return (
          number.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
            useGrouping: grouping,
          }) + suffix
        )
      } catch {
        return formatNumber(number) + suffix
      }
    }

    function roundUp(value, digits) {
      const factor = Math.pow(10, digits)
      const sign = value < 0 ? -1 : 1
      return (sign * Math.ceil(Math.abs(value) * factor)) / factor
    }

    function roundDown(value, digits) {
      const factor = Math.pow(10, digits)
      const sign = value < 0 ? -1 : 1
      return (sign * Math.floor(Math.abs(value) * factor)) / factor
    }

    function callFunction(name, args) {
      const values = flattenArgs(args)
      const numbers = () => {
        const out = []
        for (const value of values) {
          if (isErrorValue(value)) throw new FormulaError(value.__error)
          if (typeof value === 'number') out.push(value)
          else if (typeof value === 'boolean') out.push(value ? 1 : 0)
          else if (typeof value === 'string' && numericString(value)) out.push(Number(value))
        }
        return out
      }
      switch (name) {
        case 'SUM': {
          return numbers().reduce((sum, value) => sum + value, 0)
        }
        case 'AVERAGE':
        case 'AVG': {
          const list = numbers()
          if (list.length === 0) throw new FormulaError('#DIV/0!')
          return list.reduce((sum, value) => sum + value, 0) / list.length
        }
        case 'MIN': {
          const list = numbers()
          return list.length === 0 ? 0 : Math.min(...list)
        }
        case 'MAX': {
          const list = numbers()
          return list.length === 0 ? 0 : Math.max(...list)
        }
        case 'COUNT': {
          return numbers().length
        }
        case 'COUNTA': {
          let count = 0
          for (const value of values) {
            if (isErrorValue(value)) continue
            if (value === null || value === undefined || value === '') continue
            count += 1
          }
          return count
        }
        case 'IF': {
          if (args.length < 2) throw new FormulaError('#ERROR!')
          return truthy(args[0]) ? args[1] : (args.length > 2 ? args[2] : false)
        }
        case 'AND': {
          for (const value of values) if (!truthy(value)) return false
          return values.length > 0
        }
        case 'OR': {
          for (const value of values) if (truthy(value)) return true
          return false
        }
        case 'NOT': {
          return !truthy(args[0])
        }
        case 'ROUND': {
          const value = toNumber(args[0])
          const digits = args.length > 1 ? Math.trunc(toNumber(args[1])) : 0
          const factor = Math.pow(10, digits)
          return Math.round(value * factor) / factor
        }
        case 'ROUNDUP': {
          return roundUp(toNumber(args[0]), args.length > 1 ? Math.trunc(toNumber(args[1])) : 0)
        }
        case 'ROUNDDOWN': {
          return roundDown(toNumber(args[0]), args.length > 1 ? Math.trunc(toNumber(args[1])) : 0)
        }
        case 'PI': {
          return Math.PI
        }
        case 'DEGREES': {
          return (toNumber(args[0]) * 180) / Math.PI
        }
        case 'RADIANS': {
          return (toNumber(args[0]) * Math.PI) / 180
        }
        case 'SIN': {
          return Math.sin(toNumber(args[0]))
        }
        case 'COS': {
          return Math.cos(toNumber(args[0]))
        }
        case 'TAN': {
          return Math.tan(toNumber(args[0]))
        }
        case 'ASIN': {
          return Math.asin(toNumber(args[0]))
        }
        case 'ACOS': {
          return Math.acos(toNumber(args[0]))
        }
        case 'ATAN': {
          return Math.atan(toNumber(args[0]))
        }
        case 'ATAN2': {
          return Math.atan2(toNumber(args[0]), toNumber(args[1]))
        }
        case 'TEXT': {
          if (args.length < 2) throw new FormulaError('#ERROR!')
          return formatTextValue(args[0], args[1])
        }
        case 'SUMIF': {
          if (args.length < 2) throw new FormulaError('#ERROR!')
          const range = rangeList(args[0])
          const sumRange = args.length > 2 ? rangeList(args[2]) : range
          let total = 0
          for (let index = 0; index < range.length; index += 1) {
            if (!criteriaMatches(range[index], args[1])) continue
            const number = numericOrNull(sumRange[index])
            if (number !== null) total += number
          }
          return total
        }
        case 'SUMIFS': {
          if (args.length < 3) throw new FormulaError('#ERROR!')
          const sumRange = rangeList(args[0])
          const pairs = []
          for (let index = 1; index + 1 < args.length; index += 2) {
            pairs.push([rangeList(args[index]), args[index + 1]])
          }
          let total = 0
          for (let index = 0; index < sumRange.length; index += 1) {
            let matched = true
            for (const [range, criteria] of pairs) {
              if (!criteriaMatches(range[index], criteria)) {
                matched = false
                break
              }
            }
            if (!matched) continue
            const number = numericOrNull(sumRange[index])
            if (number !== null) total += number
          }
          return total
        }
        case 'COUNTIF': {
          if (args.length < 2) throw new FormulaError('#ERROR!')
          const range = rangeList(args[0])
          let count = 0
          for (const value of range) if (criteriaMatches(value, args[1])) count += 1
          return count
        }
        case 'AVERAGEIF': {
          if (args.length < 2) throw new FormulaError('#ERROR!')
          const range = rangeList(args[0])
          const averageRange = args.length > 2 ? rangeList(args[2]) : range
          let total = 0
          let count = 0
          for (let index = 0; index < range.length; index += 1) {
            if (!criteriaMatches(range[index], args[1])) continue
            const number = numericOrNull(averageRange[index])
            if (number !== null) {
              total += number
              count += 1
            }
          }
          if (count === 0) throw new FormulaError('#DIV/0!')
          return total / count
        }
        case 'IFERROR': {
          const value = args[0]
          return isErrorValue(value) ? (args.length > 1 ? args[1] : '') : value
        }
        case 'ABS': {
          return Math.abs(toNumber(args[0]))
        }
        case 'SQRT': {
          const value = toNumber(args[0])
          if (value < 0) throw new FormulaError('#NUM!')
          return Math.sqrt(value)
        }
        case 'POWER': {
          return Math.pow(toNumber(args[0]), toNumber(args[1]))
        }
        case 'LEN': {
          return toDisplayString(args[0]).length
        }
        case 'UPPER': {
          return toDisplayString(args[0]).toUpperCase()
        }
        case 'LOWER': {
          return toDisplayString(args[0]).toLowerCase()
        }
        case 'TRIM': {
          return toDisplayString(args[0]).trim()
        }
        case 'CONCAT':
        case 'CONCATENATE': {
          return values.map((value) => toDisplayString(value)).join('')
        }
        default:
          throw new FormulaError('#NAME?')
      }
    }

    function evaluateFormula(source, sheet, currentRow, currentCol, cache, stack, book) {
      const tokens = tokenizeFormula(source)
      let pos = 0

      const peek = () => tokens[pos]
      const take = () => tokens[pos++]
      const expect = (type) => {
        const token = take()
        if (!token || token.type !== type) throw new FormulaError('#ERROR!')
        return token
      }

      function parseExpression() {
        return parseComparison()
      }

      function parseComparison() {
        let left = parseAdditive()
        while (peek() && peek().type === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(peek().value)) {
          const op = take().value
          const right = parseAdditive()
          left = compareValues(left, right, op)
        }
        return left
      }

      function parseAdditive() {
        let left = parseMultiplicative()
        while (peek() && peek().type === 'op' && ['+', '-', '&'].includes(peek().value)) {
          const op = take().value
          const right = parseMultiplicative()
          if (op === '&') {
            left = `${toDisplayString(left)}${toDisplayString(right)}`
          } else {
            const a = toNumber(left)
            const b = toNumber(right)
            left = op === '+' ? a + b : a - b
          }
        }
        return left
      }

      function parseMultiplicative() {
        let left = parsePower()
        while (peek() && peek().type === 'op' && ['*', '/'].includes(peek().value)) {
          const op = take().value
          const right = parsePower()
          const a = toNumber(left)
          const b = toNumber(right)
          if (op === '/' && b === 0) throw new FormulaError('#DIV/0!')
          left = op === '*' ? a * b : a / b
        }
        return left
      }

      function parsePower() {
        let left = parseUnary()
        while (peek() && peek().type === 'op' && peek().value === '^') {
          take()
          const right = parseUnary()
          left = Math.pow(toNumber(left), toNumber(right))
        }
        return left
      }

      function parseUnary() {
        if (peek() && peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
          const op = take().value
          const value = toNumber(parseUnary())
          return op === '-' ? -value : value
        }
        return parsePostfix()
      }

      function parsePostfix() {
        let value = parsePrimary()
        while (peek() && peek().type === 'op' && peek().value === '%') {
          take()
          value = toNumber(value) / 100
        }
        return value
      }

      function parseSheetReference(token) {
        if (!peek() || peek().type !== '!') return null
        take()
        const targetSheet = book && Array.isArray(book.sheets)
          ? book.sheets.find((candidate) => candidate.name.toLowerCase() === String(token.value).toLowerCase())
          : null
        if (!targetSheet) throw new FormulaError('#REF!')
        const first = take()
        if (!first || first.type !== 'cell') throw new FormulaError('#REF!')
        if (peek() && peek().type === ':') {
          take()
          const last = take()
          if (!last || last.type !== 'cell') throw new FormulaError('#REF!')
          return rangeValues(first.value, last.value, targetSheet, currentRow, currentCol, cache, stack, book)
        }
        const ref = parseA1(first.value)
        if (!ref) throw new FormulaError('#REF!')
        return cellValue(targetSheet, ref.row, ref.col, cache, stack, book)
      }

      function parsePrimary() {
        const token = peek()
        if (!token) throw new FormulaError('#ERROR!')
        if (token.type === 'number') {
          take()
          return token.value
        }
        if (token.type === 'string') {
          take()
          const sheetReference = parseSheetReference(token)
          if (sheetReference !== null) return sheetReference
          return token.value
        }
        if (token.type === '(') {
          take()
          const value = parseExpression()
          expect(')')
          return value
        }
        if (token.type === 'cell') {
          take()
          const sheetReference = parseSheetReference(token)
          if (sheetReference !== null) return sheetReference
          if (peek() && peek().type === ':') {
            take()
            const end = take()
            if (!end || end.type !== 'cell') throw new FormulaError('#REF!')
            return rangeValues(token.value, end.value, sheet, currentRow, currentCol, cache, stack, book)
          }
          const ref = parseA1(token.value)
          if (!ref) throw new FormulaError('#REF!')
          return cellValue(sheet, ref.row, ref.col, cache, stack, book)
        }
        if (token.type === 'name') {
          take()
          const sheetReference = parseSheetReference(token)
          if (sheetReference !== null) return sheetReference
          if (peek() && peek().type === '(') {
            take()
            const args = []
            if (peek() && peek().type !== ')') {
              while (true) {
                if (peek() && peek().type === ',') {
                  args.push('')
                  take()
                  continue
                }
                args.push(parseExpression())
                if (peek() && peek().type === ',') {
                  take()
                  continue
                }
                break
              }
            }
            expect(')')
            return callFunction(token.value, args)
          }
          if (token.value === 'TRUE') return true
          if (token.value === 'FALSE') return false
          throw new FormulaError('#NAME?')
        }
        throw new FormulaError('#ERROR!')
      }

      const result = parseExpression()
      if (pos < tokens.length) throw new FormulaError('#ERROR!')
      return result
    }

    function displayValue(value) {
      if (isErrorValue(value)) return value.__error
      if (value && typeof value === 'object' && Array.isArray(value.__range)) return '#VALUE!'
      if (typeof value === 'number') return formatNumber(value)
      if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
      if (value === null || value === undefined) return ''
      return String(value)
    }

    function cellDisplay(sheet, row, col, cache, stack, book) {
      const raw = sheet?.rows[row]?.[col] ?? ''
      const formula = typeof raw === 'string' && raw.startsWith('=') && raw.length > 1
      const value = cellValue(sheet, row, col, cache, stack, book)
      return {
        raw: typeof raw === 'string' ? raw : cellText(raw),
        text: displayValue(value),
        numeric: typeof value === 'number',
        error: isErrorValue(value),
        formula,
      }
    }

    // ---------------------------------------------------------------------
    // CSV
    // ---------------------------------------------------------------------

    function detectDelimiter(input) {
      const firstLines = String(input ?? '').split(/\r?\n/).slice(0, 5).join('\n')
      const counts = { '\t': 0, ',': 0, ';': 0 }
      let quoted = false
      for (let i = 0; i < firstLines.length; i += 1) {
        const ch = firstLines[i]
        if (ch === '"') quoted = !quoted
        else if (!quoted && Object.hasOwn(counts, ch)) counts[ch] += 1
      }
      let best = ','
      let bestCount = 0
      for (const [delimiter, count] of Object.entries(counts)) {
        if (count > bestCount) {
          best = delimiter
          bestCount = count
        }
      }
      return best
    }

    function parseDelimited(input, delimiter) {
      const text = String(input ?? '').replace(/^\uFEFF/, '')
      const rows = []
      let row = []
      let field = ''
      let quoted = false
      for (let i = 0; i < text.length; i += 1) {
        const ch = text[i]
        if (quoted) {
          if (ch === '"') {
            if (text[i + 1] === '"') {
              field += '"'
              i += 1
            } else {
              quoted = false
            }
          } else {
            field += ch
          }
          continue
        }
        if (ch === '"') {
          quoted = true
          continue
        }
        if (ch === delimiter) {
          row.push(field)
          field = ''
          continue
        }
        if (ch === '\n' || ch === '\r') {
          if (ch === '\r' && text[i + 1] === '\n') i += 1
          row.push(field)
          rows.push(row)
          if (rows.length >= MAX_ROWS) break
          row = []
          field = ''
          continue
        }
        field += ch
      }
      row.push(field)
      rows.push(row)
      if (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') rows.pop()
      return normalizeRows(rows)
    }

    function toDelimited(rows, delimiter) {
      const escape = (value) => {
        const raw = cellText(value)
        if (raw.includes('"') || raw.includes(delimiter) || /[\r\n]/.test(raw)) {
          return `"${raw.replace(/"/g, '""')}"`
        }
        return raw
      }
      return rows.map((row) => row.map(escape).join(delimiter)).join('\r\n')
    }

    // ---------------------------------------------------------------------
    // XLSX read/write (self-contained, no external library)
    // ---------------------------------------------------------------------

    function xmlEscape(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
    }

    function safeSheetName(value, fallback) {
      const cleaned = String(value ?? '')
        .replace(/[\[\]:*?/\\]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 31)
      return cleaned || fallback
    }

    function uniqueNames(names) {
      const out = []
      const taken = new Set()
      for (let index = 0; index < names.length; index += 1) {
        const base = safeSheetName(names[index], `Sheet ${index + 1}`)
        let candidate = base
        let n = 2
        while (taken.has(candidate.toLowerCase())) {
          candidate = `${base.slice(0, 27)} ${n}`
          n += 1
        }
        taken.add(candidate.toLowerCase())
        out.push(candidate)
      }
      return out
    }

    function crc32Table() {
      const table = new Uint32Array(256)
      for (let n = 0; n < 256; n += 1) {
        let c = n
        for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
        table[n] = c >>> 0
      }
      return table
    }

    const CRC_TABLE = crc32Table()

    function crc32(bytes) {
      let crc = 0xffffffff
      for (let i = 0; i < bytes.length; i += 1) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
      return (crc ^ 0xffffffff) >>> 0
    }

    async function deflateRaw(bytes) {
      if (typeof CompressionStream !== 'function') return { method: 0, bytes }
      try {
        const stream = new CompressionStream('deflate-raw')
        const readPromise = new Response(stream.readable).arrayBuffer()
        const writer = stream.writable.getWriter()
        await writer.write(bytes)
        await writer.close()
        const buffer = await readPromise
        return { method: 8, bytes: new Uint8Array(buffer) }
      } catch {
        return { method: 0, bytes }
      }
    }

    async function inflateRaw(bytes) {
      if (typeof DecompressionStream !== 'function') throw new Error('UNSUPPORTED_DEFLATE')
      const stream = new DecompressionStream('deflate-raw')
      const readPromise = new Response(stream.readable).arrayBuffer()
      const writer = stream.writable.getWriter()
      await writer.write(bytes)
      await writer.close()
      const buffer = await readPromise
      return new Uint8Array(buffer)
    }

    function u16(value) {
      const out = new Uint8Array(2)
      new DataView(out.buffer).setUint16(0, value & 0xffff, true)
      return out
    }

    function u32(value) {
      const out = new Uint8Array(4)
      new DataView(out.buffer).setUint32(0, value >>> 0, true)
      return out
    }

    function concatBytes(parts) {
      let length = 0
      for (const part of parts) length += part.length
      const out = new Uint8Array(length)
      let offset = 0
      for (const part of parts) {
        out.set(part, offset)
        offset += part.length
      }
      return out
    }

    async function zipFiles(files) {
      const encoder = new TextEncoder()
      const localParts = []
      const centralParts = []
      let offset = 0
      for (const file of files) {
        const nameBytes = encoder.encode(file.name)
        const data = file.data instanceof Uint8Array ? file.data : encoder.encode(String(file.data ?? ''))
        const compressed = await deflateRaw(data)
        const crc = crc32(data)
        const local = concatBytes([
          u32(0x04034b50),
          u16(20),
          u16(0),
          u16(compressed.method),
          u16(0),
          u16(0x21),
          u32(crc),
          u32(compressed.bytes.length),
          u32(data.length),
          u16(nameBytes.length),
          u16(0),
          nameBytes,
          compressed.bytes,
        ])
        localParts.push(local)
        centralParts.push(concatBytes([
          u32(0x02014b50),
          u16(20),
          u16(20),
          u16(0),
          u16(compressed.method),
          u16(0),
          u16(0x21),
          u32(crc),
          u32(compressed.bytes.length),
          u32(data.length),
          u16(nameBytes.length),
          u16(0),
          u16(0),
          u16(0),
          u16(0),
          u32(0),
          u32(offset),
          nameBytes,
        ]))
        offset += local.length
      }
      const central = concatBytes(centralParts)
      const end = concatBytes([
        u32(0x06054b50),
        u16(0),
        u16(0),
        u16(files.length),
        u16(files.length),
        u32(central.length),
        u32(offset),
        u16(0),
      ])
      return concatBytes([...localParts, central, end])
    }

    async function unzipFiles(buffer) {
      const bytes = new Uint8Array(buffer)
      const view = new DataView(bytes.buffer)
      let eocd = -1
      for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i -= 1) {
        if (view.getUint32(i, true) === 0x06054b50) {
          eocd = i
          break
        }
      }
      if (eocd < 0) throw new Error('Not a ZIP file')
      const count = view.getUint16(eocd + 10, true)
      const centralOffset = view.getUint32(eocd + 16, true)
      const files = new Map()
      let pointer = centralOffset
      let totalUncompressed = 0
      const decoder = new TextDecoder()
      for (let index = 0; index < count; index += 1) {
        if (view.getUint32(pointer, true) !== 0x02014b50) throw new Error('Bad ZIP directory')
        const method = view.getUint16(pointer + 10, true)
        const compressedSize = view.getUint32(pointer + 20, true)
        const uncompressedSize = view.getUint32(pointer + 24, true)
        if (compressedSize === 0xffffffff || uncompressedSize === 0xffffffff) throw new Error('ZIP64 is not supported')
        totalUncompressed += uncompressedSize
        if (totalUncompressed > 60 * 1024 * 1024) throw new Error('The workbook is too large to import')
        const nameLength = view.getUint16(pointer + 28, true)
        const extraLength = view.getUint16(pointer + 30, true)
        const commentLength = view.getUint16(pointer + 32, true)
        const localOffset = view.getUint32(pointer + 42, true)
        const name = decoder.decode(bytes.subarray(pointer + 46, pointer + 46 + nameLength))
        pointer += 46 + nameLength + extraLength + commentLength
        if (view.getUint32(localOffset, true) !== 0x04034b50) throw new Error('Bad ZIP entry')
        const localNameLength = view.getUint16(localOffset + 26, true)
        const localExtraLength = view.getUint16(localOffset + 28, true)
        const dataStart = localOffset + 30 + localNameLength + localExtraLength
        const compressed = bytes.subarray(dataStart, dataStart + compressedSize)
        let data
        if (compressedSize === 0) data = new Uint8Array(0)
        else if (method === 0) data = compressed
        else if (method === 8) data = await inflateRaw(compressed)
        else throw new Error(`Unsupported ZIP compression ${method}`)
        files.set(name, data)
      }
      return files
    }

    function normalizeZipPath(value) {
      const parts = []
      for (const part of String(value ?? '').split('/')) {
        if (part === '' || part === '.') continue
        if (part === '..') {
          parts.pop()
          continue
        }
        parts.push(part)
      }
      return parts.join('/')
    }

    function parseXml(text) {
      const doc = new DOMParser().parseFromString(String(text ?? ''), 'application/xml')
      if (
        doc.getElementsByTagName('parsererror').length > 0 ||
        (typeof doc.querySelector === 'function' && doc.querySelector('parsererror') !== null)
      ) {
        throw new Error('Invalid XML')
      }
      return doc
    }

    function xmlText(node) {
      return node ? node.textContent ?? '' : ''
    }

    async function readXlsxFile(file) {
      const zip = await unzipFiles(await file.arrayBuffer())
      const decoder = new TextDecoder()
      const workbookFile = zip.get('xl/workbook.xml')
      if (!workbookFile) throw new Error('Workbook part is missing')
      const workbookXml = parseXml(decoder.decode(workbookFile))
      const relsFile = zip.get('xl/_rels/workbook.xml.rels')
      const rels = new Map()
      if (relsFile) {
        const relsXml = parseXml(decoder.decode(relsFile))
        for (const rel of relsXml.getElementsByTagName('Relationship')) {
          const id = rel.getAttribute('Id')
          const target = rel.getAttribute('Target')
          if (id && target) rels.set(id, target)
        }
      }
      const sharedStrings = []
      const sharedFile = zip.get('xl/sharedStrings.xml')
      if (sharedFile) {
        const sharedXml = parseXml(decoder.decode(sharedFile))
        for (const si of sharedXml.getElementsByTagName('si')) {
          let value = ''
          for (const t of si.getElementsByTagName('t')) value += xmlText(t)
          sharedStrings.push(value)
        }
      }
      const fills = []
      const cellXfs = []
      const stylesFile = zip.get('xl/styles.xml')
      if (stylesFile) {
        const stylesXml = parseXml(decoder.decode(stylesFile))
        for (const fill of stylesXml.getElementsByTagName('fill')) {
          const pattern = fill.getElementsByTagName('patternFill')[0]
          const fg = pattern?.getElementsByTagName('fgColor')[0]
          const bg = pattern?.getElementsByTagName('bgColor')[0]
          let rgb = fg?.getAttribute('rgb') || bg?.getAttribute('rgb') || ''
          if (rgb.length === 8) rgb = rgb.slice(-6)
          fills.push(/^[0-9a-f]{6}$/i.test(rgb) ? `#${rgb.toUpperCase()}` : null)
        }
        const cellXfsNode = stylesXml.getElementsByTagName('cellXfs')[0]
        if (cellXfsNode) {
          for (const xf of cellXfsNode.getElementsByTagName('xf')) cellXfs.push(Number(xf.getAttribute('fillId')) || 0)
        }
      }
      const sheetNodes = [...workbookXml.getElementsByTagName('sheet')]
      const sheets = []
      for (const [index, sheetNode] of sheetNodes.entries()) {
        const name = sheetNode.getAttribute('name') || `Sheet ${index + 1}`
        const relId = sheetNode.getAttribute('r:id') || sheetNode.getAttribute('id')
        const target = rels.get(relId)
        const rawPath = target
          ? target.startsWith('/')
            ? target.slice(1)
            : `xl/${target.replace(/^\.\//, '')}`
          : `xl/worksheets/sheet${index + 1}.xml`
        const path = normalizeZipPath(rawPath)
        const sheetFile = zip.get(path)
        if (!sheetFile) continue
        const sheetXml = parseXml(decoder.decode(sheetFile))
        const rows = []
        const formats = {}
        const colWidths = {}
        const colsNode = sheetXml.getElementsByTagName('cols')[0]
        if (colsNode) {
          for (const col of colsNode.getElementsByTagName('col')) {
            const min = Number(col.getAttribute('min'))
            const max = Number(col.getAttribute('max'))
            const width = Number(col.getAttribute('width'))
            if (!Number.isInteger(min) || !Number.isInteger(max) || !Number.isFinite(width) || width <= 0) continue
            for (let c = Math.max(0, min - 1); c < Math.min(MAX_COLS, max); c += 1) {
              colWidths[String(c)] = Math.round(Math.max(60, Math.min(600, width * 7 + 5)))
            }
          }
        }
        for (const rowNode of sheetXml.getElementsByTagName('row')) {
          const rowNumber = Math.max(1, Number(rowNode.getAttribute('r')) || rows.length + 1)
          const row = []
          let nextCol = 0
          for (const cellNode of rowNode.getElementsByTagName('c')) {
            const ref = cellNode.getAttribute('r')
            const parsed = ref ? parseA1(ref) : null
            const targetCol = parsed ? parsed.col : nextCol
            nextCol = targetCol + 1
            const type = cellNode.getAttribute('t') || ''
            const formulaNode = cellNode.getElementsByTagName('f')[0]
            const valueNode = cellNode.getElementsByTagName('v')[0]
            let value = ''
            if (formulaNode && xmlText(formulaNode).trim() !== '') {
              value = `=${xmlText(formulaNode)}`
            } else if (type === 'inlineStr') {
              let inline = ''
              for (const t of cellNode.getElementsByTagName('t')) inline += xmlText(t)
              value = inline
            } else if (type === 's') {
              value = sharedStrings[Number(xmlText(valueNode))] ?? ''
            } else if (type === 'b') {
              value = xmlText(valueNode) === '1' ? 'TRUE' : 'FALSE'
            } else {
              value = xmlText(valueNode)
            }
            while (row.length < targetCol) row.push('')
            row[targetCol] = value
            const styleIndex = Number(cellNode.getAttribute('s')) || 0
            const fillId = cellXfs[styleIndex] ?? 0
            const fill = fills[fillId]
            if (fill && fill !== '#FFFFFF' && Object.keys(formats).length < 50000) {
              formats[`${rowNumber - 1}:${targetCol}`] = { fill }
            }
          }
          while (rows.length < rowNumber - 1) rows.push([])
          rows[rowNumber - 1] = row
        }
        sheets.push({ name: safeSheetName(name, `Sheet ${index + 1}`), rows: normalizeRows(rows), formats, colWidths })
      }
      if (sheets.length === 0) throw new Error('Workbook has no sheets')
      return sheets
    }


    function createStyleRegistry(sheets) {
      const fills = [null, 'gray125']
      const fillMap = new Map()
      const fonts = [{ bold: false, italic: false, color: null }]
      const fontMap = new Map([['0|0|', 0]])
      const xfs = [{ fontId: 0, fillId: 0, align: null, wrap: false }]
      const xfMap = new Map([['0|0||0', 0]])

      function fillIndex(color) {
        if (!color) return 0
        if (fillMap.has(color)) return fillMap.get(color)
        const index = fills.length
        fills.push(color)
        fillMap.set(color, index)
        return index
      }

      function fontIndex(bold, italic, color) {
        const key = `${bold ? 1 : 0}|${italic ? 1 : 0}|${color ?? ''}`
        if (fontMap.has(key)) return fontMap.get(key)
        const index = fonts.length
        fonts.push({ bold, italic, color })
        fontMap.set(key, index)
        return index
      }

      function xfIndex(format) {
        if (!format) return 0
        const fillId = format.fill ? fillIndex(format.fill) : 0
        const color = format.color ?? (format.fill ? contrastColor(format.fill) : null)
        const fontId = fontIndex(format.bold === true, format.italic === true, color)
        const align = format.align === 'left' || format.align === 'center' || format.align === 'right' ? format.align : null
        const wrap = format.wrap === true
        if (fillId === 0 && fontId === 0 && align === null && wrap === false) return 0
        const key = `${fontId}|${fillId}|${align ?? ''}|${wrap ? 1 : 0}`
        if (xfMap.has(key)) return xfMap.get(key)
        const index = xfs.length
        xfs.push({ fontId, fillId, align, wrap })
        xfMap.set(key, index)
        return index
      }

      for (const sheet of sheets) {
        for (const format of Object.values(sheet.formats ?? {})) xfIndex(format)
      }

      function xml() {
        const fontXml = fonts.map((font) => {
          const color = font.color ? `<color rgb="FF${font.color.slice(1)}"/>` : ''
          return `<font>${font.bold ? '<b/>' : ''}${font.italic ? '<i/>' : ''}<sz val="11"/>${color}<name val="Calibri"/></font>`
        }).join('')
        const fillXml = fills.map((color, index) => {
          if (index === 0) return '<fill><patternFill patternType="none"/></fill>'
          if (index === 1) return '<fill><patternFill patternType="gray125"/></fill>'
          return `<fill><patternFill patternType="solid"><fgColor rgb="FF${color.slice(1)}"/><bgColor indexed="64"/></patternFill></fill>`
        }).join('')
        const xfXml = xfs.map((xf, index) => {
          const applyFont = xf.fontId > 0 ? ' applyFont="1"' : ''
          const applyFill = xf.fillId > 0 ? ' applyFill="1"' : ''
          const attributes = []
          if (xf.align) attributes.push(`horizontal="${xf.align}"`)
          if (xf.wrap) {
            attributes.push('wrapText="1"')
            attributes.push('vertical="top"')
          }
          const alignment = attributes.length > 0 ? `<alignment ${attributes.join(' ')}/>` : ''
          const applyAlignment = alignment ? ' applyAlignment="1"' : ''
          return `<xf numFmtId="0" fontId="${xf.fontId}" fillId="${xf.fillId}" borderId="0" xfId="0"${applyFont}${applyFill}${applyAlignment}>${alignment}</xf>`
        }).join('')
        return [
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
          '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
          `<fonts count="${fonts.length}">${fontXml}</fonts>`,
          `<fills count="${fills.length}">${fillXml}</fills>`,
          '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>',
          '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>',
          `<cellXfs count="${xfs.length}">${xfXml}</cellXfs>`,
          '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>',
          '</styleSheet>',
        ].join('')
      }

      return { xfIndex, xml }
    }

    function cellXml(ref, raw, cache, stack, sheet, row, col, book, styleIndex) {
      const style = styleIndex > 0 ? ` s="${styleIndex}"` : ''
      if (raw === '') return styleIndex > 0 ? `<c r="${ref}"${style}/>` : ''
      const display = cellDisplay(sheet, row, col, cache, stack, book)
      if (display.formula) {
        const formula = display.raw.slice(1)
        if (display.error) {
          return `<c r="${ref}"${style} t="e"><f>${xmlEscape(formula)}</f><v>${xmlEscape(display.text)}</v></c>`
        }
        if (display.numeric) {
          return `<c r="${ref}"${style}><f>${xmlEscape(formula)}</f><v>${display.text}</v></c>`
        }
        if (display.text === 'TRUE' || display.text === 'FALSE') {
          return `<c r="${ref}"${style} t="b"><f>${xmlEscape(formula)}</f><v>${display.text === 'TRUE' ? '1' : '0'}</v></c>`
        }
        return `<c r="${ref}"${style} t="str"><f>${xmlEscape(formula)}</f><v>${xmlEscape(display.text)}</v></c>`
      }
      if (display.numeric && /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(display.raw.trim())) {
        return `<c r="${ref}"${style}><v>${xmlEscape(display.raw.trim())}</v></c>`
      }
      if (display.raw.toUpperCase() === 'TRUE' || display.raw.toUpperCase() === 'FALSE') {
        return `<c r="${ref}"${style} t="b"><v>${display.raw.toUpperCase() === 'TRUE' ? '1' : '0'}</v></c>`
      }
      return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${xmlEscape(display.raw)}</t></is></c>`
    }

    function sheetXml(sheet, book, styleRegistry) {
      const names = uniqueNames([sheet.name])
      let formatWidth = 0
      let formatHeight = 0
      const formatWidthByRow = new Map()
      for (const key of Object.keys(sheet.formats ?? {})) {
        const [row, col] = key.split(':').map(Number)
        if (!Number.isInteger(row) || !Number.isInteger(col)) continue
        formatWidth = Math.max(formatWidth, col + 1)
        formatHeight = Math.max(formatHeight, row + 1)
        formatWidthByRow.set(row, Math.max(formatWidthByRow.get(row) ?? 0, col + 1))
      }
      const widthValues = Object.keys(sheet.colWidths ?? {}).map((key) => Number(key) + 1)
      const width = Math.max(1, maxCols(sheet.rows), formatWidth, ...(widthValues.length > 0 ? widthValues : [0]))
      const height = Math.max(1, sheet.rows.length, formatHeight)
      const lines = []
      lines.push('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
      lines.push('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">')
      lines.push(`<dimension ref="A1:${colLetter(width - 1)}${height}"/>`)
      lines.push('<sheetViews><sheetView workbookViewId="0"/></sheetViews>')
      lines.push('<sheetFormatPr defaultRowHeight="15"/>')
      lines.push('<cols>')
      for (let c = 0; c < width; c += 1) {
        const pixels = Number(sheet.colWidths?.[String(c)] ?? 150)
        const units = Math.max(8, Math.round(pixels / 7))
        lines.push(`<col min="${c + 1}" max="${c + 1}" width="${units}" customWidth="1"/>`)
      }
      lines.push('</cols>')
      lines.push('<sheetData>')
      const cache = new Map()
      for (let r = 0; r < height; r += 1) {
        const row = sheet.rows[r] ?? []
        const rowWidth = Math.max(row.length, formatWidthByRow.get(r) ?? 0)
        if (rowWidth === 0) continue
        lines.push(`<row r="${r + 1}">`)
        for (let c = 0; c < rowWidth; c += 1) {
          const raw = row[c] ?? ''
          const ref = `${colLetter(c)}${r + 1}`
          const styleIndex = styleRegistry ? styleRegistry.xfIndex(sheet.formats?.[`${r}:${c}`]) : 0
          const xml = cellXml(ref, raw, cache, new Set(), sheet, r, c, book, styleIndex)
          if (xml !== '') lines.push(xml)
        }
        lines.push('</row>')
      }
      lines.push('</sheetData>')
      lines.push('</worksheet>')
      return { name: names[0], xml: lines.join('') }
    }

    async function writeXlsxFile(book) {
      const sheetNames = uniqueNames(book.sheets.map((sheet) => sheet.name))
      const contentTypes = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
        '<Default Extension="xml" ContentType="application/xml"/>',
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
        ...book.sheets.map((_sheet, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`),
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
        '</Types>',
      ].join('')
      const rootRels = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>',
        '</Relationships>',
      ].join('')
      const workbook = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
        '<workbookPr/>',
        '<sheets>',
        ...book.sheets.map((_sheet, index) => `<sheet name="${xmlEscape(sheetNames[index])}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`),
        '</sheets>',
        '</workbook>',
      ].join('')
      const workbookRels = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
        ...book.sheets.map((_sheet, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`),
        `<Relationship Id="rId${book.sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`,
        '</Relationships>',
      ].join('')
      const styleRegistry = createStyleRegistry(book.sheets)
      const styles = styleRegistry.xml()
      const files = [
        { name: '[Content_Types].xml', data: contentTypes },
        { name: '_rels/.rels', data: rootRels },
        { name: 'xl/workbook.xml', data: workbook },
        { name: 'xl/_rels/workbook.xml.rels', data: workbookRels },
        { name: 'xl/styles.xml', data: styles },
      ]
      for (const [index, sheet] of book.sheets.entries()) {
        const built = sheetXml(sheet, book, styleRegistry)
        files.push({ name: `xl/worksheets/sheet${index + 1}.xml`, data: built.xml })
      }
      const zip = await zipFiles(files)
      return new Blob([zip], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    }

    // ---------------------------------------------------------------------
    // Remote data helpers
    // ---------------------------------------------------------------------

    async function apiCall(pathname, options = {}) {
      const response = await fetch(`${API}${pathname}`, {
        cache: 'no-store',
        headers: options.body ? { 'content-type': 'application/json' } : undefined,
        ...options,
      })
      let payload = null
      try {
        payload = await response.json()
      } catch {
        payload = null
      }
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error?.message || `Request failed (${response.status})`)
      }
      return payload
    }

    const api = {
      list: () => apiCall('/list'),
      get: (id) => apiCall(`/get?id=${encodeURIComponent(id)}`),
      create: (body) => apiCall('/create', { method: 'POST', body: JSON.stringify(body) }),
      op: (id, operation) => apiCall('/op', { method: 'POST', body: JSON.stringify({ id, operation }) }),
      remove: (id) => apiCall('/delete', { method: 'POST', body: JSON.stringify({ id }) }),
    }

    // ---------------------------------------------------------------------
    // Local (optimistic) operations
    // ---------------------------------------------------------------------


    function localColor(value) {
      if (value === null || value === undefined) return null
      let raw = String(value).trim().replace(/^#/, '')
      if (raw === '' || /^(none|auto|transparent)$/i.test(raw)) return null
      if (/^[0-9a-f]{3}$/i.test(raw)) raw = raw.split('').map((char) => char + char).join('')
      if (!/^[0-9a-f]{6}$/i.test(raw)) return null
      return `#${raw.toUpperCase()}`
    }

    function localShiftFormats(sheet, axis, start, count, mode) {
      const source = sheet.formats && typeof sheet.formats === 'object' ? sheet.formats : {}
      const out = {}
      for (const [key, value] of Object.entries(source)) {
        let [row, col] = key.split(':').map(Number)
        if (!Number.isInteger(row) || !Number.isInteger(col)) continue
        if (axis === 'row') {
          if (mode === 'insert') {
            if (row >= start) row += count
          } else {
            if (row >= start && row < start + count) continue
            if (row >= start + count) row -= count
          }
        } else if (mode === 'insert') {
          if (col >= start) col += count
        } else {
          if (col >= start && col < start + count) continue
          if (col >= start + count) col -= count
        }
        if (row < 0 || col < 0 || row >= MAX_ROWS || col >= MAX_COLS) continue
        out[`${row}:${col}`] = value
      }
      sheet.formats = out
    }

    function localShiftColWidths(sheet, start, count, mode) {
      const source = sheet.colWidths && typeof sheet.colWidths === 'object' ? sheet.colWidths : {}
      const out = {}
      for (const [key, value] of Object.entries(source)) {
        let col = Number(key)
        if (!Number.isInteger(col)) continue
        if (mode === 'insert') {
          if (col >= start) col += count
        } else {
          if (col >= start && col < start + count) continue
          if (col >= start + count) col -= count
        }
        if (col < 0 || col >= MAX_COLS) continue
        out[String(col)] = value
      }
      sheet.colWidths = out
    }

    function localApplyFormat(sheet, range, patch, clear) {
      if (!sheet || !range) return
      const formats = sheet.formats && typeof sheet.formats === 'object' ? sheet.formats : {}
      if (clear) {
        for (let row = range.startRow; row <= range.endRow; row += 1) {
          for (let col = range.startCol; col <= range.endCol; col += 1) delete formats[`${row}:${col}`]
        }
        sheet.formats = formats
        return
      }
      for (let row = range.startRow; row <= range.endRow; row += 1) {
        for (let col = range.startCol; col <= range.endCol; col += 1) {
          const key = `${row}:${col}`
          const next = { ...(formats[key] ?? {}) }
          if (Object.hasOwn(patch, 'fill')) {
            const fill = localColor(patch.fill)
            if (fill) next.fill = fill
            else delete next.fill
          }
          if (Object.hasOwn(patch, 'color')) {
            const color = localColor(patch.color)
            if (color) next.color = color
            else delete next.color
          }
          if (Object.hasOwn(patch, 'bold')) {
            if (patch.bold === true) next.bold = true
            else delete next.bold
          }
          if (Object.hasOwn(patch, 'italic')) {
            if (patch.italic === true) next.italic = true
            else delete next.italic
          }
          if (Object.hasOwn(patch, 'wrap')) {
            if (patch.wrap === true) next.wrap = true
            else delete next.wrap
          }
          if (Object.hasOwn(patch, 'align')) {
            if (patch.align === 'left' || patch.align === 'center' || patch.align === 'right') next.align = patch.align
            else delete next.align
          }
          if (Object.keys(next).length > 0) formats[key] = next
          else delete formats[key]
        }
      }
      sheet.formats = formats
    }

    function localApply(book, operation) {
      const next = clone(book)
      const sheet = operation.sheet ? findSheet(next, operation.sheet) : null
      const type = String(operation.type ?? '')
      switch (type) {
        case 'set_cells': {
          if (!sheet) return next
          const start = parseA1(operation.start ?? 'A1')
          if (!start) return next
          const values = Array.isArray(operation.values) ? operation.values : []
          if (values.length === 0) return next
          const width = Math.max(...values.map((row) => (Array.isArray(row) ? row.length : 1)))
          ensureSize(sheet.rows, start.row + values.length, start.col + width)
          for (let r = 0; r < values.length; r += 1) {
            const row = Array.isArray(values[r]) ? values[r] : [values[r]]
            for (let c = 0; c < row.length; c += 1) {
              sheet.rows[start.row + r][start.col + c] = cellText(row[c])
            }
          }
          for (const row of sheet.rows) trimTrailing(row)
          while (sheet.rows.length > 0 && sheet.rows[sheet.rows.length - 1].every((cell) => cell === '')) sheet.rows.pop()
          if (sheet.rows.length === 0) sheet.rows = [[]]
          return next
        }
        case 'append_rows': {
          if (!sheet) return next
          const values = Array.isArray(operation.values) ? operation.values : []
          for (const row of values) {
            const cells = (Array.isArray(row) ? row : [row]).map(cellText)
            sheet.rows.push(cells)
          }
          return next
        }
        case 'replace_rows': {
          if (!sheet) return next
          const rows = normalizeRows(operation.values)
          sheet.rows = rows.length > 0 ? rows : [[]]
          return next
        }
        case 'clear_range': {
          if (!sheet) return next
          const range = parseRange(operation.range ?? 'A1')
          if (!range) return next
          ensureSize(sheet.rows, range.endRow + 1, range.endCol + 1)
          for (let r = range.startRow; r <= range.endRow; r += 1) {
            for (let c = range.startCol; c <= range.endCol; c += 1) sheet.rows[r][c] = ''
          }
          for (const row of sheet.rows) trimTrailing(row)
          while (sheet.rows.length > 0 && sheet.rows[sheet.rows.length - 1].every((cell) => cell === '')) sheet.rows.pop()
          if (sheet.rows.length === 0) sheet.rows = [[]]
          return next
        }
        case 'rename_workbook': {
          next.name = String(operation.name ?? operation.new_name ?? next.name).trim().slice(0, 120) || next.name
          return next
        }
        case 'rename_sheet': {
          if (!sheet) return next
          sheet.name = uniqueSheetName(next, operation.name ?? operation.new_name ?? sheet.name, sheet.id)
          return next
        }
        case 'delete_sheet': {
          if (!sheet || next.sheets.length <= 1) return next
          next.sheets = next.sheets.filter((candidate) => candidate.id !== sheet.id)
          if (next.activeSheetId === sheet.id) next.activeSheetId = next.sheets[0].id
          return next
        }
        case 'set_active_sheet': {
          if (!sheet) return next
          next.activeSheetId = sheet.id
          return next
        }
        case 'add_rows': {
          if (!sheet) return next
          const count = Math.max(1, Math.min(1000, Math.floor(Number(operation.count) || 1)))
          const start = Math.max(0, Math.min(sheet.rows.length, Math.floor(Number(operation.start_row ?? sheet.rows.length + 1) || 1) - 1))
          const width = Math.max(1, maxCols(sheet.rows))
          localShiftFormats(sheet, 'row', start, count, 'insert')
          sheet.rows.splice(start, 0, ...Array.from({ length: count }, () => Array.from({ length: width }, () => '')))
          return next
        }
        case 'delete_rows': {
          if (!sheet) return next
          const count = Math.max(1, Math.min(1000, Math.floor(Number(operation.count) || 1)))
          const start = Math.max(0, Math.floor(Number(operation.start_row) || 1) - 1)
          localShiftFormats(sheet, 'row', start, count, 'delete')
          sheet.rows.splice(start, count)
          if (sheet.rows.length === 0) sheet.rows = [[]]
          return next
        }
        case 'add_columns': {
          if (!sheet) return next
          const count = Math.max(1, Math.min(50, Math.floor(Number(operation.count) || 1)))
          const start = colIndex(operation.start_column ?? '') ?? maxCols(sheet.rows)
          localShiftFormats(sheet, 'col', start, count, 'insert')
          localShiftColWidths(sheet, start, count, 'insert')
          ensureSize(sheet.rows, sheet.rows.length, Math.max(maxCols(sheet.rows), start))
          for (const row of sheet.rows) row.splice(start, 0, ...Array.from({ length: count }, () => ''))
          return next
        }
        case 'delete_columns': {
          if (!sheet) return next
          const count = Math.max(1, Math.min(50, Math.floor(Number(operation.count) || 1)))
          const start = colIndex(operation.start_column ?? '')
          if (start === null) return next
          localShiftFormats(sheet, 'col', start, count, 'delete')
          localShiftColWidths(sheet, start, count, 'delete')
          for (const row of sheet.rows) row.splice(start, count)
          for (const row of sheet.rows) trimTrailing(row)
          return next
        }
        case 'set_format': {
          if (!sheet) return next
          const range = parseRange(operation.range ?? operation.start ?? 'A1')
          if (!range) return next
          localApplyFormat(sheet, range, operation.patch ?? {}, false)
          return next
        }
        case 'clear_format': {
          if (!sheet) return next
          const range = parseRange(operation.range ?? operation.start ?? 'A1')
          if (!range) return next
          localApplyFormat(sheet, range, {}, true)
          return next
        }
        case 'set_col_width': {
          if (!sheet) return next
          const column = Number(operation.column)
          const width = Number(operation.width)
          if (!Number.isInteger(column) || column < 0 || column >= MAX_COLS) return next
          if (!Number.isFinite(width)) return next
          sheet.colWidths = { ...(sheet.colWidths ?? {}), [String(column)]: Math.round(Math.max(60, Math.min(600, width))) }
          return next
        }
        case 'set_col_widths': {
          if (!sheet) return next
          const widths = {}
          for (const [key, value] of Object.entries(operation.widths ?? {})) {
            const column = Number(key)
            const width = Number(value)
            if (!Number.isInteger(column) || column < 0 || column >= MAX_COLS) continue
            if (!Number.isFinite(width)) continue
            widths[String(column)] = Math.round(Math.max(60, Math.min(600, width)))
          }
          sheet.colWidths = { ...(sheet.colWidths ?? {}), ...widths }
          return next
        }
        default:
          return next
      }
    }

    // ---------------------------------------------------------------------
    // Icons
    // ---------------------------------------------------------------------

    function SheetGlyph({ size = 18, active = false }) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': true,
          style: { display: 'block', flex: 'none' },
        },
        h('rect', {
          x: 3.2,
          y: 2.2,
          width: 17.6,
          height: 19.6,
          rx: 3,
          stroke: 'currentColor',
          strokeWidth: 1.6,
          opacity: active ? 1 : 0.9,
        }),
        h('path', {
          d: 'M3.5 8.2h17M3.5 13h17M3.5 17.8h17M9.2 8.2v13.6M15 8.2v13.6',
          stroke: 'currentColor',
          strokeWidth: 1.2,
          opacity: 0.72,
        }),
        h('path', {
          d: 'M3.5 8.2h17',
          stroke: 'currentColor',
          strokeWidth: 1.8,
          opacity: active ? 1 : 0.85,
        }),
      )
    }


    const FILL_SWATCHES = [
      '#FFF2CC',
      '#FCE4D6',
      '#F8CBAD',
      '#DDEBF7',
      '#E2EFDA',
      '#E7E6E6',
      '#1F3864',
      '#111827',
    ]

    const TEXT_SWATCHES = [
      '#111827',
      '#FFFFFF',
      '#C00000',
      '#1F4E79',
      '#C65911',
      '#666666',
      '#7F6000',
      '#375623',
    ]

    function IconAlignLeft({ size = 16 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M4 6h16M4 10h10M4 14h16M4 18h8', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' }),
      )
    }

    function IconAlignCenter({ size = 16 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M4 6h16M7 10h10M4 14h16M8 18h8', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' }),
      )
    }

    function IconAlignRight({ size = 16 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M4 6h16M10 10h10M4 14h16M12 18h8', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' }),
      )
    }

    function IconWrap({ size = 16 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M4 6h16M4 11h12a3 3 0 0 1 0 6h-4m0 0 2-2m-2 2 2 2M4 17h4', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      )
    }

    function IconEraser({ size = 16 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'm5 15 6-6a2 2 0 0 1 3 0l4 4a2 2 0 0 1 0 3l-3 3H8l-3-3a2 2 0 0 1 0-1ZM9 19h11', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      )
    }

    function IconFit({ size = 16 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4M8 12h8', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      )
    }

    function IconPlus({ size = 16 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M12 5v14M5 12h14', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' }),
      )
    }

    function IconImport({ size = 16 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      )
    }

    function IconExport({ size = 16 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'M12 15V3m0 0 4 4m-4-4L8 7M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      )
    }

    function IconTrash({ size = 16 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'M4 7h16M10 11v6M14 11v6M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      )
    }

    function IconChevron({ size = 14, open = false }) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': true,
          style: { transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s ease' },
        },
        h('path', { d: 'm6 9 6 6 6-6', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      )
    }

    function IconRowPlus({ size = 16 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('rect', { x: 3, y: 4, width: 18, height: 6, rx: 1.5, stroke: 'currentColor', strokeWidth: 1.5 }),
        h('path', { d: 'M12 14v7M8.5 17.5h7', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' }),
      )
    }

    function IconRowMinus({ size = 16 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('rect', { x: 3, y: 4, width: 18, height: 6, rx: 1.5, stroke: 'currentColor', strokeWidth: 1.5 }),
        h('path', { d: 'M8.5 17.5h7', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' }),
      )
    }

    function IconColPlus({ size = 16 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('rect', { x: 4, y: 3, width: 6, height: 18, rx: 1.5, stroke: 'currentColor', strokeWidth: 1.5 }),
        h('path', { d: 'M17.5 12h4M19.5 10v4', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' }),
      )
    }

    function IconColMinus({ size = 16 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('rect', { x: 4, y: 3, width: 6, height: 18, rx: 1.5, stroke: 'currentColor', strokeWidth: 1.5 }),
        h('path', { d: 'M15.5 12h4', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' }),
      )
    }

    function IconSearch({ size = 14 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('circle', { cx: 11, cy: 11, r: 6.5, stroke: 'currentColor', strokeWidth: 1.6 }),
        h('path', { d: 'm16 16 4.5 4.5', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' }),
      )
    }

    function Spinner({ size = 14 }) {
      return h('span', {
        className: 'dsx-spinner',
        style: { width: size, height: size },
        'aria-hidden': true,
      })
    }

    // ---------------------------------------------------------------------
    // Error boundary
    // ---------------------------------------------------------------------

    class SheetErrorBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { failed: false }
      }

      static getDerivedStateFromError() {
        return { failed: true }
      }

      componentDidCatch(error) {
        console.error('[dsh-sheets] panel crashed', error)
      }

      render() {
        if (this.state.failed) {
          const t = this.props.t
          return h(
            'div',
            { className: 'dsx-root dsx-fatal' },
            h(SheetGlyph, { size: 34 }),
            h('h2', null, t('errorTitle')),
            h('p', null, t('errorBody')),
          )
        }
        return this.props.children
      }
    }

    // ---------------------------------------------------------------------
    // Styles
    // ---------------------------------------------------------------------

    const CSS = `
      .dsx-root {
        position: relative;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        background: var(--dsw-alias-bg-base);
        color: var(--dsw-alias-label-primary);
        font-size: 14px;
      }
      .dsx-root *, .dsx-root *::before, .dsx-root *::after { box-sizing: border-box; }
      .dsx-top {
        flex: none;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: max(16px, calc(var(--dsh-frame-top-clearance, 0px) + 8px)) 22px 13px;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
      }
      .dsx-brand { display: flex; align-items: center; gap: 11px; min-width: 0; }
      .dsx-brand-icon {
        display: inline-flex; align-items: center; justify-content: center;
        width: 34px; height: 34px; flex: none; border-radius: 10px;
        color: var(--dsw-alias-brand-primary);
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent);
      }
      .dsx-brand-text { min-width: 0; }
      .dsx-title { margin: 0; font-size: 16px; line-height: 20px; font-weight: 600; letter-spacing: -0.01em; }
      .dsx-subtitle { margin: 1px 0 0; font-size: 12px; line-height: 16px; color: var(--dsw-alias-label-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .dsx-actions { display: flex; align-items: center; gap: 7px; flex: none; }
      .dsx-btn {
        appearance: none;
        display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        height: 30px; padding: 0 10px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 8px;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-primary);
        font: inherit; font-size: 12.5px; line-height: 1;
        white-space: nowrap; cursor: pointer;
        transition: background-color .12s ease, border-color .12s ease, opacity .12s ease;
      }
      .dsx-btn:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, var(--dsw-alias-bg-layer-1)); }
      .dsx-btn:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-brand-primary)); outline-offset: 1px; }
      .dsx-btn:disabled { opacity: .45; cursor: default; }
      .dsx-btn-primary {
        border-color: transparent;
        background: var(--dsw-alias-brand-primary);
        color: var(--dsw-alias-label-primary-inverted, var(--dsw-alias-bg-base));
      }
      .dsx-btn-primary:hover { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 86%, var(--dsw-alias-label-primary)); }
      .dsx-btn-danger { color: var(--dsw-alias-state-error-primary); }
      .dsx-icon-btn {
        appearance: none;
        display: inline-flex; align-items: center; justify-content: center;
        width: 30px; height: 30px; padding: 0;
        border: 1px solid transparent; border-radius: 8px;
        background: transparent; color: var(--dsw-alias-label-secondary);
        cursor: pointer;
      }
      .dsx-icon-btn:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent); color: var(--dsw-alias-label-primary); }
      .dsx-icon-btn:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-brand-primary)); outline-offset: 1px; }
      .dsx-icon-btn:disabled { opacity: .35; cursor: default; }
      .dsx-icon-btn.dsx-danger { color: var(--dsw-alias-state-error-primary); }
      .dsx-export-wrap { position: relative; }
      .dsx-menu {
        position: absolute; right: 0; top: calc(100% + 5px); z-index: 30;
        width: 218px; padding: 5px;
        border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 10px;
        background: var(--dsw-alias-bg-overlay);
        box-shadow: 0 10px 30px color-mix(in srgb, #000 16%, transparent);
      }
      .dsx-menu-item {
        display: flex; align-items: center; gap: 9px; width: 100%;
        padding: 8px 9px; border: 0; border-radius: 7px;
        background: transparent; color: var(--dsw-alias-label-primary);
        font: inherit; font-size: 12.5px; text-align: left; cursor: pointer;
      }
      .dsx-menu-item:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent); }
      .dsx-menu-item svg { color: var(--dsw-alias-label-secondary); }
      .dsx-body { flex: 1; display: flex; min-height: 0; }
      .dsx-rail {
        width: 236px; flex: none; min-height: 0;
        display: flex; flex-direction: column; gap: 8px;
        padding: 12px 10px;
        border-right: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-layer-1);
      }
      .dsx-rail-top { display: flex; align-items: center; gap: 6px; padding: 0 2px 2px; }
      .dsx-rail-top .dsx-btn { flex: 1; }
      .dsx-search-wrap { position: relative; padding: 0 1px; }
      .dsx-search-wrap svg { position: absolute; left: 9px; top: 50%; transform: translateY(-50%); color: var(--dsw-alias-label-secondary); pointer-events: none; }
      .dsx-search {
        width: 100%; height: 29px; padding: 0 9px 0 28px;
        border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px;
        background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary);
        font: inherit; font-size: 12px;
      }
      .dsx-search:focus { outline: 2px solid var(--dsw-focus-ring-color, var(--dsw-alias-brand-primary)); outline-offset: 0; }
      .dsx-rail-label { padding: 3px 8px 1px; font-size: 10.5px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
      .dsx-book-list { flex: 1; min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: 3px; padding-bottom: 4px; }
      .dsx-book-row {
        display: flex; align-items: center; gap: 9px; width: 100%;
        padding: 8px 8px; border: 1px solid transparent; border-radius: 9px;
        background: transparent; color: inherit; text-align: left; cursor: pointer;
      }
      .dsx-book-row:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 5%, transparent); }
      .dsx-book-row.dsx-active { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent); border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 24%, transparent); }
      .dsx-book-row:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-brand-primary)); outline-offset: 0; }
      .dsx-book-icon { display: inline-flex; flex: none; color: var(--dsw-alias-label-secondary); }
      .dsx-book-row.dsx-active .dsx-book-icon { color: var(--dsw-alias-brand-primary); }
      .dsx-book-copy { min-width: 0; flex: 1; }
      .dsx-book-name { display: block; font-size: 12.8px; line-height: 17px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .dsx-book-meta { display: block; margin-top: 1px; font-size: 10.8px; line-height: 14px; color: var(--dsw-alias-label-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .dsx-rail-empty { padding: 18px 10px; font-size: 12px; line-height: 17px; color: var(--dsw-alias-label-secondary); }
      .dsx-main { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; }
      .dsx-bookhead { flex: none; display: flex; align-items: center; gap: 10px; padding: 12px 18px 7px; min-width: 0; }
      .dsx-booktitle-wrap { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; }
      .dsx-booktitle {
        min-width: 0; width: 100%; max-width: 520px;
        border: 1px solid transparent; border-radius: 7px;
        background: transparent; color: var(--dsw-alias-label-primary);
        font: inherit; font-size: 17px; line-height: 24px; font-weight: 600; letter-spacing: -0.015em;
        padding: 2px 6px;
      }
      .dsx-booktitle:hover { border-color: var(--dsw-alias-border-l1); }
      .dsx-booktitle:focus { outline: 2px solid var(--dsw-focus-ring-color, var(--dsw-alias-brand-primary)); outline-offset: 0; border-color: transparent; background: var(--dsw-alias-bg-base); }
      .dsx-bookmeta { flex: none; font-size: 11px; color: var(--dsw-alias-label-secondary); white-space: nowrap; }
      .dsx-saving { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--dsw-alias-label-secondary); white-space: nowrap; }
      .dsx-toolbar {
        flex: none; display: flex; align-items: center; gap: 7px;
        padding: 0 18px 10px; flex-wrap: wrap;
      }
      .dsx-formula {
        display: flex; align-items: center; gap: 0; flex: 1 1 260px; min-width: 210px;
        height: 31px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px;
        background: var(--dsw-alias-bg-layer-1); overflow: hidden;
      }
      .dsx-ref {
        flex: none; min-width: 52px; padding: 0 9px;
        border-right: 1px solid var(--dsw-alias-border-l1);
        color: var(--dsw-alias-label-secondary);
        font-family: var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, monospace);
        font-size: 11px; text-align: center;
      }
      .dsx-fx { flex: none; padding: 0 7px 0 9px; color: var(--dsw-alias-label-secondary); font-family: var(--ds-font-family-code, ui-monospace, monospace); font-size: 11px; font-style: italic; }
      .dsx-formula input {
        flex: 1; min-width: 0; height: 100%; border: 0; padding: 0 8px 0 0;
        background: transparent; color: var(--dsw-alias-label-primary);
        font: inherit; font-size: 12.5px;
      }
      .dsx-formula input:focus { outline: none; }
      .dsx-formula:focus-within { border-color: var(--dsw-alias-brand-primary); }
      .dsx-formatbar {
        flex: none; display: flex; align-items: center; gap: 4px;
        padding: 0 18px 9px; min-height: 30px;
      }
      .dsx-format-label {
        flex: none; margin-right: 4px; color: var(--dsw-alias-label-secondary);
        font-size: 10.5px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
      }
      .dsx-format-sep { flex: none; width: 1px; height: 18px; margin: 0 4px; background: var(--dsw-alias-border-l1); }
      .dsx-color-wrap { position: relative; display: inline-flex; flex: none; }
      .dsx-format-color { width: 30px; height: 28px; }
      .dsx-fill-glyph {
        display: inline-block; width: 16px; height: 16px; border-radius: 4px;
        border: 1px solid var(--dsw-alias-border-l2);
        background-image: linear-gradient(45deg, color-mix(in srgb, var(--dsw-alias-label-secondary) 18%, transparent) 25%, transparent 25%, transparent 75%, color-mix(in srgb, var(--dsw-alias-label-secondary) 18%, transparent) 75%);
        background-size: 8px 8px;
      }
      .dsx-text-glyph { font-size: 14px; font-weight: 700; line-height: 1; border-bottom: 2px solid currentColor; padding: 0 1px 1px; }
      .dsx-format-text {
        appearance: none; display: inline-flex; align-items: center; justify-content: center;
        width: 28px; height: 28px; padding: 0; flex: none;
        border: 1px solid transparent; border-radius: 7px;
        background: transparent; color: var(--dsw-alias-label-primary);
        font: inherit; font-size: 13px; cursor: pointer;
      }
      .dsx-format-text:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent); }
      .dsx-format-text.dsx-on { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent); color: var(--dsw-alias-brand-primary); border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 28%, transparent); }
      .dsx-format-text.dsx-italic { font-style: italic; }
      .dsx-icon-btn.dsx-on { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent); color: var(--dsw-alias-brand-primary); }
      .dsx-color-popover {
        position: absolute; left: 0; top: calc(100% + 5px); z-index: 40;
        width: 148px; padding: 8px;
        border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px;
        background: var(--dsw-alias-bg-overlay);
        box-shadow: 0 10px 30px color-mix(in srgb, #000 16%, transparent);
      }
      .dsx-color-title { margin: 0 0 7px; font-size: 10.5px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
      .dsx-swatches { display: grid; grid-template-columns: repeat(4, 24px); gap: 7px; }
      .dsx-swatch, .dsx-text-swatch {
        width: 24px; height: 24px; padding: 0; border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 6px; cursor: pointer; background: transparent;
      }
      .dsx-swatch:hover, .dsx-text-swatch:hover { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
      .dsx-swatch-none {
        background-image: linear-gradient(45deg, color-mix(in srgb, var(--dsw-alias-label-secondary) 35%, transparent) 25%, transparent 25%, transparent 75%, color-mix(in srgb, var(--dsw-alias-label-secondary) 35%, transparent) 75%);
        background-size: 8px 8px;
      }
      .dsx-swatch-auto {
        background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary);
        font: inherit; font-size: 12px; font-weight: 600;
      }
      .dsx-text-swatch { background: var(--dsw-alias-bg-base); font: inherit; font-size: 12px; font-weight: 700; }
      .dsx-color-input {
        display: block; width: 100%; height: 26px; margin-top: 8px; padding: 0;
        border: 1px solid var(--dsw-alias-border-l2); border-radius: 6px;
        background: var(--dsw-alias-bg-base); cursor: pointer;
      }
      .dsx-toolgroup { display: flex; align-items: center; gap: 2px; padding: 1px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-layer-1); }
      .dsx-toolgroup .dsx-icon-btn { width: 27px; height: 27px; border-radius: 6px; }
      .dsx-gridwrap {
        flex: 1; min-height: 0; overflow: auto;
        border-top: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-base);
      }
      .dsx-gridwrap:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: -2px; }
      .dsx-grid {
        border-collapse: separate; border-spacing: 0; table-layout: fixed;
        font-size: 12.5px; line-height: 1.3;
      }
      .dsx-grid th, .dsx-grid td {
        border-right: 1px solid var(--dsw-alias-border-l1);
        border-bottom: 1px solid var(--dsw-alias-border-l1);
      }
      .dsx-grid thead th {
        position: sticky; top: 0; z-index: 3;
        height: 29px; padding: 0;
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-secondary);
        font-size: 10.5px; font-weight: 600; text-align: center;
      }
      .dsx-grid thead th.dsx-corner { left: 0; z-index: 5; }
      .dsx-grid thead th.dsx-colhead { position: sticky; }
      .dsx-col-label { display: inline-flex; align-items: center; justify-content: center; width: 100%; height: 100%; cursor: pointer; }
      .dsx-resize {
        position: absolute; right: -3px; top: 0; z-index: 2;
        width: 7px; height: 100%; cursor: col-resize; touch-action: none;
      }
      .dsx-resize:hover { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 30%, transparent); }
      .dsx-rownum {
        position: sticky; left: 0; z-index: 2;
        width: 44px; min-width: 44px; max-width: 44px;
        height: 30px; padding: 0; text-align: center;
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-secondary);
        font-size: 10.5px; font-weight: 500;
      }
      .dsx-cell {
        height: 30px; padding: 0; margin: 0;
        background: var(--dsw-alias-bg-base);
        color: var(--dsw-alias-label-primary);
        cursor: cell; overflow: hidden;
      }
      .dsx-cell:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 3.5%, var(--dsw-alias-bg-base)); }
      .dsx-cell.dsx-num { text-align: right; }
      .dsx-cell.dsx-error { color: var(--dsw-alias-state-error-primary); }
      .dsx-cell.dsx-selected { box-shadow: inset 0 0 0 2px var(--dsw-alias-brand-primary); }
      .dsx-cell.dsx-inrange { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--dsw-alias-brand-primary) 52%, transparent); }
      .dsx-cell.dsx-editing { box-shadow: inset 0 0 0 2px var(--dsw-alias-brand-primary); padding: 0; }
      .dsx-cell.dsx-wrap { height: auto; min-height: 30px; overflow: visible; vertical-align: top; }
      .dsx-cell.dsx-wrap .dsx-cell-text { white-space: normal; overflow: visible; text-overflow: clip; line-height: 1.35; padding: 5px 7px; word-break: break-word; }
      .dsx-cell-text {
        display: block; width: 100%; height: 100%; padding: 0 7px;
        line-height: 29px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .dsx-cell.dsx-num .dsx-cell-text { font-variant-numeric: tabular-nums; }
      .dsx-cell-input {
        width: 100%; height: 100%; margin: 0; border: 0; padding: 0 6px;
        background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary);
        font: inherit; font-size: 12.5px; outline: none;
      }
      .dsx-cell-textarea { resize: none; height: 100%; min-height: 28px; padding: 4px 6px; line-height: 1.35; font-family: inherit; }
      .dsx-sheetbar {
        flex: none; display: flex; align-items: center; gap: 4px;
        padding: 7px 12px 8px; border-top: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-layer-1); overflow-x: auto;
      }
      .dsx-tab {
        appearance: none; flex: none; display: inline-flex; align-items: center; gap: 5px;
        height: 28px; padding: 0 10px;
        border: 1px solid transparent; border-radius: 7px;
        background: transparent; color: var(--dsw-alias-label-secondary);
        font: inherit; font-size: 12px; white-space: nowrap; cursor: pointer;
      }
      .dsx-tab:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent); color: var(--dsw-alias-label-primary); }
      .dsx-tab.dsx-active { background: var(--dsw-alias-bg-base); border-color: var(--dsw-alias-border-l1); color: var(--dsw-alias-label-primary); font-weight: 500; }
      .dsx-tab:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-brand-primary)); outline-offset: 0; }
      .dsx-tab-input {
        width: 110px; height: 22px; padding: 0 5px;
        border: 1px solid var(--dsw-alias-brand-primary); border-radius: 5px;
        background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary);
        font: inherit; font-size: 12px;
      }
      .dsx-sheetbar-spacer { flex: 1; min-width: 8px; }
      .dsx-sheetbar .dsx-icon-btn { width: 27px; height: 27px; flex: none; }
      .dsx-empty {
        flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 10px; padding: 40px 24px; text-align: center;
      }
      .dsx-empty-icon {
        display: inline-flex; align-items: center; justify-content: center;
        width: 64px; height: 64px; border-radius: 18px;
        color: var(--dsw-alias-brand-primary);
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent);
        margin-bottom: 3px;
      }
      .dsx-empty h2 { margin: 0; font-size: 18px; line-height: 24px; font-weight: 600; }
      .dsx-empty p { margin: 0; max-width: 430px; font-size: 13px; line-height: 19px; color: var(--dsw-alias-label-secondary); }
      .dsx-empty-actions { display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-wrap: wrap; justify-content: center; }
      .dsx-empty-hint { margin-top: 4px; max-width: 430px; font-size: 11.5px; line-height: 17px; color: var(--dsw-alias-label-secondary); }
      .dsx-showmore { display: flex; justify-content: center; padding: 8px; }
      .dsx-status {
        position: absolute; right: 18px; bottom: 54px; z-index: 40;
        max-width: min(420px, calc(100% - 36px));
        display: flex; align-items: flex-start; gap: 8px;
        padding: 9px 11px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 9px;
        background: var(--dsw-alias-bg-overlay); color: var(--dsw-alias-label-primary);
        font-size: 12px; line-height: 17px;
        box-shadow: 0 10px 28px color-mix(in srgb, #000 17%, transparent);
      }
      .dsx-status.dsx-status-error { border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--dsw-alias-border-l2)); color: var(--dsw-alias-state-error-primary); }
      .dsx-status.dsx-status-success { border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 45%, var(--dsw-alias-border-l2)); }
      .dsx-drop {
        position: absolute; inset: 8px; z-index: 50; border-radius: 14px;
        border: 2px dashed var(--dsw-alias-brand-primary);
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, var(--dsw-alias-bg-base));
        display: flex; align-items: center; justify-content: center; gap: 10px;
        font-size: 14px; font-weight: 500; color: var(--dsw-alias-label-primary);
        pointer-events: none;
      }
      .dsx-spinner {
        display: inline-block; border-radius: 50%;
        border: 2px solid color-mix(in srgb, var(--dsw-alias-label-secondary) 30%, transparent);
        border-top-color: var(--dsw-alias-label-secondary);
        animation: dsx-spin .7s linear infinite;
      }
      .dsx-fatal { align-items: center; justify-content: center; gap: 8px; text-align: center; padding: 32px; }
      .dsx-fatal h2 { margin: 4px 0 0; font-size: 17px; }
      .dsx-fatal p { margin: 0; max-width: 420px; color: var(--dsw-alias-label-secondary); font-size: 12.5px; }
      .dsx-sr-only {
        position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
        overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
      }
      .dsx-mobile-book { display: none; }
      @keyframes dsx-spin { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) {
        .dsx-btn, .dsx-menu-item, .dsx-book-row { transition: none; }
        .dsx-spinner { animation-duration: 1.8s; }
      }
      @media (max-width: 900px) {
        .dsx-rail { display: none; }
        .dsx-mobile-book { display: flex; padding: 0 18px 8px; }
        .dsx-mobile-book select {
          width: 100%; height: 30px; padding: 0 8px;
          border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px;
          background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary);
          font: inherit; font-size: 12.5px;
        }
      }
      @media (max-width: 620px) {
        .dsx-top { padding: max(13px, calc(var(--dsh-frame-top-clearance, 0px) + 6px)) 12px 10px; gap: 8px; }
        .dsx-subtitle { display: none; }
        .dsx-actions .dsx-btn-label { display: none; }
        .dsx-bookhead { padding: 9px 12px 6px; }
        .dsx-toolbar { padding: 0 12px 8px; }
        .dsx-formatbar { padding: 0 12px 8px; flex-wrap: wrap; row-gap: 4px; }
        .dsx-format-label { display: none; }
        .dsx-bookmeta { display: none; }
        .dsx-sheetbar { padding-left: 8px; padding-right: 8px; }
        .dsx-menu { width: 200px; }
      }
    `

    function contrastColor(hex) {
      const raw = String(hex ?? '').replace(/^#/, '')
      if (!/^[0-9a-f]{6}$/i.test(raw)) return '#111827'
      const channels = [0, 2, 4].map((offset) => parseInt(raw.slice(offset, offset + 2), 16) / 255)
      const linear = channels.map((channel) => (channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)))
      const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
      return luminance > 0.52 ? '#111827' : '#FFFFFF'
    }

    // ---------------------------------------------------------------------
    // Panel
    // ---------------------------------------------------------------------

    function SheetApp({ t, locale }) {
      const [workbookList, setWorkbookList] = useState([])
      const [book, setBookState] = useState(null)
      const [selected, setSelectedState] = useState({ sheetId: null, row: 0, col: 0 })
      const [rangeAnchor, setRangeAnchorState] = useState({ row: 0, col: 0 })
      const [editing, setEditingState] = useState(null)
      const [renamingSheet, setRenamingSheetState] = useState(null)
      const [nameDraft, setNameDraft] = useState('')
      const [query, setQuery] = useState('')
      const [widths, setWidths] = useState({})
      const [rowLimit, setRowLimit] = useState(500)
      const [status, setStatus] = useState(null)
      const [loading, setLoading] = useState(true)
      const [busy, setBusy] = useState(false)
      const [saving, setSaving] = useState(false)
      const [importing, setImporting] = useState(false)
      const [exporting, setExporting] = useState(false)
      const [showExport, setShowExport] = useState(false)
      const [colorMenu, setColorMenu] = useState(null)
      const [confirmDelete, setConfirmDelete] = useState(null)
      const [dragging, setDragging] = useState(false)
      const [, setLocaleRevision] = useState(0)

      const bookRef = useRef(null)
      const selectedRef = useRef(selected)
      const rangeAnchorRef = useRef(rangeAnchor)
      const editingRef = useRef(null)
      const renamingSheetRef = useRef(null)
      const pendingRef = useRef(0)
      const opChainRef = useRef(Promise.resolve())
      const gridRef = useRef(null)
      const fileInputRef = useRef(null)
      const notifyTimerRef = useRef(null)
      const nameFocusedRef = useRef(false)
      const pollBusyRef = useRef(false)
      const openSeqRef = useRef(0)

      function updateBook(next) {
        bookRef.current = next
        setBookState(next)
      }

      function updateSelected(next) {
        selectedRef.current = next
        setSelectedState(next)
      }

      function updateRangeAnchor(next) {
        rangeAnchorRef.current = next
        setRangeAnchorState(next)
      }

      function updateEditing(next) {
        editingRef.current = next
        setEditingState(next)
      }

      function updateRenamingSheet(next) {
        renamingSheetRef.current = next
        setRenamingSheetState(next)
      }

      function notify(kind, message) {
        setStatus({ kind, message })
        if (notifyTimerRef.current !== null) window.clearTimeout(notifyTimerRef.current)
        notifyTimerRef.current = window.setTimeout(() => {
          notifyTimerRef.current = null
          setStatus(null)
        }, 4200)
      }

      function mergeSummary(summary) {
        if (!summary) return
        setWorkbookList((previous) => {
          const next = previous.filter((entry) => entry.id !== summary.id)
          next.push(summary)
          next.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
          return next
        })
      }

      const activeSheet = useMemo(() => (book ? findSheet(book, selected.sheetId) : null), [book, selected.sheetId])
      const selectedRaw = activeSheet?.rows[selected.row]?.[selected.col] ?? ''
      const columnCount = activeSheet ? Math.min(120, Math.max(8, maxCols(activeSheet.rows) + 1)) : 8
      const rowCount = activeSheet ? Math.min(rowLimit, Math.max(20, activeSheet.rows.length + 1)) : 0
      const selectionBounds = {
        startRow: Math.min(rangeAnchor.row, selected.row),
        endRow: Math.max(rangeAnchor.row, selected.row),
        startCol: Math.min(rangeAnchor.col, selected.col),
        endCol: Math.max(rangeAnchor.col, selected.col),
      }
      const selectionSingle = selectionBounds.startRow === selectionBounds.endRow && selectionBounds.startCol === selectionBounds.endCol
      const currentFormat = activeSheet?.formats?.[`${selected.row}:${selected.col}`] ?? null
      const filteredBooks = useMemo(() => {
        const needle = query.trim().toLowerCase()
        if (needle === '') return workbookList
        return workbookList.filter((entry) => entry.name.toLowerCase().includes(needle))
      }, [workbookList, query])

      useEffect(() => {
        bookRef.current = book
      }, [book])

      useEffect(() => {
        selectedRef.current = selected
      }, [selected])

      useEffect(() => {
        rangeAnchorRef.current = rangeAnchor
      }, [rangeAnchor])

      useEffect(() => {
        updateRangeAnchor({ row: selected.row, col: selected.col })
      }, [selected.sheetId])

      useEffect(() => {
        editingRef.current = editing
      }, [editing])

      useEffect(() => {
        renamingSheetRef.current = renamingSheet
      }, [renamingSheet])

      useEffect(() => {
        return () => {
          if (notifyTimerRef.current !== null) window.clearTimeout(notifyTimerRef.current)
        }
      }, [])

      useEffect(() => {
        if (!locale || typeof locale.subscribe !== 'function') return
        return locale.subscribe(() => setLocaleRevision((revision) => revision + 1))
      }, [locale])

      useEffect(() => {
        if (!book) {
          setNameDraft('')
          return
        }
        if (!nameFocusedRef.current) setNameDraft(book.name)
      }, [book?.id, book?.name])

      useEffect(() => {
        if (!book) return
        const stillThere = selectedRef.current.sheetId
          ? book.sheets.some((sheet) => sheet.id === selectedRef.current.sheetId)
          : false
        if (!stillThere) {
          const target = findSheet(book, book.activeSheetId) ?? book.sheets[0] ?? null
          if (target) updateSelected({ sheetId: target.id, row: 0, col: 0 })
        }
      }, [book])

      useEffect(() => {
        setRowLimit(500)
        const target = book ? findSheet(book, selected.sheetId) : null
        setWidths(target?.colWidths ? { ...target.colWidths } : {})
        setConfirmDelete(null)
        setShowExport(false)
      }, [selected.sheetId, book?.id])

      useEffect(() => {
        if (!confirmDelete) return
        const timer = window.setTimeout(() => setConfirmDelete(null), 3400)
        return () => window.clearTimeout(timer)
      }, [confirmDelete])

      useEffect(() => {
        if (!showExport) return
        const dismiss = (event) => {
          if (event.target instanceof Element && event.target.closest('.dsx-export-wrap')) return
          setShowExport(false)
        }
        document.addEventListener('mousedown', dismiss)
        return () => document.removeEventListener('mousedown', dismiss)
      }, [showExport])

      useEffect(() => {
        if (!colorMenu) return
        const dismiss = (event) => {
          if (event.target instanceof Element && event.target.closest('.dsx-color-wrap')) return
          setColorMenu(null)
        }
        document.addEventListener('mousedown', dismiss)
        return () => document.removeEventListener('mousedown', dismiss)
      }, [colorMenu])

      useEffect(() => {
        let alive = true
        ;(async () => {
          try {
            const data = await api.list()
            if (!alive) return
            setWorkbookList(data.workbooks)
            let remembered = null
            try {
              remembered = window.localStorage.getItem('dsh-sheets:last')
            } catch {
              remembered = null
            }
            const preferred = data.workbooks.find((entry) => entry.id === remembered) ?? data.workbooks[0]
            if (preferred) {
              const got = await api.get(preferred.id)
              if (!alive) return
              updateBook(got.workbook)
              const target = findSheet(got.workbook, got.workbook.activeSheetId) ?? got.workbook.sheets[0] ?? null
              updateSelected({ sheetId: target?.id ?? null, row: 0, col: 0 })
            }
          } catch (error) {
            if (alive) notify('error', error?.message ?? t('saveFailed'))
          } finally {
            if (alive) setLoading(false)
          }
        })()
        return () => {
          alive = false
        }
      }, [])

      useEffect(() => {
        let alive = true
        const timer = window.setInterval(async () => {
          if (!alive || pollBusyRef.current || pendingRef.current > 0) return
          pollBusyRef.current = true
          try {
            const data = await api.list()
            if (!alive) return
            setWorkbookList((previous) => (sameWorkbookList(previous, data.workbooks) ? previous : data.workbooks))
            const current = bookRef.current
            if (!current) {
              if (data.workbooks[0]) {
                const got = await api.get(data.workbooks[0].id)
                if (!alive) return
                updateBook(got.workbook)
                const target = findSheet(got.workbook, got.workbook.activeSheetId) ?? got.workbook.sheets[0] ?? null
                updateSelected({ sheetId: target?.id ?? null, row: 0, col: 0 })
              }
              return
            }
            const summary = data.workbooks.find((entry) => entry.id === current.id)
            if (!summary) {
              const next = data.workbooks[0]
              if (!next) {
                updateBook(null)
                updateSelected({ sheetId: null, row: 0, col: 0 })
                return
              }
              const got = await api.get(next.id)
              if (!alive) return
              updateBook(got.workbook)
              const target = findSheet(got.workbook, got.workbook.activeSheetId) ?? got.workbook.sheets[0] ?? null
              updateSelected({ sheetId: target?.id ?? null, row: 0, col: 0 })
              return
            }
            if (summary.rev === current.rev) return
            if (editingRef.current) return
            const got = await api.get(current.id)
            if (!alive) return
            if (got.workbook.rev === bookRef.current?.rev) return
            updateBook(got.workbook)
            const stillThere = findSheet(got.workbook, selectedRef.current.sheetId)
            if (!stillThere) {
              const target = findSheet(got.workbook, got.workbook.activeSheetId) ?? got.workbook.sheets[0] ?? null
              updateSelected({ sheetId: target?.id ?? null, row: 0, col: 0 })
            }
          } catch {
            // Polling is best-effort; the next tick retries.
          } finally {
            pollBusyRef.current = false
          }
        }, 1800)
        return () => {
          alive = false
          window.clearInterval(timer)
        }
      }, [])

      async function openWorkbook(id, force = false) {
        if (!id) return
        if (!force && bookRef.current?.id === id) return
        const sequence = openSeqRef.current + 1
        openSeqRef.current = sequence
        setBusy(true)
        try {
          const data = await api.get(id)
          if (sequence !== openSeqRef.current) return
          updateBook(data.workbook)
          try {
            window.localStorage.setItem('dsh-sheets:last', data.workbook.id)
          } catch {
            // localStorage can be unavailable in restricted embeds
          }
          const target = findSheet(data.workbook, data.workbook.activeSheetId) ?? data.workbook.sheets[0] ?? null
          updateSelected({ sheetId: target?.id ?? null, row: 0, col: 0 })
          updateEditing(null)
          setNameDraft(data.workbook.name)
        } catch (error) {
          if (sequence === openSeqRef.current) notify('error', error?.message ?? t('saveFailed'))
        } finally {
          if (sequence === openSeqRef.current) {
            setBusy(false)
            setLoading(false)
          }
        }
      }

      async function refreshCurrent() {
        const current = bookRef.current
        if (!current) return
        try {
          const data = await api.get(current.id)
          updateBook(data.workbook)
        } catch {
          // keep the local copy; the user can retry
        }
      }

      function runOp(operation, options = {}) {
        const current = bookRef.current
        if (!current) return Promise.resolve(null)
        const id = current.id
        if (options.optimistic !== false) {
          const next = localApply(bookRef.current, operation)
          updateBook(next)
        }
        pendingRef.current += 1
        setSaving(true)
        const task = opChainRef.current.then(async () => {
          try {
            const data = await api.op(id, operation)
            updateBook(data.workbook)
            mergeSummary(data.summary)
            if (typeof options.onApplied === 'function') options.onApplied(data.workbook)
            if (options.success) notify('success', options.success)
            return data.workbook
          } catch (error) {
            notify('error', error?.message ?? t('saveFailed'))
            await refreshCurrent()
            return null
          } finally {
            pendingRef.current = Math.max(0, pendingRef.current - 1)
            if (pendingRef.current === 0) setSaving(false)
          }
        })
        opChainRef.current = task.catch(() => null)
        return task
      }

      async function createBook() {
        openSeqRef.current += 1
        setBusy(true)
        try {
          const data = await api.create({
            name: t('untitled'),
            sheets: [{ name: `${t('sheet')} 1`, rows: [] }],
          })
          updateBook(data.workbook)
          try {
            window.localStorage.setItem('dsh-sheets:last', data.workbook.id)
          } catch {
            // localStorage can be unavailable in restricted embeds
          }
          mergeSummary(data.summary)
          const target = findSheet(data.workbook, data.workbook.activeSheetId) ?? data.workbook.sheets[0] ?? null
          updateSelected({ sheetId: target?.id ?? null, row: 0, col: 0 })
          setNameDraft(data.workbook.name)
          updateEditing(null)
          notify('success', t('created'))
        } catch (error) {
          notify('error', error?.message ?? t('saveFailed'))
        } finally {
          setBusy(false)
        }
      }

      function selectWorkbook(id) {
        commitEdit('none')
        if (bookRef.current?.id === id) return
        openWorkbook(id)
      }

      function selectionRangeReference() {
        const start = `${colLetter(selectionBounds.startCol)}${selectionBounds.startRow + 1}`
        return selectionSingle ? start : `${start}:${colLetter(selectionBounds.endCol)}${selectionBounds.endRow + 1}`
      }

      function maxRowIndex() {
        if (!activeSheet) return 0
        return Math.max(0, rowCount - 1)
      }

      function moveSelection(rowDelta, colDelta, extend = false) {
        if (!activeSheet) return
        const maxRow = maxRowIndex()
        const maxColumn = Math.max(0, columnCount - 1)
        const next = {
          row: Math.max(0, Math.min(maxRow, selected.row + rowDelta)),
          col: Math.max(0, Math.min(maxColumn, selected.col + colDelta)),
        }
        if (!extend) updateRangeAnchor(next)
        updateSelected({ sheetId: activeSheet.id, ...next })
        gridRef.current?.focus()
      }

      function selectCell(row, column, extend = false) {
        if (!activeSheet) return
        if (editingRef.current) commitEdit('none')
        if (!extend) updateRangeAnchor({ row, col: column })
        updateSelected({ sheetId: activeSheet.id, row, col: column })
        gridRef.current?.focus()
      }

      function selectColumn(column) {
        if (!activeSheet) return
        if (editingRef.current) commitEdit('none')
        const lastRow = Math.max(0, rowCount - 1)
        updateRangeAnchor({ row: lastRow, col: column })
        updateSelected({ sheetId: activeSheet.id, row: 0, col: column })
        gridRef.current?.focus()
      }

      function selectRow(row) {
        if (!activeSheet) return
        if (editingRef.current) commitEdit('none')
        const lastColumn = Math.max(0, columnCount - 1)
        updateRangeAnchor({ row, col: lastColumn })
        updateSelected({ sheetId: activeSheet.id, row, col: 0 })
        gridRef.current?.focus()
      }

      function beginEdit(row, column, seed, selectAll) {
        if (!activeSheet) return
        updateRangeAnchor({ row, col: column })
        updateSelected({ sheetId: activeSheet.id, row, col: column })
        const raw = activeSheet.rows[row]?.[column] ?? ''
        const value = seed === undefined ? raw : String(seed)
        const next = { row, col: column, value, selectAll: selectAll ?? seed === undefined }
        updateEditing(next)
      }

      function cancelEdit() {
        updateEditing(null)
        gridRef.current?.focus()
      }

      function commitEdit(move = 'none', refocus = true) {
        const current = editingRef.current
        if (!current || !activeSheet) return
        updateEditing(null)
        const raw = activeSheet.rows[current.row]?.[current.col] ?? ''
        if (current.value !== raw) {
          runOp({
            type: 'set_cells',
            sheet: activeSheet.id,
            start: `${colLetter(current.col)}${current.row + 1}`,
            values: [[current.value]],
          })
        }
        if (move !== 'none') {
          const delta = move === 'down' ? [1, 0] : move === 'up' ? [-1, 0] : move === 'right' ? [0, 1] : [0, -1]
          moveSelection(delta[0], delta[1])
        } else if (refocus) {
          gridRef.current?.focus()
        }
      }

      function clearSelectedCell() {
        if (!activeSheet) return
        runOp({
          type: 'clear_range',
          sheet: activeSheet.id,
          range: selectionRangeReference(),
        })
      }

      function onGridKeyDown(event) {
        if (editingRef.current) return
        if (!activeSheet) return
        if (event.metaKey || event.ctrlKey || event.altKey) return
        const key = event.key
        if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
          event.preventDefault()
          moveSelection(key === 'ArrowUp' ? -1 : key === 'ArrowDown' ? 1 : 0, key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : 0, event.shiftKey)
          return
        }
        if (key === 'Tab') {
          event.preventDefault()
          moveSelection(0, event.shiftKey ? -1 : 1)
          return
        }
        if (key === 'Enter') {
          event.preventDefault()
          beginEdit(selected.row, selected.col, undefined, false)
          return
        }
        if (key === 'F2') {
          event.preventDefault()
          beginEdit(selected.row, selected.col, undefined, false)
          return
        }
        if (key === 'Delete' || key === 'Backspace') {
          event.preventDefault()
          clearSelectedCell()
          return
        }
        if (key.length === 1) {
          event.preventDefault()
          beginEdit(selected.row, selected.col, key, false)
        }
      }

      function onCellInputKeyDown(event, wrap = false) {
        if (event.key === 'Enter') {
          if (wrap && event.shiftKey) return
          event.preventDefault()
          commitEdit('down')
          return
        }
        if (event.key === 'Tab') {
          event.preventDefault()
          commitEdit(event.shiftKey ? 'left' : 'right')
          return
        }
        if (event.key === 'Escape') {
          event.preventDefault()
          cancelEdit()
        }
      }

      function onFormulaFocus() {
        if (editingRef.current) return
        if (!activeSheet) return
        updateEditing({ row: selected.row, col: selected.col, value: selectedRaw, selectAll: false })
      }

      function onFormulaChange(event) {
        if (!activeSheet) return
        const value = event.target.value
        const current = editingRef.current
        if (current) updateEditing({ ...current, value })
        else updateEditing({ row: selected.row, col: selected.col, value, selectAll: false })
      }

      function onFormulaKeyDown(event) {
        if (event.key === 'Enter') {
          event.preventDefault()
          commitEdit('none')
          return
        }
        if (event.key === 'Escape') {
          event.preventDefault()
          cancelEdit()
        }
      }

      function onGridCopy(event) {
        if (editingRef.current || !activeSheet) return
        const lines = []
        const cache = new Map()
        for (let row = selectionBounds.startRow; row <= selectionBounds.endRow; row += 1) {
          const cells = []
          for (let col = selectionBounds.startCol; col <= selectionBounds.endCol; col += 1) {
            cells.push(cellDisplay(activeSheet, row, col, cache, new Set(), book).text)
          }
          lines.push(cells.join('\t'))
        }
        event.preventDefault()
        event.clipboardData.setData('text/plain', lines.join('\n'))
      }

      function onGridPaste(event) {
        if (editingRef.current || !activeSheet) return
        const text = event.clipboardData.getData('text/plain')
        if (!text) return
        event.preventDefault()
        const delimiter = text.includes('\t') ? '\t' : detectDelimiter(text)
        const rows = parseDelimited(text, delimiter)
        if (rows.length === 0) return
        runOp({
          type: 'set_cells',
          sheet: activeSheet.id,
          start: `${colLetter(selected.col)}${selected.row + 1}`,
          values: rows,
        })
      }

      function startRenameSheet(sheet) {
        commitEdit('none')
        updateRenamingSheet({ id: sheet.id, value: sheet.name })
      }

      function finishRenameSheet(save) {
        const current = renamingSheetRef.current
        if (!current) return
        updateRenamingSheet(null)
        if (!save) return
        const target = findSheet(bookRef.current, current.id)
        if (!target) return
        const value = current.value.trim()
        if (value === '') {
          notify('error', t('sheetNameRequired'))
          return
        }
        if (value !== target.name) {
          runOp({ type: 'rename_sheet', sheet: target.id, name: value })
        }
      }

      function switchSheet(id) {
        if (!book) return
        commitEdit('none')
        if (activeSheet && id === activeSheet.id) {
          gridRef.current?.focus()
          return
        }
        updateEditing(null)
        updateSelected({ sheetId: id, row: 0, col: 0 })
        if (book.sheets.some((sheet) => sheet.id === id)) {
          runOp({ type: 'set_active_sheet', sheet: id }, { optimistic: true })
        }
        gridRef.current?.focus()
      }

      function addSheet() {
        if (!book) return
        runOp(
          { type: 'add_sheet', name: `${t('sheet')} ${book.sheets.length + 1}` },
          {
            optimistic: false,
            onApplied: (updated) => {
              const target = findSheet(updated, updated.activeSheetId) ?? updated.sheets[0] ?? null
              if (target) updateSelected({ sheetId: target.id, row: 0, col: 0 })
            },
          },
        )
      }

      function deleteActiveSheet() {
        if (!book || !activeSheet || book.sheets.length <= 1) return
        if (confirmDelete !== 'sheet') {
          setConfirmDelete('sheet')
          return
        }
        setConfirmDelete(null)
        runOp(
          { type: 'delete_sheet', sheet: activeSheet.id },
          {
            onApplied: (updated) => {
              const target = findSheet(updated, updated.activeSheetId) ?? updated.sheets[0] ?? null
              updateSelected({ sheetId: target?.id ?? null, row: 0, col: 0 })
            },
          },
        )
      }

      function addRow() {
        if (!book || !activeSheet) return
        runOp({ type: 'add_rows', sheet: activeSheet.id, start_row: selected.row + 2, count: 1 })
      }

      function deleteRow() {
        if (!book || !activeSheet) return
        runOp({ type: 'delete_rows', sheet: activeSheet.id, start_row: selected.row + 1, count: 1 })
      }

      function addColumn() {
        if (!book || !activeSheet) return
        runOp({ type: 'add_columns', sheet: activeSheet.id, start_column: colLetter(selected.col + 1), count: 1 })
      }

      function deleteColumn() {
        if (!book || !activeSheet) return
        runOp({ type: 'delete_columns', sheet: activeSheet.id, start_column: colLetter(selected.col), count: 1 })
      }

      function commitWorkbookName() {
        const current = bookRef.current
        if (!current) return
        const value = nameDraft.trim()
        if (value === '') {
          setNameDraft(current.name)
          notify('error', t('nameRequired'))
          return
        }
        if (value !== current.name) {
          runOp({ type: 'rename_workbook', name: value }, { optimistic: false })
        }
      }

      async function deleteActiveBook() {
        const current = bookRef.current
        if (!current) return
        if (confirmDelete !== 'workbook') {
          setConfirmDelete('workbook')
          return
        }
        setConfirmDelete(null)
        try {
          commitEdit('none')
          await opChainRef.current.catch(() => null)
          await api.remove(current.id)
          const remaining = workbookList.filter((entry) => entry.id !== current.id)
          setWorkbookList(remaining)
          if (remaining[0]) {
            await openWorkbook(remaining[0].id, true)
          } else {
            updateBook(null)
            updateSelected({ sheetId: null, row: 0, col: 0 })
            setNameDraft('')
          }
        } catch (error) {
          notify('error', error?.message ?? t('saveFailed'))
        }
      }

      async function exportCsv() {
        const current = bookRef.current
        if (!current || !activeSheet) return
        try {
          const rows = []
          const cache = new Map()
          const width = Math.max(1, maxCols(activeSheet.rows))
          for (let r = 0; r < activeSheet.rows.length; r += 1) {
            const row = []
            for (let c = 0; c < width; c += 1) row.push(cellDisplay(activeSheet, r, c, cache, new Set(), current).text)
            rows.push(row)
          }
          const csv = toDelimited(rows, ',')
          downloadBlob(
            `${sanitizeFileName(current.name)}-${sanitizeFileName(activeSheet.name)}.csv`,
            new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }),
          )
          setShowExport(false)
          notify('success', t('exported'))
        } catch (error) {
          notify('error', `${t('exportFailed')} ${error?.message ?? ''}`)
        }
      }

      async function exportXlsx() {
        const current = bookRef.current
        if (!current) return
        setExporting(true)
        try {
          const blob = await writeXlsxFile(current)
          downloadBlob(`${sanitizeFileName(current.name)}.xlsx`, blob)
          setShowExport(false)
          notify('success', t('exported'))
        } catch (error) {
          notify('error', `${t('exportFailed')} ${error?.message ?? ''}`)
        } finally {
          setExporting(false)
        }
      }

      async function importFile(file) {
        if (!file) return
        openSeqRef.current += 1
        setBusy(false)
        const lower = file.name.toLowerCase()
        if (!/\.(csv|tsv|txt|xlsx)$/.test(lower)) {
          notify('error', t('unsupportedFile'))
          return
        }
        if (file.size > 15 * 1024 * 1024) {
          notify('error', t('importFailed'))
          return
        }
        setImporting(true)
        notify('info', t('reading'))
        try {
          let sheets
          if (lower.endsWith('.xlsx')) {
            sheets = await readXlsxFile(file)
          } else {
            const content = await file.text()
            const delimiter = lower.endsWith('.tsv') ? '\t' : detectDelimiter(content)
            sheets = [
              {
                name: file.name.replace(/\.[^.]+$/, ''),
                rows: parseDelimited(content, delimiter),
              },
            ]
          }
          const name = file.name.replace(/\.[^.]+$/, '') || t('untitled')
          const data = await api.create({
            name,
            sheets: sheets.map((sheet) => ({ name: sheet.name, rows: sheet.rows, formats: sheet.formats, colWidths: sheet.colWidths })),
          })
          updateBook(data.workbook)
          try {
            window.localStorage.setItem('dsh-sheets:last', data.workbook.id)
          } catch {
            // localStorage can be unavailable in restricted embeds
          }
          mergeSummary(data.summary)
          const target = findSheet(data.workbook, data.workbook.activeSheetId) ?? data.workbook.sheets[0] ?? null
          updateSelected({ sheetId: target?.id ?? null, row: 0, col: 0 })
          setNameDraft(data.workbook.name)
          updateEditing(null)
          notify('success', t('imported', { name: file.name }))
        } catch (error) {
          const message = String(error?.message ?? '')
          notify('error', message.includes('UNSUPPORTED_DEFLATE') || message.includes('ZIP') ? t('xlsxUnsupported') : `${t('importFailed')} ${message}`)
        } finally {
          setImporting(false)
        }
      }

      function beginResize(event, column) {
        event.preventDefault()
        event.stopPropagation()
        const startX = event.clientX
        const startWidth = widths[column] ?? 150
        let lastWidth = startWidth
        const move = (moveEvent) => {
          const nextWidth = Math.max(72, Math.min(600, startWidth + moveEvent.clientX - startX))
          lastWidth = Math.round(nextWidth)
          setWidths((previous) => ({ ...previous, [column]: lastWidth }))
        }
        const finish = () => {
          window.removeEventListener('pointermove', move)
          window.removeEventListener('pointerup', finish)
          window.removeEventListener('pointercancel', finish)
          if (activeSheet && lastWidth !== startWidth) {
            runOp({ type: 'set_col_width', sheet: activeSheet.id, column, width: lastWidth })
          }
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', finish)
        window.addEventListener('pointercancel', finish)
      }

      function applyFormat(patch) {
        if (!activeSheet) return
        runOp({
          type: 'set_format',
          sheet: activeSheet.id,
          range: selectionRangeReference(),
          patch,
        })
      }

      function applyFill(value) {
        applyFormat({ fill: value })
        setColorMenu(null)
      }

      function applyTextColor(value) {
        applyFormat({ color: value })
        setColorMenu(null)
      }

      function toggleBold() {
        applyFormat({ bold: currentFormat?.bold !== true })
      }

      function toggleItalic() {
        applyFormat({ italic: currentFormat?.italic !== true })
      }

      function toggleAlign(align) {
        applyFormat({ align: currentFormat?.align === align ? null : align })
      }

      function toggleWrap() {
        applyFormat({ wrap: currentFormat?.wrap !== true })
      }

      function clearFormatting() {
        if (!activeSheet) return
        runOp({
          type: 'clear_format',
          sheet: activeSheet.id,
          range: selectionRangeReference(),
        })
      }

      function fitColumns() {
        if (!activeSheet) return
        const next = {}
        const cache = new Map()
        const rowEnd = Math.min(activeSheet.rows.length, 500)
        for (let col = 0; col < columnCount; col += 1) {
          let longest = 0
          for (let row = 0; row < rowEnd; row += 1) {
            const text = cellDisplay(activeSheet, row, col, cache, new Set(), book).text
            const lines = text.split(/\r?\n/)
            for (const line of lines) longest = Math.max(longest, line.length)
          }
          next[col] = Math.round(Math.max(80, Math.min(420, longest * 7.2 + 24)))
        }
        setWidths(next)
        runOp({ type: 'set_col_widths', sheet: activeSheet.id, widths: next })
      }

      const allWidths = []
      let totalWidth = 44
      for (let c = 0; c < columnCount; c += 1) {
        const width = widths[c] ?? 150
        allWidths.push(width)
        totalWidth += width
      }

      const selectionName = `${colLetter(selected.col)}${selected.row + 1}`
      const formulaValue = editing ? editing.value : selectedRaw
      const cellCache = new Map()

      function renderCell(row, column) {
        if (!activeSheet) return null
        const raw = activeSheet.rows[row]?.[column] ?? ''
        const display = cellDisplay(activeSheet, row, column, cellCache, new Set(), book)
        const format = activeSheet.formats?.[`${row}:${column}`] ?? null
        const wrap = format?.wrap === true
        const isSelected = selected.row === row && selected.col === column
        const isInRange =
          row >= selectionBounds.startRow &&
          row <= selectionBounds.endRow &&
          column >= selectionBounds.startCol &&
          column <= selectionBounds.endCol
        const isEditing = editing !== null && editing.row === row && editing.col === column
        const style = {}
        if (format?.fill) style.backgroundColor = format.fill
        if (format?.color) style.color = format.color
        else if (format?.fill) style.color = contrastColor(format.fill)
        if (format?.bold) style.fontWeight = 600
        if (format?.italic) style.fontStyle = 'italic'
        if (format?.align) style.textAlign = format.align
        const className = [
          'dsx-cell',
          display.numeric ? 'dsx-num' : '',
          display.error ? 'dsx-error' : '',
          isSelected ? 'dsx-selected' : '',
          isInRange && !isSelected ? 'dsx-inrange' : '',
          isEditing ? 'dsx-editing' : '',
          wrap ? 'dsx-wrap' : '',
        ].filter(Boolean).join(' ')
        const editorProps = {
          className: `dsx-cell-input${wrap ? ' dsx-cell-textarea' : ''}`,
          value: editing ? editing.value : '',
          onChange: (event) => updateEditing({ ...editingRef.current, value: event.target.value }),
          onKeyDown: (event) => onCellInputKeyDown(event, wrap),
          onBlur: () => commitEdit('none', false),
          onMouseDown: (event) => event.stopPropagation(),
          onDoubleClick: (event) => event.stopPropagation(),
          spellCheck: false,
          'aria-label': `${colLetter(column)}${row + 1}`,
          ref: (element) => {
            if (!element || element.dataset.dsxFocused === '1') return
            element.dataset.dsxFocused = '1'
            element.focus()
            if (editing?.selectAll) {
              element.select()
            } else {
              const end = element.value.length
              try {
                element.setSelectionRange(end, end)
              } catch {
                // selection APIs can be unavailable in some embeds
              }
            }
          },
        }
        return h(
          'td',
          {
            key: column,
            className,
            style,
            role: 'gridcell',
            'aria-selected': isInRange ? 'true' : undefined,
            'aria-label': `${colLetter(column)}${row + 1}${display.text ? `: ${display.text}` : ''}`,
            onMouseDown: (event) => {
              if (event.button !== 0) return
              event.preventDefault()
              if (!isEditing) selectCell(row, column, event.shiftKey)
            },
            onDoubleClick: () => beginEdit(row, column, undefined, false),
          },
          isEditing
            ? wrap
              ? h('textarea', { ...editorProps, rows: 1 })
              : h('input', editorProps)
            : h(
                'div',
                {
                  className: 'dsx-cell-text',
                  title: display.formula ? display.raw : display.text.length > 48 ? display.text : undefined,
                },
                display.text === '' ? '\u00a0' : display.text,
              ),
        )
      }

      const headers = []
      for (let c = 0; c < columnCount; c += 1) {
        headers.push(
          h(
            'th',
            {
              key: c,
              className: 'dsx-colhead',
              scope: 'col',
              style: { width: `${allWidths[c]}px`, minWidth: `${allWidths[c]}px`, maxWidth: `${allWidths[c]}px` },
            },
            h('span', { className: 'dsx-col-label', onClick: () => selectColumn(c) }, colLetter(c)),
            h('span', {
              className: 'dsx-resize',
              role: 'separator',
              'aria-orientation': 'vertical',
              'aria-label': t('resizeColumn', { column: colLetter(c) }),
              onPointerDown: (event) => beginResize(event, c),
            }),
          ),
        )
      }

      const rows = []
      for (let r = 0; r < rowCount; r += 1) {
        const cells = [h('th', { key: 'row', className: 'dsx-rownum', scope: 'row', onClick: () => selectRow(r) }, r + 1)]
        for (let c = 0; c < columnCount; c += 1) cells.push(renderCell(r, c))
        rows.push(h('tr', { key: r }, cells))
      }

      const activeMeta = book
        ? `${t('sheetCount', { n: book.sheets.length })} · ${t('updated')} ${formatRelative(book.updatedAt, t)}`
        : ''

      const grid = activeSheet
        ? h(
            'div',
            {
              className: 'dsx-gridwrap',
              tabIndex: 0,
              ref: gridRef,
              role: 'grid',
              'aria-label': `${book?.name ?? t('title')} · ${activeSheet.name}`,
              'aria-rowcount': rowCount,
              'aria-colcount': columnCount,
              onKeyDown: onGridKeyDown,
              onCopy: onGridCopy,
              onPaste: onGridPaste,
            },
            h(
              'table',
              { className: 'dsx-grid', role: 'presentation', style: { width: `${totalWidth}px` } },
              h(
                'colgroup',
                null,
                h('col', { style: { width: '44px' } }),
                ...allWidths.map((width, index) => h('col', { key: index, style: { width: `${width}px` } })),
              ),
              h(
                'thead',
                null,
                h(
                  'tr',
                  null,
                  h('th', { className: 'dsx-corner dsx-rownum', scope: 'col', 'aria-label': t('cell') }),
                  ...headers,
                ),
              ),
              h('tbody', null, ...rows),
            ),
            activeSheet.rows.length + 1 > rowCount
              ? h(
                  'div',
                  { className: 'dsx-showmore' },
                  h(
                    'button',
                    {
                      className: 'dsx-btn',
                      onClick: () => setRowLimit((previous) => Math.min(5000, previous + 200)),
                    },
                    t('showMore'),
                  ),
                )
              : null,
          )
        : null

      return h(
        React.Fragment,
        null,
        h('style', { dangerouslySetInnerHTML: { __html: CSS } }),
        h(
          'div',
          {
            className: 'dsx-root',
            onDragEnter: (event) => {
              if (event.dataTransfer?.types?.includes('Files')) {
                event.preventDefault()
                setDragging(true)
              }
            },
            onDragOver: (event) => {
              if (event.dataTransfer?.types?.includes('Files')) {
                event.preventDefault()
                setDragging(true)
              }
            },
            onDragLeave: (event) => {
              if (event.currentTarget === event.target) setDragging(false)
            },
            onDrop: (event) => {
              event.preventDefault()
              setDragging(false)
              const file = event.dataTransfer?.files?.[0]
              if (file) importFile(file)
            },
          },
          h(
            'header',
            { className: 'dsx-top' },
            h(
              'div',
              { className: 'dsx-brand' },
              h('span', { className: 'dsx-brand-icon' }, h(SheetGlyph, { size: 20, active: true })),
              h(
                'div',
                { className: 'dsx-brand-text' },
                h('h1', { className: 'dsx-title' }, t('title')),
                h('p', { className: 'dsx-subtitle' }, t('subtitle')),
              ),
            ),
            h(
              'div',
              { className: 'dsx-actions' },
              h(
                'button',
                {
                  className: 'dsx-btn dsx-btn-primary',
                  onClick: createBook,
                  disabled: busy || importing,
                  'aria-label': t('newWorkbook'),
                },
                h(IconPlus),
                h('span', { className: 'dsx-btn-label' }, t('newWorkbook')),
              ),
              h(
                'button',
                {
                  className: 'dsx-btn',
                  onClick: () => fileInputRef.current?.click(),
                  disabled: importing,
                  'aria-label': importing ? t('reading') : t('importFile'),
                },
                importing ? h(Spinner) : h(IconImport),
                h('span', { className: 'dsx-btn-label' }, importing ? t('reading') : t('importFile')),
              ),
              h(
                'div',
                { className: 'dsx-export-wrap' },
                h(
                  'button',
                  {
                    className: 'dsx-btn',
                    onClick: () => setShowExport((value) => !value),
                    disabled: !book || exporting,
                    'aria-haspopup': 'menu',
                    'aria-expanded': showExport ? 'true' : 'false',
                    'aria-label': t('export'),
                  },
                  exporting ? h(Spinner) : h(IconExport),
                  h('span', { className: 'dsx-btn-label' }, t('export')),
                  h(IconChevron, { open: showExport }),
                ),
                showExport
                  ? h(
                      'div',
                      { className: 'dsx-menu', role: 'menu' },
                      h(
                        'button',
                        { className: 'dsx-menu-item', role: 'menuitem', onClick: exportCsv },
                        h(IconExport),
                        t('exportCsv'),
                      ),
                      h(
                        'button',
                        { className: 'dsx-menu-item', role: 'menuitem', onClick: exportXlsx },
                        h(IconExport),
                        t('exportXlsx'),
                      ),
                    )
                  : null,
              ),
              book
                ? confirmDelete === 'workbook'
                  ? h(
                      'button',
                      { className: 'dsx-btn dsx-btn-danger', onClick: deleteActiveBook },
                      t('deleteWorkbookConfirm'),
                    )
                  : h(
                      'button',
                      {
                        className: 'dsx-icon-btn',
                        onClick: deleteActiveBook,
                        title: t('deleteWorkbook'),
                        'aria-label': t('deleteWorkbook'),
                      },
                      h(IconTrash),
                    )
                : null,
              h('input', {
                ref: fileInputRef,
                type: 'file',
                accept: '.csv,.tsv,.txt,.xlsx',
                style: { display: 'none' },
                onChange: (event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ''
                  if (file) importFile(file)
                },
              }),
            ),
          ),
          h(
            'div',
            { className: 'dsx-body' },
            h(
              'aside',
              { className: 'dsx-rail' },
              h(
                'div',
                { className: 'dsx-rail-top' },
                h(
                  'button',
                  { className: 'dsx-btn dsx-btn-primary', onClick: createBook, disabled: busy || importing },
                  h(IconPlus),
                  t('newWorkbook'),
                ),
              ),
              workbookList.length > 5
                ? h(
                    'div',
                    { className: 'dsx-search-wrap' },
                    h(IconSearch),
                    h('input', {
                      className: 'dsx-search',
                      value: query,
                      onChange: (event) => setQuery(event.target.value),
                      placeholder: t('search'),
                      'aria-label': t('search'),
                    }),
                  )
                : null,
              h('div', { className: 'dsx-rail-label' }, t('sheets')),
              h(
                'div',
                { className: 'dsx-book-list' },
                filteredBooks.length === 0
                  ? h('div', { className: 'dsx-rail-empty' }, query ? t('noMatches') : t('noBooks'))
                  : filteredBooks.map((entry) =>
                      h(
                        'button',
                        {
                          key: entry.id,
                          className: `dsx-book-row${book?.id === entry.id ? ' dsx-active' : ''}`,
                          onClick: () => selectWorkbook(entry.id),
                          title: entry.name,
                        },
                        h('span', { className: 'dsx-book-icon' }, h(SheetGlyph, { size: 16, active: book?.id === entry.id })),
                        h(
                          'span',
                          { className: 'dsx-book-copy' },
                          h('span', { className: 'dsx-book-name' }, entry.name),
                          h(
                            'span',
                            { className: 'dsx-book-meta' },
                            `${t('sheetCount', { n: entry.sheetCount ?? entry.sheets?.length ?? 0 })} · ${formatRelative(entry.updatedAt, t)}`,
                          ),
                        ),
                      ),
                    ),
              ),
            ),
            h(
              'main',
              { className: 'dsx-main' },
              !book
                ? h(
                    'div',
                    { className: 'dsx-empty' },
                    h('span', { className: 'dsx-empty-icon' }, loading ? h(Spinner, { size: 22 }) : h(SheetGlyph, { size: 30 })),
                    h('h2', null, loading ? t('loading') : t('noBooks')),
                    h('p', null, t('noBooksHint')),
                    h(
                      'div',
                      { className: 'dsx-empty-actions' },
                      h(
                        'button',
                        { className: 'dsx-btn dsx-btn-primary', onClick: createBook, disabled: busy || importing },
                        h(IconPlus),
                        t('createFirst'),
                      ),
                      h(
                        'button',
                        { className: 'dsx-btn', onClick: () => fileInputRef.current?.click(), disabled: importing },
                        h(IconImport),
                        t('importFile'),
                      ),
                    ),
                    h('div', { className: 'dsx-empty-hint' }, t('gridHint')),
                  )
                : h(
                    React.Fragment,
                    null,
                    h(
                      'div',
                      { className: 'dsx-mobile-book' },
                      h(
                        'select',
                        {
                          value: book.id,
                          onChange: (event) => selectWorkbook(event.target.value),
                          'aria-label': t('workbookName'),
                        },
                        workbookList.map((entry) => h('option', { key: entry.id, value: entry.id }, entry.name)),
                      ),
                    ),
                    h(
                      'div',
                      { className: 'dsx-bookhead' },
                      h(
                        'div',
                        { className: 'dsx-booktitle-wrap' },
                        h('input', {
                          className: 'dsx-booktitle',
                          value: nameDraft,
                          onChange: (event) => setNameDraft(event.target.value),
                          onFocus: () => {
                            nameFocusedRef.current = true
                          },
                          onBlur: () => {
                            nameFocusedRef.current = false
                            commitWorkbookName()
                          },
                          onKeyDown: (event) => {
                            if (event.key === 'Enter') event.currentTarget.blur()
                            if (event.key === 'Escape') {
                              setNameDraft(book.name)
                              event.currentTarget.blur()
                            }
                          },
                          'aria-label': t('workbookName'),
                        }),
                        h('span', { className: 'dsx-bookmeta' }, activeMeta),
                      ),
                      saving ? h('span', { className: 'dsx-saving' }, h(Spinner, { size: 11 }), t('saving')) : null,
                    ),
                    h(
                      'div',
                      { className: 'dsx-toolbar' },
                      h(
                        'div',
                        { className: 'dsx-formula' },
                        h('span', { className: 'dsx-ref' }, selectionName),
                        h('span', { className: 'dsx-fx' }, 'fx'),
                        h('input', {
                          value: formulaValue,
                          onChange: onFormulaChange,
                          onFocus: onFormulaFocus,
                          onKeyDown: onFormulaKeyDown,
                          onBlur: () => commitEdit('none', false),
                          placeholder: t('formula'),
                          spellCheck: false,
                          'aria-label': t('formula'),
                        }),
                      ),
                      h(
                        'div',
                        { className: 'dsx-toolgroup' },
                        h(
                          'button',
                          {
                            className: 'dsx-icon-btn',
                            onClick: addRow,
                            title: t('addRow'),
                            'aria-label': t('addRow'),
                          },
                          h(IconRowPlus),
                        ),
                        h(
                          'button',
                          {
                            className: 'dsx-icon-btn',
                            onClick: addColumn,
                            title: t('addColumn'),
                            'aria-label': t('addColumn'),
                          },
                          h(IconColPlus),
                        ),
                        h(
                          'button',
                          {
                            className: 'dsx-icon-btn',
                            onClick: deleteRow,
                            title: t('deleteRow'),
                            'aria-label': t('deleteRow'),
                          },
                          h(IconRowMinus),
                        ),
                        h(
                          'button',
                          {
                            className: 'dsx-icon-btn',
                            onClick: deleteColumn,
                            title: t('deleteColumn'),
                            'aria-label': t('deleteColumn'),
                          },
                          h(IconColMinus),
                        ),
                      ),
                    ),
                    h(
                      'div',
                      { className: 'dsx-formatbar', role: 'toolbar', 'aria-label': t('format') },
                      h('span', { className: 'dsx-format-label' }, t('format')),
                      h(
                        'div',
                        { className: 'dsx-color-wrap' },
                        h(
                          'button',
                          {
                            className: 'dsx-icon-btn dsx-format-color',
                            title: t('fillColor'),
                            'aria-label': t('fillColor'),
                            'aria-haspopup': 'menu',
                            'aria-expanded': colorMenu === 'fill' ? 'true' : 'false',
                            onClick: () => setColorMenu(colorMenu === 'fill' ? null : 'fill'),
                          },
                          h('span', { className: 'dsx-fill-glyph', style: { backgroundColor: currentFormat?.fill ?? 'transparent', backgroundImage: currentFormat?.fill ? 'none' : undefined } }),
                        ),
                        colorMenu === 'fill'
                          ? h(
                              'div',
                              { className: 'dsx-color-popover', role: 'menu', 'aria-label': t('fillColor') },
                              h('div', { className: 'dsx-color-title' }, t('fillColor')),
                              h(
                                'div',
                                { className: 'dsx-swatches' },
                                h('button', {
                                  className: 'dsx-swatch dsx-swatch-none',
                                  title: t('noFill'),
                                  'aria-label': t('noFill'),
                                  onClick: () => applyFill(null),
                                }),
                                ...FILL_SWATCHES.map((color) =>
                                  h('button', {
                                    key: color,
                                    className: 'dsx-swatch',
                                    style: { background: color },
                                    title: color,
                                    'aria-label': color,
                                    onClick: () => applyFill(color),
                                  }),
                                ),
                              ),
                              h('input', {
                                type: 'color',
                                className: 'dsx-color-input',
                                value: currentFormat?.fill ?? '#FFF2CC',
                                onChange: (event) => applyFormat({ fill: event.target.value }),
                                title: t('customColor'),
                                'aria-label': t('customColor'),
                              }),
                            )
                          : null,
                      ),
                      h(
                        'div',
                        { className: 'dsx-color-wrap' },
                        h(
                          'button',
                          {
                            className: 'dsx-icon-btn dsx-format-color',
                            title: t('textColor'),
                            'aria-label': t('textColor'),
                            'aria-haspopup': 'menu',
                            'aria-expanded': colorMenu === 'text' ? 'true' : 'false',
                            onClick: () => setColorMenu(colorMenu === 'text' ? null : 'text'),
                          },
                          h('span', { className: 'dsx-text-glyph', style: { color: currentFormat?.color ?? (currentFormat?.fill ? contrastColor(currentFormat.fill) : 'currentColor') } }, 'A'),
                        ),
                        colorMenu === 'text'
                          ? h(
                              'div',
                              { className: 'dsx-color-popover', role: 'menu', 'aria-label': t('textColor') },
                              h('div', { className: 'dsx-color-title' }, t('textColor')),
                              h(
                                'div',
                                { className: 'dsx-swatches' },
                                h(
                                  'button',
                                  {
                                    className: 'dsx-swatch dsx-swatch-auto',
                                    title: t('automatic'),
                                    'aria-label': t('automatic'),
                                    onClick: () => applyTextColor(null),
                                  },
                                  'A',
                                ),
                                ...TEXT_SWATCHES.map((color) =>
                                  h(
                                    'button',
                                    {
                                      key: color,
                                      className: 'dsx-text-swatch',
                                      style: { color },
                                      title: color,
                                      'aria-label': color,
                                      onClick: () => applyTextColor(color),
                                    },
                                    'A',
                                  ),
                                ),
                              ),
                              h('input', {
                                type: 'color',
                                className: 'dsx-color-input',
                                value: currentFormat?.color ?? '#111827',
                                onChange: (event) => applyFormat({ color: event.target.value }),
                                title: t('customColor'),
                                'aria-label': t('customColor'),
                              }),
                            )
                          : null,
                      ),
                      h('span', { className: 'dsx-format-sep' }),
                      h(
                        'button',
                        {
                          className: `dsx-format-text${currentFormat?.bold ? ' dsx-on' : ''}`,
                          title: t('bold'),
                          'aria-label': t('bold'),
                          'aria-pressed': currentFormat?.bold ? 'true' : 'false',
                          onClick: toggleBold,
                        },
                        h('strong', null, 'B'),
                      ),
                      h(
                        'button',
                        {
                          className: `dsx-format-text dsx-italic${currentFormat?.italic ? ' dsx-on' : ''}`,
                          title: t('italic'),
                          'aria-label': t('italic'),
                          'aria-pressed': currentFormat?.italic ? 'true' : 'false',
                          onClick: toggleItalic,
                        },
                        h('em', null, 'I'),
                      ),
                      h('span', { className: 'dsx-format-sep' }),
                      h(
                        'div',
                        { className: 'dsx-toolgroup' },
                        h(
                          'button',
                          {
                            className: `dsx-icon-btn${currentFormat?.align === 'left' ? ' dsx-on' : ''}`,
                            title: t('alignLeft'),
                            'aria-label': t('alignLeft'),
                            'aria-pressed': currentFormat?.align === 'left' ? 'true' : 'false',
                            onClick: () => toggleAlign('left'),
                          },
                          h(IconAlignLeft),
                        ),
                        h(
                          'button',
                          {
                            className: `dsx-icon-btn${currentFormat?.align === 'center' ? ' dsx-on' : ''}`,
                            title: t('alignCenter'),
                            'aria-label': t('alignCenter'),
                            'aria-pressed': currentFormat?.align === 'center' ? 'true' : 'false',
                            onClick: () => toggleAlign('center'),
                          },
                          h(IconAlignCenter),
                        ),
                        h(
                          'button',
                          {
                            className: `dsx-icon-btn${currentFormat?.align === 'right' ? ' dsx-on' : ''}`,
                            title: t('alignRight'),
                            'aria-label': t('alignRight'),
                            'aria-pressed': currentFormat?.align === 'right' ? 'true' : 'false',
                            onClick: () => toggleAlign('right'),
                          },
                          h(IconAlignRight),
                        ),
                      ),
                      h(
                        'button',
                        {
                          className: `dsx-icon-btn${currentFormat?.wrap ? ' dsx-on' : ''}`,
                          title: t('wrapText'),
                          'aria-label': t('wrapText'),
                          'aria-pressed': currentFormat?.wrap ? 'true' : 'false',
                          onClick: toggleWrap,
                        },
                        h(IconWrap),
                      ),
                      h('span', { className: 'dsx-format-sep' }),
                      h(
                        'button',
                        {
                          className: 'dsx-icon-btn',
                          title: t('fitColumns'),
                          'aria-label': t('fitColumns'),
                          onClick: fitColumns,
                        },
                        h(IconFit),
                      ),
                      h(
                        'button',
                        {
                          className: 'dsx-icon-btn',
                          title: t('clearFormatting'),
                          'aria-label': t('clearFormatting'),
                          onClick: clearFormatting,
                        },
                        h(IconEraser),
                      ),
                    ),
                    grid,
                    h(
                      'div',
                      { className: 'dsx-sheetbar', role: 'tablist', 'aria-label': t('sheets') },
                      book.sheets.map((sheet) =>
                        renamingSheet?.id === sheet.id
                          ? h('input', {
                              key: sheet.id,
                              className: 'dsx-tab-input',
                              value: renamingSheet.value,
                              onChange: (event) => updateRenamingSheet({ ...renamingSheetRef.current, value: event.target.value }),
                              onBlur: () => finishRenameSheet(true),
                              onKeyDown: (event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault()
                                  finishRenameSheet(true)
                                } else if (event.key === 'Escape') {
                                  event.preventDefault()
                                  finishRenameSheet(false)
                                }
                              },
                              ref: (element) => {
                                if (!element) return
                                element.focus()
                                element.select()
                              },
                              'aria-label': t('renameSheet'),
                            })
                          : h(
                              'button',
                              {
                                key: sheet.id,
                                className: `dsx-tab${activeSheet?.id === sheet.id ? ' dsx-active' : ''}`,
                                onClick: () => switchSheet(sheet.id),
                                onDoubleClick: () => startRenameSheet(sheet),
                                role: 'tab',
                                'aria-selected': activeSheet?.id === sheet.id ? 'true' : 'false',
                                title: sheet.name,
                              },
                              sheet.name,
                            ),
                      ),
                      h(
                        'button',
                        {
                          className: 'dsx-icon-btn',
                          onClick: addSheet,
                          title: t('addSheet'),
                          'aria-label': t('addSheet'),
                        },
                        h(IconPlus),
                      ),
                      h('span', { className: 'dsx-sheetbar-spacer' }),
                      h(
                        'button',
                        {
                          className: `dsx-icon-btn${confirmDelete === 'sheet' ? ' dsx-danger' : ''}`,
                          onClick: deleteActiveSheet,
                          disabled: book.sheets.length <= 1,
                          title: confirmDelete === 'sheet' ? t('deleteSheetConfirm') : t('deleteSheet'),
                          'aria-label': confirmDelete === 'sheet' ? t('deleteSheetConfirm') : t('deleteSheet'),
                        },
                        h(IconTrash),
                      ),
                    ),
                  ),
            ),
          ),
          status
            ? h(
                'div',
                {
                  className: `dsx-status dsx-status-${status.kind}`,
                  role: 'status',
                  'aria-live': 'polite',
                },
                status.message,
              )
            : null,
          dragging ? h('div', { className: 'dsx-drop' }, h(IconImport, { size: 22 }), t('dropHint')) : null,
        ),
      )
    }

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { en, pl }), `${NS}: dictionaries`)
      // Rebind on every call so the panel follows a live locale switch, not the
      // dictionary that happened to be active when the module loaded.
      const t = (key, values) => ctx.locale.bind(NS)(key, values)
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: 'dsh-sheets',
            order: 30,
            label: () => t('title'),
            locale: NS,
          },
          SheetGlyph,
        ),
      )
      ctx.slots.inject('main', () =>
        ctx.slots.register(
          {
            name: 'main',
            key: 'dsh-sheets',
            label: () => t('title'),
            locale: NS,
          },
          () => h(SheetErrorBoundary, { t }, h(SheetApp, { t, locale: ctx.locale })),
        ),
      )
    }

    return { inject: ['slots', 'locale'], apply }
  },
})
