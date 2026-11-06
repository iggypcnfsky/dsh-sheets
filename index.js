/**
 * Host half of the Sheets bundle.
 *
 * Owns the durable workbook store, the browser bridge used by the Sheets panel,
 * and the agent tools that create, read, and edit workbooks.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import XLSX from 'xlsx'

const WEB_PREFIX = '/dsh-sheets/api'
const MAX_WORKBOOKS = 500
const MAX_SHEETS = 60
const MAX_ROWS = 5000
const MAX_COLS = 120
const MAX_CELLS = 250_000
const MAX_BODY_BYTES = 24 * 1024 * 1024
const MAX_NAME = 120
const MAX_SHEET_NAME = 60

export const inject = ['tools', 'webServer']

function nowIso() {
  return new Date().toISOString()
}

function newId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`
}

function text(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  return String(value)
}

function truthyName(value, fallback) {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  return (trimmed || fallback).slice(0, MAX_NAME)
}

function safeSheetName(value, fallback) {
  const trimmed = typeof value === 'string' ? value.trim().replace(/[\r\n\t]+/g, ' ') : ''
  return (trimmed || fallback).slice(0, MAX_SHEET_NAME)
}

function normalizeRows(input) {
  if (!Array.isArray(input)) return []
  const rows = []
  for (const row of input) {
    if (!Array.isArray(row)) continue
    const next = row.map(text)
    while (next.length > 0 && next[next.length - 1] === '') next.pop()
    rows.push(next.slice(0, MAX_COLS))
  }
  while (rows.length > 0 && rows[rows.length - 1].every((cell) => cell === '')) rows.pop()
  return rows.slice(0, MAX_ROWS)
}

function cellCount(rows) {
  let total = 0
  for (const row of rows) total += row.length
  return total
}

function colIndex(letter) {
  const normalized = String(letter ?? '').trim().replace(/\$/g, '').toUpperCase()
  if (!/^[A-Z]{1,3}$/.test(normalized)) return null
  let value = 0
  for (const char of normalized) value = value * 26 + (char.charCodeAt(0) - 64)
  return value - 1
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

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function hasData(rows) {
  return rows.some((row) => row.some((cell) => cell !== ''))
}

function maxCols(rows) {
  let width = 0
  for (const row of rows) width = Math.max(width, row.length)
  return width
}

function setCellSize(rows, rowIndex, colIndexValue) {
  while (rows.length <= rowIndex) rows.push([])
  for (const row of rows) {
    while (row.length <= colIndexValue) row.push('')
  }
}

function trimTrailing(row) {
  while (row.length > 0 && row[row.length - 1] === '') row.pop()
}

function sheetSummary(sheet) {
  return {
    id: sheet.id,
    name: sheet.name,
    rows: sheet.rows.length,
    cols: maxCols(sheet.rows),
  }
}

function bookSummary(book) {
  return {
    id: book.id,
    name: book.name,
    rev: book.rev,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
    activeSheetId: book.activeSheetId,
    sheetCount: book.sheets.length,
    sheets: book.sheets.map(sheetSummary),
  }
}

function uniqueSheetName(book, wanted, exceptId) {
  const base = safeSheetName(wanted, 'Sheet')
  const taken = new Set(
    book.sheets.filter((sheet) => sheet.id !== exceptId).map((sheet) => sheet.name.toLowerCase()),
  )
  if (!taken.has(base.toLowerCase())) return base
  let n = 2
  while (taken.has(`${base} ${n}`.toLowerCase())) n += 1
  return `${base} ${n}`.slice(0, MAX_SHEET_NAME)
}


function parseColor(value) {
  if (value === null || value === undefined) return null
  let raw = String(value).trim().replace(/^#/, '')
  if (raw === '' || /^(none|auto|transparent)$/i.test(raw)) return null
  if (/^[0-9a-f]{3}$/i.test(raw)) raw = raw.split('').map((char) => char + char).join('')
  if (!/^[0-9a-f]{6}$/i.test(raw)) return null
  return `#${raw.toUpperCase()}`
}

function normalizeFormatEntry(value) {
  if (!value || typeof value !== 'object') return null
  const out = {}
  const fill = parseColor(value.fill)
  const color = parseColor(value.color)
  if (fill) out.fill = fill
  if (color) out.color = color
  if (value.bold === true) out.bold = true
  if (value.italic === true) out.italic = true
  if (value.wrap === true) out.wrap = true
  if (value.align === 'left' || value.align === 'center' || value.align === 'right') out.align = value.align
  return Object.keys(out).length > 0 ? out : null
}

function normalizeFormats(input) {
  if (!input || typeof input !== 'object') return {}
  const out = {}
  let count = 0
  for (const [key, value] of Object.entries(input)) {
    if (count >= 50000) break
    if (!/^\d+:\d+$/.test(key)) continue
    const entry = normalizeFormatEntry(value)
    if (entry === null) continue
    out[key] = entry
    count += 1
  }
  return out
}

function normalizeColWidths(input) {
  if (!input || typeof input !== 'object') return {}
  const out = {}
  for (const [key, value] of Object.entries(input)) {
    const column = Number(key)
    const width = Number(value)
    if (!Number.isInteger(column) || column < 0 || column >= MAX_COLS) continue
    if (!Number.isFinite(width) || width < 60 || width > 600) continue
    out[String(column)] = Math.round(width)
  }
  return out
}

function shiftFormats(sheet, axis, start, count, mode) {
  const source = sheet.formats && typeof sheet.formats === 'object' ? sheet.formats : {}
  const out = {}
  for (const [key, value] of Object.entries(source)) {
    const [rowText, colText] = key.split(':')
    let row = Number(rowText)
    let col = Number(colText)
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

function shiftColWidths(sheet, start, count, mode) {
  const source = sheet.colWidths && typeof sheet.colWidths === 'object' ? sheet.colWidths : {}
  const out = {}
  for (const [key, value] of Object.entries(source)) {
    let column = Number(key)
    if (!Number.isInteger(column)) continue
    if (mode === 'insert') {
      if (column >= start) column += count
    } else {
      if (column >= start && column < start + count) continue
      if (column >= start + count) column -= count
    }
    if (column < 0 || column >= MAX_COLS) continue
    out[String(column)] = value
  }
  sheet.colWidths = out
}

function applyFormatRange(sheet, range, patch, clear) {
  if (!sheet) throw new Error('Unknown sheet')
  if (!range) throw new Error('range must look like A1:D20')
  const area = (range.endRow - range.startRow + 1) * (range.endCol - range.startCol + 1)
  if (area > 20000) throw new Error('That range is too large to format in one operation')
  const formats = sheet.formats && typeof sheet.formats === 'object' ? sheet.formats : {}
  if (clear === true) {
    for (let row = range.startRow; row <= range.endRow; row += 1) {
      for (let col = range.startCol; col <= range.endCol; col += 1) delete formats[`${row}:${col}`]
    }
    sheet.formats = formats
    return
  }
  const source = patch && typeof patch === 'object' ? patch : {}
  for (let row = range.startRow; row <= range.endRow; row += 1) {
    for (let col = range.startCol; col <= range.endCol; col += 1) {
      const key = `${row}:${col}`
      const next = { ...(formats[key] ?? {}) }
      if (Object.hasOwn(source, 'fill')) {
        const fill = parseColor(source.fill)
        if (fill) next.fill = fill
        else delete next.fill
      }
      if (Object.hasOwn(source, 'color')) {
        const color = parseColor(source.color)
        if (color) next.color = color
        else delete next.color
      }
      if (Object.hasOwn(source, 'bold')) {
        if (source.bold === true) next.bold = true
        else delete next.bold
      }
      if (Object.hasOwn(source, 'italic')) {
        if (source.italic === true) next.italic = true
        else delete next.italic
      }
      if (Object.hasOwn(source, 'wrap')) {
        if (source.wrap === true) next.wrap = true
        else delete next.wrap
      }
      if (Object.hasOwn(source, 'align')) {
        if (source.align === 'left' || source.align === 'center' || source.align === 'right') next.align = source.align
        else delete next.align
      }
      if (Object.keys(next).length > 0) formats[key] = next
      else delete formats[key]
    }
  }
  if (Object.keys(formats).length > 50000) throw new Error('A sheet may contain at most 50,000 formatted cells')
  sheet.formats = formats
}

function normalizeBook(book) {
  if (!book || typeof book !== 'object') throw new Error('Workbook is not an object')
  const id = typeof book.id === 'string' && /^wb_[a-z0-9-]+$/i.test(book.id) ? book.id : newId('wb')
  const sheets = Array.isArray(book.sheets) && book.sheets.length > 0 ? book.sheets : [{ id: newId('sh'), name: 'Sheet 1', rows: [[]] }]
  const normalizedSheets = sheets.slice(0, MAX_SHEETS).map((sheet, index) => {
    const rows = normalizeRows(sheet?.rows)
    return {
      id: typeof sheet?.id === 'string' && /^sh_[a-z0-9-]+$/i.test(sheet.id) ? sheet.id : newId('sh'),
      name: safeSheetName(sheet?.name, `Sheet ${index + 1}`),
      rows: rows.length > 0 ? rows : [[]],
      formats: normalizeFormats(sheet?.formats),
      colWidths: normalizeColWidths(sheet?.colWidths),
    }
  })
  const names = new Set()
  for (const sheet of normalizedSheets) {
    let candidate = sheet.name
    let n = 2
    while (names.has(candidate.toLowerCase())) {
      candidate = `${safeSheetName(sheet.name, 'Sheet')} ${n}`.slice(0, MAX_SHEET_NAME)
      n += 1
    }
    sheet.name = candidate
    names.add(candidate.toLowerCase())
  }
  const activeSheetId = normalizedSheets.some((sheet) => sheet.id === book.activeSheetId)
    ? book.activeSheetId
    : normalizedSheets[0].id
  return {
    id,
    name: truthyName(book.name, 'Untitled spreadsheet'),
    rev: Number.isFinite(book.rev) ? Math.max(1, Math.floor(book.rev)) : 1,
    createdAt: typeof book.createdAt === 'string' ? book.createdAt : nowIso(),
    updatedAt: typeof book.updatedAt === 'string' ? book.updatedAt : nowIso(),
    activeSheetId,
    sheets: normalizedSheets,
  }
}

function newBook(input = {}) {
  const sheetsInput = Array.isArray(input.sheets) && input.sheets.length > 0
    ? input.sheets
    : [{ name: 'Sheet 1', rows: [] }]
  const book = normalizeBook({
    id: newId('wb'),
    name: truthyName(input.name, 'Untitled spreadsheet'),
    rev: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    sheets: sheetsInput.map((sheet, index) => {
      const rows = []
      const columns = Array.isArray(sheet?.columns) ? sheet.columns.map(text) : []
      if (columns.length > 0) rows.push(columns)
      if (Array.isArray(sheet?.rows)) {
        for (const row of sheet.rows) rows.push(Array.isArray(row) ? row.map(text) : [text(row)])
      }
      return {
        id: newId('sh'),
        name: safeSheetName(sheet?.name, `Sheet ${index + 1}`),
        rows,
        formats: sheet?.formats,
        colWidths: sheet?.colWidths,
      }
    }),
  })
  return book
}

function findSheet(book, reference) {
  if (!reference) {
    return book.sheets.find((sheet) => sheet.id === book.activeSheetId) ?? book.sheets[0]
  }
  const raw = String(reference).trim()
  const byId = book.sheets.find((sheet) => sheet.id === raw)
  if (byId) return byId
  const lowered = raw.toLowerCase()
  return book.sheets.find((sheet) => sheet.name.toLowerCase() === lowered) ?? null
}

function workbookRef(book) {
  return { id: book.id, name: book.name }
}


function expandImportPath(value) {
  const raw = String(value ?? '').trim()
  if (raw === '~') return os.homedir()
  if (raw.startsWith('~/')) return path.join(os.homedir(), raw.slice(2))
  return path.resolve(raw)
}

function spreadsheetCellText(cell) {
  if (!cell) return ''
  if (typeof cell.f === 'string' && cell.f.trim() !== '') return `=${cell.f}`
  if (cell.t === 'b') return cell.v ? 'TRUE' : 'FALSE'
  if (cell.t === 'e') return String(cell.w ?? cell.v ?? '')
  if (cell.t === 'd') {
    if (cell.w) return String(cell.w)
    const date = cell.v instanceof Date ? cell.v : new Date(cell.v)
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
  }
  if (cell.t === 'n') {
    const isDate = XLSX.SSF && typeof XLSX.SSF.is_date === 'function' && cell.z ? XLSX.SSF.is_date(cell.z) : false
    if (isDate && cell.w) return String(cell.w)
    return Number.isFinite(cell.v) ? String(cell.v) : ''
  }
  return String(cell.v ?? cell.w ?? '')
}


function importedFill(style) {
  if (!style || typeof style !== 'object') return null
  const raw = style.fgColor?.rgb ?? style.bgColor?.rgb ?? null
  if (!raw) return null
  let hex = String(raw).replace(/^#/, '').toUpperCase()
  if (hex.length === 8) hex = hex.slice(-6)
  if (!/^[0-9A-F]{6}$/.test(hex)) return null
  if (hex === 'FFFFFF') return null
  return `#${hex}`
}

async function readImportFile(filePath, maxRows, maxColumns) {
  const stat = await fs.stat(filePath)
  if (!stat.isFile()) throw new Error('The import path is not a file')
  if (stat.size > 50 * 1024 * 1024) throw new Error('The import file is larger than 50 MB')
  const extension = path.extname(filePath).toLowerCase()
  if (!['.xlsx', '.xls', '.xlsm', '.csv', '.tsv', '.txt'].includes(extension)) {
    throw new Error('Import supports .xlsx, .xls, .xlsm, .csv, .tsv, and .txt files')
  }
  let workbook
  try {
    workbook = XLSX.readFile(filePath, { cellFormula: true, cellStyles: true, cellDates: false, raw: false })
  } catch (error) {
    throw new Error(`Could not read ${path.basename(filePath)}: ${error?.message ?? error}`)
  }
  const names = workbook.SheetNames.slice(0, MAX_SHEETS)
  if (names.length === 0) throw new Error('The file contains no sheets')
  let truncated = false
  const sheets = names.map((name) => {
    const worksheet = workbook.Sheets[name]
    if (!worksheet || !worksheet['!ref']) return { name: safeSheetName(name, 'Sheet'), rows: [], formats: {}, colWidths: {} }
    const range = XLSX.utils.decode_range(worksheet['!ref'])
    const lastRow = Math.min(range.e.r, maxRows - 1)
    const lastColumn = Math.min(range.e.c, maxColumns - 1)
    if (range.e.r > lastRow || range.e.c > lastColumn) truncated = true
    const rows = []
    const formats = {}
    const colWidths = {}
    const columns = Array.isArray(worksheet['!cols']) ? worksheet['!cols'] : []
    for (let c = 0; c <= lastColumn; c += 1) {
      const info = columns[c]
      if (!info) continue
      const pixels = Number(info.width) ? Number(info.width) * 7 + 5 : Number(info.wpx ?? 0)
      if (!Number.isFinite(pixels) || pixels <= 0) continue
      colWidths[String(c)] = Math.round(Math.max(60, Math.min(600, pixels)))
    }
    for (let r = 0; r <= lastRow; r += 1) {
      const row = []
      for (let c = 0; c <= lastColumn; c += 1) {
        const address = XLSX.utils.encode_cell({ r, c })
        const cell = worksheet[address]
        row.push(spreadsheetCellText(cell))
        const fill = importedFill(cell?.s)
        if (fill && Object.keys(formats).length < 50000) formats[`${r}:${c}`] = { fill }
      }
      rows.push(row)
    }
    return { name: safeSheetName(name, 'Sheet'), rows: normalizeRows(rows), formats, colWidths }
  })
  return { sheets, truncated }
}

function rowTable(rows, fromRow = 0, fromCol = 0, width = maxCols(rows), maxRows = 200, rowNumberOffset = fromRow) {
  const lines = []
  const header = ['']
  for (let c = 0; c < width; c += 1) header.push(colLetter(fromCol + c))
  lines.push(header.join('\t'))
  const end = Math.min(rows.length, fromRow + maxRows)
  for (let r = fromRow; r < end; r += 1) {
    const line = [String(rowNumberOffset + r + 1)]
    for (let c = 0; c < width; c += 1) {
      const cell = text(rows[r]?.[fromCol + c]).replace(/\r?\n|\r/g, ' ').replace(/\t/g, ' ')
      line.push(cell.length > 500 ? `${cell.slice(0, 497)}...` : cell)
    }
    lines.push(line.join('\t'))
  }
  if (rows.length > end) lines.push(`... ${rows.length - end} more rows`)
  return lines.join('\n')
}

async function readJsonBody(req) {
  let size = 0
  const chunks = []
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > MAX_BODY_BYTES) {
      const error = new Error('Request body is too large')
      error.statusCode = 413
      throw error
    }
    chunks.push(buffer)
  }
  if (size === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    const error = new Error('Request body is not valid JSON')
    error.statusCode = 400
    throw error
  }
}

function writeJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  })
  res.end(body)
}

class SheetStore {
  constructor(directory) {
    this.directory = directory
    this.books = new Map()
    this.ready = this.load()
    this.queue = Promise.resolve()
  }

  async load() {
    await fs.mkdir(this.directory, { recursive: true })
    let entries = []
    try {
      entries = await fs.readdir(this.directory, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) continue
      const file = path.join(this.directory, entry.name)
      try {
        const parsed = JSON.parse(await fs.readFile(file, 'utf8'))
        const book = normalizeBook(parsed)
        this.books.set(book.id, book)
      } catch (error) {
        console.error(`[dsh-sheets] ignoring unreadable workbook ${file}: ${error?.message ?? error}`)
      }
    }
  }

  async ensureReady() {
    await this.ready
  }

  async serial(task) {
    const run = this.queue.then(task, task)
    this.queue = run.catch(() => {})
    return run
  }

  async list() {
    await this.ensureReady()
    return [...this.books.values()]
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
      .map(bookSummary)
  }

  async all() {
    await this.ensureReady()
    return [...this.books.values()].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
  }

  async get(id) {
    await this.ensureReady()
    const book = this.books.get(String(id ?? ''))
    return book ? clone(book) : null
  }

  async create(input) {
    return this.serial(async () => {
      await this.ensureReady()
      if (this.books.size >= MAX_WORKBOOKS) {
        const error = new Error(`The spreadsheet store is limited to ${MAX_WORKBOOKS} workbooks`)
        error.statusCode = 409
        throw error
      }
      const book = newBook(input)
      if (cellCount(book.sheets.flatMap((sheet) => sheet.rows)) > MAX_CELLS) {
        const error = new Error(`A workbook may contain at most ${MAX_CELLS} cells`)
        error.statusCode = 413
        throw error
      }
      await this.persist(book)
      this.books.set(book.id, book)
      return clone(book)
    })
  }

  async apply(id, operation) {
    return this.serial(async () => {
      await this.ensureReady()
      const current = this.books.get(String(id ?? ''))
      if (!current) {
        const error = new Error('Workbook not found')
        error.statusCode = 404
        throw error
      }
      const book = clone(current)
      mutateBook(book, operation)
      if (book.sheets.length > MAX_SHEETS) throw new Error(`A workbook may contain at most ${MAX_SHEETS} sheets`)
      if (book.sheets.some((sheet) => sheet.rows.length > MAX_ROWS)) throw new Error(`A sheet may contain at most ${MAX_ROWS} rows`)
      if (book.sheets.some((sheet) => maxCols(sheet.rows) > MAX_COLS)) throw new Error(`A sheet may contain at most ${MAX_COLS} columns`)
      if (cellCount(book.sheets.flatMap((sheet) => sheet.rows)) > MAX_CELLS) {
        const error = new Error(`A workbook may contain at most ${MAX_CELLS} cells`)
        error.statusCode = 413
        throw error
      }
      book.rev += 1
      book.updatedAt = nowIso()
      await this.persist(book)
      this.books.set(book.id, book)
      return clone(book)
    })
  }

  async delete(id) {
    return this.serial(async () => {
      await this.ensureReady()
      const book = this.books.get(String(id ?? ''))
      if (!book) {
        const error = new Error('Workbook not found')
        error.statusCode = 404
        throw error
      }
      try {
        await fs.unlink(this.fileFor(book.id))
      } catch (error) {
        if (error?.code !== 'ENOENT') throw error
      }
      this.books.delete(book.id)
      return true
    })
  }

  fileFor(id) {
    if (!/^wb_[a-z0-9-]+$/i.test(String(id))) throw new Error('Invalid workbook id')
    return path.join(this.directory, `${id}.json`)
  }

  async persist(book) {
    const file = this.fileFor(book.id)
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`
    await fs.writeFile(tmp, JSON.stringify(book, null, 2), 'utf8')
    await fs.rename(tmp, file)
  }
}

function ensureSheetSized(sheet, rowCount, colCountValue) {
  while (sheet.rows.length < rowCount) sheet.rows.push([])
  for (const row of sheet.rows) {
    while (row.length < colCountValue) row.push('')
  }
}

function mutateBook(book, rawOperation) {
  const operation = rawOperation && typeof rawOperation === 'object' ? rawOperation : {}
  const type = String(operation.type ?? '')
  const sheet = operation.sheet ? findSheet(book, operation.sheet) : null
  switch (type) {
    case 'set_cells': {
      if (!sheet) throw new Error('Unknown sheet')
      const start = parseA1(operation.start ?? 'A1')
      if (!start) throw new Error('start must be an A1 cell reference such as A1 or C4')
      const values = Array.isArray(operation.values) ? operation.values : []
      if (values.length === 0) return
      const width = Math.max(...values.map((row) => (Array.isArray(row) ? row.length : 1)))
      ensureSheetSized(sheet, start.row + values.length, start.col + width)
      for (let r = 0; r < values.length; r += 1) {
        const row = Array.isArray(values[r]) ? values[r] : [values[r]]
        for (let c = 0; c < row.length; c += 1) {
          sheet.rows[start.row + r][start.col + c] = text(row[c])
        }
      }
      for (const row of sheet.rows) trimTrailing(row)
      while (sheet.rows.length > 0 && sheet.rows[sheet.rows.length - 1].every((cell) => cell === '')) sheet.rows.pop()
      if (sheet.rows.length === 0) sheet.rows = [[]]
      return
    }
    case 'append_rows': {
      if (!sheet) throw new Error('Unknown sheet')
      const values = Array.isArray(operation.values) ? operation.values : []
      for (const row of values) {
        const cells = (Array.isArray(row) ? row : [row]).map(text).slice(0, MAX_COLS)
        while (sheet.rows.length > 0 && sheet.rows[sheet.rows.length - 1].length === 0) sheet.rows.pop()
        sheet.rows.push(cells)
      }
      return
    }
    case 'replace_rows': {
      if (!sheet) throw new Error('Unknown sheet')
      const rows = normalizeRows(operation.values)
      sheet.rows = rows.length > 0 ? rows : [[]]
      return
    }
    case 'clear_range': {
      if (!sheet) throw new Error('Unknown sheet')
      const range = parseRange(operation.range ?? 'A1')
      if (!range) throw new Error('range must look like A1:D20')
      ensureSheetSized(sheet, range.endRow + 1, range.endCol + 1)
      for (let r = range.startRow; r <= range.endRow; r += 1) {
        for (let c = range.startCol; c <= range.endCol; c += 1) sheet.rows[r][c] = ''
      }
      for (const row of sheet.rows) trimTrailing(row)
      while (sheet.rows.length > 0 && sheet.rows[sheet.rows.length - 1].every((cell) => cell === '')) sheet.rows.pop()
      if (sheet.rows.length === 0) sheet.rows = [[]]
      return
    }
    case 'add_sheet': {
      if (book.sheets.length >= MAX_SHEETS) throw new Error(`A workbook may contain at most ${MAX_SHEETS} sheets`)
      const created = {
        id: newId('sh'),
        name: uniqueSheetName(book, operation.name || `Sheet ${book.sheets.length + 1}`),
        rows: [[]],
        formats: {},
        colWidths: {},
      }
      const rows = normalizeRows(operation.rows)
      if (rows.length > 0) created.rows = rows
      if (operation.formats) created.formats = normalizeFormats(operation.formats)
      if (operation.colWidths) created.colWidths = normalizeColWidths(operation.colWidths)
      book.sheets.push(created)
      book.activeSheetId = created.id
      return
    }
    case 'rename_sheet': {
      if (!sheet) throw new Error('Unknown sheet')
      sheet.name = uniqueSheetName(book, operation.name || operation.new_name || sheet.name, sheet.id)
      return
    }
    case 'delete_sheet': {
      if (!sheet) throw new Error('Unknown sheet')
      if (book.sheets.length <= 1) throw new Error('A workbook must keep at least one sheet')
      book.sheets = book.sheets.filter((candidate) => candidate.id !== sheet.id)
      if (book.activeSheetId === sheet.id) book.activeSheetId = book.sheets[0].id
      return
    }
    case 'set_active_sheet': {
      if (!sheet) throw new Error('Unknown sheet')
      book.activeSheetId = sheet.id
      return
    }
    case 'rename_workbook': {
      book.name = truthyName(operation.name || operation.new_name, book.name)
      return
    }
    case 'add_rows': {
      if (!sheet) throw new Error('Unknown sheet')
      const count = Math.max(1, Math.min(1000, Math.floor(Number(operation.count) || 1)))
      const start = Math.max(0, Math.min(sheet.rows.length, Math.floor(Number(operation.start_row ?? sheet.rows.length + 1) || 1) - 1))
      const width = Math.max(1, maxCols(sheet.rows))
      const blank = Array.from({ length: count }, () => Array.from({ length: width }, () => ''))
      shiftFormats(sheet, 'row', start, count, 'insert')
      sheet.rows.splice(start, 0, ...blank)
      return
    }
    case 'delete_rows': {
      if (!sheet) throw new Error('Unknown sheet')
      const count = Math.max(1, Math.min(1000, Math.floor(Number(operation.count) || 1)))
      const start = Math.max(0, Math.floor(Number(operation.start_row) || 1) - 1)
      shiftFormats(sheet, 'row', start, count, 'delete')
      sheet.rows.splice(start, count)
      if (sheet.rows.length === 0) sheet.rows = [[]]
      return
    }
    case 'add_columns': {
      if (!sheet) throw new Error('Unknown sheet')
      const count = Math.max(1, Math.min(50, Math.floor(Number(operation.count) || 1)))
      const start = colIndex(operation.start_column ?? '') ?? maxCols(sheet.rows)
      shiftFormats(sheet, 'col', start, count, 'insert')
      shiftColWidths(sheet, start, count, 'insert')
      ensureSheetSized(sheet, sheet.rows.length, Math.max(maxCols(sheet.rows), start))
      for (const row of sheet.rows) {
        row.splice(start, 0, ...Array.from({ length: count }, () => ''))
      }
      return
    }
    case 'delete_columns': {
      if (!sheet) throw new Error('Unknown sheet')
      const count = Math.max(1, Math.min(50, Math.floor(Number(operation.count) || 1)))
      const start = colIndex(operation.start_column ?? '')
      if (start === null) throw new Error('start_column must be a column letter such as A or C')
      shiftFormats(sheet, 'col', start, count, 'delete')
      shiftColWidths(sheet, start, count, 'delete')
      for (const row of sheet.rows) row.splice(start, count)
      for (const row of sheet.rows) trimTrailing(row)
      if (maxCols(sheet.rows) === 0) sheet.rows = sheet.rows.length > 0 ? sheet.rows : [[]]
      return
    }
    case 'set_format': {
      if (!sheet) throw new Error('Unknown sheet')
      const range = parseRange(operation.range ?? operation.start ?? 'A1')
      if (!range) throw new Error('range must look like A1:D20')
      applyFormatRange(sheet, range, operation.patch ?? {}, false)
      return
    }
    case 'clear_format': {
      if (!sheet) throw new Error('Unknown sheet')
      const range = parseRange(operation.range ?? operation.start ?? 'A1')
      if (!range) throw new Error('range must look like A1:D20')
      applyFormatRange(sheet, range, {}, true)
      return
    }
    case 'set_col_width': {
      if (!sheet) throw new Error('Unknown sheet')
      const column = Number(operation.column)
      const width = Number(operation.width)
      if (!Number.isInteger(column) || column < 0 || column >= MAX_COLS) throw new Error('column must be a zero-based column index')
      if (!Number.isFinite(width) || width < 60 || width > 600) throw new Error('width must be between 60 and 600 pixels')
      sheet.colWidths = { ...(sheet.colWidths ?? {}), [String(column)]: Math.round(width) }
      return
    }
    case 'set_col_widths': {
      if (!sheet) throw new Error('Unknown sheet')
      sheet.colWidths = { ...(sheet.colWidths ?? {}), ...normalizeColWidths(operation.widths) }
      return
    }
    case 'import_sheets': {
      const sheets = Array.isArray(operation.sheets) ? operation.sheets : []
      if (sheets.length === 0) throw new Error('No sheets to import')
      if (operation.replace) {
        book.sheets = []
      }
      for (const [index, input] of sheets.entries()) {
        if (book.sheets.length >= MAX_SHEETS) throw new Error(`A workbook may contain at most ${MAX_SHEETS} sheets`)
        const rows = []
        if (Array.isArray(input?.columns) && input.columns.length > 0) rows.push(input.columns.map(text))
        if (Array.isArray(input?.rows)) {
          for (const row of input.rows) rows.push(Array.isArray(row) ? row.map(text) : [text(row)])
        }
        const normalized = normalizeRows(rows)
        book.sheets.push({
          id: newId('sh'),
          name: uniqueSheetName(book, input?.name || `Sheet ${index + 1}`),
          rows: normalized.length > 0 ? normalized : [[]],
          formats: normalizeFormats(input?.formats),
          colWidths: normalizeColWidths(input?.colWidths),
        })
      }
      if (operation.replace) book.activeSheetId = book.sheets[0].id
      return
    }
    default:
      throw new Error(`Unknown spreadsheet operation "${type}"`)
  }
}

function resolveDataDirectory() {
  if (typeof process.env.DSH_SHEETS_DIR === 'string' && process.env.DSH_SHEETS_DIR.trim() !== '') {
    return path.resolve(process.env.DSH_SHEETS_DIR.trim())
  }
  const profile = typeof process.env.DSH_PROFILE_DIR === 'string' ? process.env.DSH_PROFILE_DIR.trim() : ''
  return profile
    ? path.join(profile, 'data', 'dsh-sheets')
    : path.join(os.homedir(), '.dsh', 'data', 'dsh-sheets')
}

function registerRoutes(ctx, store) {
  const connection = ctx.get('connection')
  const allowed = (req) => {
    if (!connection || typeof connection.requestRejection !== 'function') return true
    try {
      return connection.requestRejection(req) === undefined
    } catch {
      return false
    }
  }

  const handler = async (req, res) => {
    if (!allowed(req)) {
      writeJson(res, 403, { ok: false, error: { code: 'forbidden', message: 'Forbidden' } })
      return
    }
    const url = new URL(req.url ?? '/', 'http://dsh.internal')
    const name = url.pathname.startsWith(`${WEB_PREFIX}/`)
      ? url.pathname.slice(WEB_PREFIX.length + 1)
      : ''
    try {
      if (req.method === 'GET' && name === 'list') {
        writeJson(res, 200, { ok: true, workbooks: await store.list() })
        return
      }
      if (req.method === 'GET' && name === 'get') {
        const id = url.searchParams.get('id') ?? ''
        const workbook = await store.get(id)
        if (!workbook) {
          writeJson(res, 404, { ok: false, error: { code: 'not-found', message: 'Workbook not found' } })
          return
        }
        writeJson(res, 200, { ok: true, workbook })
        return
      }
      if (req.method === 'POST' && name === 'create') {
        const payload = await readJsonBody(req)
        const workbook = await store.create(payload)
        writeJson(res, 200, { ok: true, workbook, summary: bookSummary(workbook) })
        return
      }
      if (req.method === 'POST' && name === 'op') {
        const payload = await readJsonBody(req)
        const workbook = await store.apply(payload.id, payload.operation)
        writeJson(res, 200, { ok: true, workbook, summary: bookSummary(workbook) })
        return
      }
      if (req.method === 'POST' && name === 'delete') {
        const payload = await readJsonBody(req)
        await store.delete(payload.id)
        writeJson(res, 200, { ok: true })
        return
      }
      writeJson(res, 404, { ok: false, error: { code: 'not-found', message: 'Unknown Sheets API method' } })
    } catch (error) {
      const status = Number(error?.statusCode) || 400
      if (status >= 500) console.error('[dsh-sheets] request failed', error)
      writeJson(res, status, {
        ok: false,
        error: { code: status === 404 ? 'not-found' : 'invalid-request', message: error?.message ?? String(error) },
      })
    }
  }

  ctx.effect(
    () => ctx.webServer.register({ kind: 'prefix', path: WEB_PREFIX, handler }),
    'dsh-sheets: browser API',
  )
}

function resolveWorkbook(store, reference) {
  return store.all().then((books) => {
    if (books.length === 0) {
      throw new Error('No spreadsheet workbook exists yet. Use spreadsheet_create first.')
    }
    const raw = String(reference ?? '').trim()
    if (raw === '') return books[0]
    const byId = books.find((book) => book.id === raw)
    if (byId) return byId
    const lowered = raw.toLowerCase()
    return (
      books.find((book) => book.name.toLowerCase() === lowered) ??
      books.find((book) => book.name.toLowerCase().includes(lowered)) ??
      null
    ) ?? (() => {
      throw new Error(`Workbook "${raw}" was not found. Use spreadsheet_list to see available workbooks.`)
    })()
  })
}

function toolText(value) {
  return [{ type: 'text', text: typeof value?.text === 'string' ? value.text : JSON.stringify(value, null, 2) }]
}

function callView(title, kind = 'other') {
  return { card: 'generic', title, kind }
}

function makeTools(store) {
  const listTool = {
    name: 'spreadsheet_list',
    description:
      'List the spreadsheet workbooks in the Harness Sheets panel. Each entry includes the workbook id, name, sheet names, and row/column counts. Use this before creating a workbook when the user refers to an existing sheet.',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => toolText(value),
    },
    isConcurrencySafe: () => true,
    presentCall: () => callView('List spreadsheets', 'read'),
    async execute() {
      const workbooks = await store.list()
      const lines = workbooks.length === 0
        ? ['No spreadsheet workbooks exist yet.']
        : [`${workbooks.length} spreadsheet workbook${workbooks.length === 1 ? '' : 's'}:`]
      for (const book of workbooks) {
        const sheets = book.sheets.map((sheet) => `${sheet.name} (${sheet.rows}×${sheet.cols})`).join(', ')
        lines.push(`- ${book.name} — id ${book.id}; sheets: ${sheets}`)
      }
      return {
        text: lines.join('\n'),
        workbooks,
      }
    },
  }

  const createTool = {
    name: 'spreadsheet_create',
    description:
      'Create a spreadsheet workbook in the Harness Sheets panel. Provide a name and one or more sheets. A sheet may include a `columns` header row and `rows` of data; formulas start with "=". This is the right tool when the user asks for a table, comparison, research matrix, or exportable spreadsheet.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Workbook name shown in the Sheets panel.' },
        sheets: {
          type: 'array',
          description: 'Sheets to create. Defaults to one empty sheet named "Sheet 1".',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Sheet tab name.' },
              columns: {
                type: 'array',
                items: { type: 'string' },
                description: 'Optional header labels. They are written into row 1.',
              },
              rows: {
                type: 'array',
                items: {
                  type: 'array',
                  items: {},
                },
                description: 'Optional data rows. Cells may be strings, numbers, booleans, or formulas beginning with "=".',
              },
            },
            additionalProperties: false,
          },
        },
      },
      required: ['name'],
      additionalProperties: false,
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => toolText(value),
    },
    presentCall: (args) => callView(`Create spreadsheet ${typeof args?.name === 'string' ? `“${args.name}”` : ''}`, 'edit'),
    async execute(args) {
      const name = truthyName(args?.name, 'Untitled spreadsheet')
      const sheets = Array.isArray(args?.sheets) && args.sheets.length > 0
        ? args.sheets
        : [{ name: 'Sheet 1', rows: [] }]
      const workbook = await store.create({ name, sheets })
      const summary = bookSummary(workbook)
      const dimensions = summary.sheets.map((sheet) => `${sheet.name} (${sheet.rows}×${sheet.cols})`).join(', ')
      return {
        text: `Created workbook "${workbook.name}" (${workbook.id}) with ${dimensions}. Open the Sheets panel in the sidebar to view, edit, or export it.`,
        workbook: summary,
      }
    },
  }

  const readTool = {
    name: 'spreadsheet_read',
    description:
      'Read a sheet from a workbook in the Harness Sheets panel. Returns column letters, row numbers, raw cell values, and formulas. Use it after writing to verify the result or before editing an existing table.',
    parameters: {
      type: 'object',
      properties: {
        workbook: { type: 'string', description: 'Workbook id or name. Omit to read the most recently updated workbook.' },
        sheet: { type: 'string', description: 'Sheet id or name. Omit to read the active sheet.' },
        range: { type: 'string', description: 'Optional A1 range such as A1:D40. Omit to read the full sheet.' },
        max_rows: { type: 'integer', description: 'Maximum rows to return, 1–1000. Defaults to 200.' },
        max_columns: { type: 'integer', description: 'Maximum columns to return, 1–120. Defaults to 40.' },
      },
      additionalProperties: false,
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => toolText(value),
    },
    isConcurrencySafe: () => true,
    presentCall: (args) => callView(`Read spreadsheet${typeof args?.workbook === 'string' ? ` ${args.workbook}` : ''}`, 'read'),
    async execute(args) {
      const workbook = await resolveWorkbook(store, args?.workbook)
      const sheet = findSheet(workbook, args?.sheet)
      if (!sheet) throw new Error(`Sheet "${args?.sheet}" was not found in "${workbook.name}".`)
      const limit = Math.max(1, Math.min(1000, Math.floor(Number(args?.max_rows) || 200)))
      const columnLimit = Math.max(1, Math.min(120, Math.floor(Number(args?.max_columns) || 40)))
      const range = args?.range ? parseRange(args.range) : null
      if (args?.range && !range) throw new Error('range must look like A1:D40')
      const startRow = range?.startRow ?? 0
      const startCol = range?.startCol ?? 0
      const endRow = range ? Math.min(sheet.rows.length, range.endRow + 1) : sheet.rows.length
      const availableWidth = range ? range.endCol - range.startCol + 1 : Math.max(1, maxCols(sheet.rows) - startCol)
      const width = Math.min(availableWidth, columnLimit)
      const visibleRows = sheet.rows.slice(startRow, Math.min(endRow, startRow + limit))
      const table = rowTable(visibleRows, 0, startCol, width, limit, startRow)
      const missingColumns = availableWidth - width
      const suffix = missingColumns > 0 ? `\n\n(Showing ${width} of ${availableWidth} columns; pass max_columns to read more.)` : ''
      return {
        text: `Workbook: ${workbook.name} (${workbook.id})\nSheet: ${sheet.name} (${sheet.rows.length} rows × ${maxCols(sheet.rows)} cols)\n\n${table}${suffix}`,
        workbook: workbookRef(workbook),
        sheet: sheet.name,
        rows: visibleRows.map((row) => row.slice(startCol, startCol + width)),
        start_row: startRow + 1,
        start_column: colLetter(startCol),
      }
    },
  }

  const writeTool = {
    name: 'spreadsheet_write',
    description:
      'Write values or formulas into a sheet in the Harness Sheets panel. Actions: set_range (write a block from start), append_rows (add rows at the end), replace_rows (replace all data), clear_range (blank a range). Formulas begin with "=". Use this to populate or update a table you created with spreadsheet_create.',
    parameters: {
      type: 'object',
      properties: {
        workbook: { type: 'string', description: 'Workbook id or name. Omit to use the most recently updated workbook.' },
        sheet: { type: 'string', description: 'Sheet id or name. Omit to use the active sheet.' },
        action: {
          type: 'string',
          enum: ['set_range', 'append_rows', 'replace_rows', 'clear_range'],
          description: 'Write operation to perform.',
        },
        start: { type: 'string', description: 'For set_range: top-left cell such as A1.' },
        range: { type: 'string', description: 'For clear_range: A1 range such as A2:D10.' },
        values: {
          type: 'array',
          items: { type: 'array', items: {} },
          description: 'Rows of cell values. Used by set_range, append_rows, and replace_rows.',
        },
      },
      required: ['action'],
      additionalProperties: false,
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => toolText(value),
    },
    presentCall: (args) => callView(`Write spreadsheet${typeof args?.action === 'string' ? ` · ${args.action}` : ''}`, 'edit'),
    async execute(args) {
      const workbook = await resolveWorkbook(store, args?.workbook)
      const sheet = findSheet(workbook, args?.sheet)
      if (!sheet) throw new Error(`Sheet "${args?.sheet}" was not found in "${workbook.name}".`)
      const action = String(args?.action ?? '')
      let operation
      if (action === 'set_range') {
        if (!args?.start) throw new Error('set_range needs a start cell such as A1')
        operation = { type: 'set_cells', sheet: sheet.id, start: args.start, values: args?.values ?? [] }
      } else if (action === 'append_rows') {
        if (!Array.isArray(args?.values) || args.values.length === 0) throw new Error('append_rows needs at least one row in values')
        operation = { type: 'append_rows', sheet: sheet.id, values: args.values }
      } else if (action === 'replace_rows') {
        if (!Array.isArray(args?.values)) throw new Error('replace_rows needs a values array')
        operation = { type: 'replace_rows', sheet: sheet.id, values: args.values }
      } else if (action === 'clear_range') {
        if (!args?.range) throw new Error('clear_range needs an A1 range')
        operation = { type: 'clear_range', sheet: sheet.id, range: args.range }
      } else {
        throw new Error(`Unknown action "${action}". Use set_range, append_rows, replace_rows, or clear_range.`)
      }
      const updated = await store.apply(workbook.id, operation)
      const updatedSheet = findSheet(updated, sheet.id)
      const preview = rowTable(updatedSheet.rows, 0, 0, Math.min(8, Math.max(1, maxCols(updatedSheet.rows))), 8)
      return {
        text: `Updated "${updated.name}" · ${updatedSheet.name} (${updatedSheet.rows.length} rows × ${maxCols(updatedSheet.rows)} cols).\n\n${preview}`,
        workbook: bookSummary(updated),
      }
    },
  }

  const manageTool = {
    name: 'spreadsheet_manage',
    description:
      'Manage the structure of a workbook in the Harness Sheets panel: rename or delete a workbook, add/rename/delete a sheet, or add/delete rows and columns. Use spreadsheet_write for cell data.',
    parameters: {
      type: 'object',
      properties: {
        workbook: { type: 'string', description: 'Workbook id or name. Omit to use the most recently updated workbook.' },
        sheet: { type: 'string', description: 'Sheet id or name, when the action applies to a sheet.' },
        action: {
          type: 'string',
          enum: [
            'rename_workbook',
            'delete_workbook',
            'add_sheet',
            'rename_sheet',
            'delete_sheet',
            'add_rows',
            'delete_rows',
            'add_columns',
            'delete_columns',
          ],
          description: 'Structure operation to perform.',
        },
        name: { type: 'string', description: 'New workbook/sheet name for rename actions.' },
        count: { type: 'integer', description: 'Number of rows or columns to add/delete. Defaults to 1.' },
        start_row: { type: 'integer', description: '1-based row index for add_rows/delete_rows.' },
        start_column: { type: 'string', description: 'Column letter for add_columns/delete_columns.' },
      },
      required: ['action'],
      additionalProperties: false,
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => toolText(value),
    },
    presentCall: (args) => callView(`Manage spreadsheet${typeof args?.action === 'string' ? ` · ${args.action}` : ''}`, 'edit'),
    async execute(args) {
      const workbook = await resolveWorkbook(store, args?.workbook)
      const action = String(args?.action ?? '')
      if (action === 'delete_workbook') {
        await store.delete(workbook.id)
        return { text: `Deleted workbook "${workbook.name}" (${workbook.id}).` }
      }
      if (action === 'rename_workbook') {
        if (typeof args?.name !== 'string' || args.name.trim() === '') throw new Error('rename_workbook needs a name')
        const updated = await store.apply(workbook.id, { type: 'rename_workbook', name: args.name })
        return { text: `Renamed workbook to "${updated.name}".`, workbook: bookSummary(updated) }
      }
      const sheet = findSheet(workbook, args?.sheet)
      if (!sheet) throw new Error(`Sheet "${args?.sheet}" was not found in "${workbook.name}".`)
      let operation
      if (action === 'add_sheet') {
        operation = { type: 'add_sheet', name: args?.name }
      } else if (action === 'rename_sheet') {
        if (typeof args?.name !== 'string' || args.name.trim() === '') throw new Error('rename_sheet needs a name')
        operation = { type: 'rename_sheet', sheet: sheet.id, name: args.name }
      } else if (action === 'delete_sheet') {
        operation = { type: 'delete_sheet', sheet: sheet.id }
      } else if (action === 'add_rows' || action === 'delete_rows') {
        operation = {
          type: action === 'add_rows' ? 'add_rows' : 'delete_rows',
          sheet: sheet.id,
          count: args?.count,
          start_row: args?.start_row,
        }
      } else if (action === 'add_columns' || action === 'delete_columns') {
        operation = {
          type: action === 'add_columns' ? 'add_columns' : 'delete_columns',
          sheet: sheet.id,
          count: args?.count,
          start_column: args?.start_column,
        }
      } else {
        throw new Error(`Unknown action "${action}".`)
      }
      const updated = await store.apply(workbook.id, operation)
      const summary = bookSummary(updated)
      return {
        text: `Updated "${updated.name}". Sheets: ${summary.sheets.map((item) => `${item.name} (${item.rows}×${item.cols})`).join(', ')}.`,
        workbook: summary,
      }
    },
  }


  const importTool = {
    name: 'spreadsheet_import',
    description:
      'Import a local Excel or delimited file into a sheet workbook. Supports .xlsx, .xls, .xlsm, .csv, .tsv, and .txt paths (absolute or ~-relative). Without `workbook`, creates a new workbook named after the file; with `workbook`, appends the imported sheets to that workbook or replaces its sheets when `replace` is true. Formulas are preserved. Use this when the user gives you a file path to put into the Sheets panel.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute file path, or a path starting with ~/.' },
        workbook: { type: 'string', description: 'Optional existing workbook id or name to import into. Omit to create a new workbook.' },
        name: { type: 'string', description: 'New workbook name. Defaults to the file name without its extension.' },
        replace: { type: 'boolean', description: 'When importing into an existing workbook, replace all of its sheets instead of appending. Defaults to false.' },
        max_rows: { type: 'integer', description: 'Maximum rows per sheet, 1–5000. Defaults to 5000.' },
        max_columns: { type: 'integer', description: 'Maximum columns per sheet, 1–120. Defaults to 120.' },
      },
      required: ['path'],
      additionalProperties: false,
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => toolText(value),
    },
    presentCall: (args) => callView(`Import spreadsheet ${typeof args?.path === 'string' ? `“${path.basename(args.path)}”` : ''}`, 'read'),
    async execute(args) {
      if (typeof args?.path !== 'string' || args.path.trim() === '') throw new Error('spreadsheet_import needs a file path')
      const filePath = expandImportPath(args.path)
      const maxRows = Math.max(1, Math.min(MAX_ROWS, Math.floor(Number(args?.max_rows) || MAX_ROWS)))
      const maxColumns = Math.max(1, Math.min(MAX_COLS, Math.floor(Number(args?.max_columns) || MAX_COLS)))
      const parsed = await readImportFile(filePath, maxRows, maxColumns)
      let workbook
      let mode
      if (typeof args?.workbook === 'string' && args.workbook.trim() !== '') {
        const target = await resolveWorkbook(store, args.workbook)
        workbook = await store.apply(target.id, {
          type: 'import_sheets',
          sheets: parsed.sheets,
          replace: args?.replace === true,
        })
        mode = args?.replace === true ? 'replaced sheets in' : 'appended sheets to'
      } else {
        const baseName = path.basename(filePath, path.extname(filePath)).trim() || 'Imported spreadsheet'
        workbook = await store.create({
          name: truthyName(args?.name, baseName),
          sheets: parsed.sheets,
        })
        mode = 'created'
      }
      const summary = bookSummary(workbook)
      const dimensions = summary.sheets.map((sheet) => `${sheet.name} (${sheet.rows}×${sheet.cols})`).join(', ')
      const truncation = parsed.truncated ? ' Some rows or columns were truncated to the import limit.' : ''
      return {
        text: `Imported ${path.basename(filePath)} and ${mode} workbook "${workbook.name}" (${workbook.id}) with ${dimensions}.${truncation} Open the Sheets panel in the sidebar to view, edit, or export it.`,
        workbook: summary,
      }
    },
  }

  return [listTool, createTool, readTool, writeTool, manageTool, importTool]
}

function registerTools(ctx, store) {
  for (const tool of makeTools(store)) {
    ctx.effect(() => ctx.tools.register(tool), `dsh-sheets: tool ${tool.name}`)
  }
}

function registerPrompt(ctx) {
  ctx.inject(['systemPrompt'], (scope) => {
    scope.effect(
      () =>
        scope.systemPrompt.section({
          name: 'dsh-sheets',
          order: 56,
          text: [
            '## Spreadsheets',
            'A Sheets panel is available in the Harness sidebar. When the user asks you to collect, compare, or organize information into a table or spreadsheet, use the spreadsheet tools to create or update a workbook instead of only printing a Markdown table. Keep one record per row, put column labels in a header row, and use formulas (starting with "=") for derived columns when useful.',
            'Call spreadsheet_list before creating a workbook when the user refers to an existing sheet. If the user gives you a path to an Excel or CSV file, call spreadsheet_import with that path instead of asking them to import it manually. After writing, state the workbook name and sheet so the user can open the panel, edit it, or export it as CSV/XLSX.',
          ].join('\n\n'),
        }),
      'dsh-sheets: system prompt',
    )
  })
}

export function apply(ctx) {
  const store = new SheetStore(resolveDataDirectory())
  registerRoutes(ctx, store)
  registerTools(ctx, store)
  registerPrompt(ctx)
}
