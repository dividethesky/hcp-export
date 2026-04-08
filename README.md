# HouseCallPro Attachment Exporter

A browser-based tool that bulk-downloads every customer photo, document, and attachment from a HouseCallPro account. Built for data migration scenarios where HCP doesn't offer a native bulk export.

## How It Works

The tool uses a **bookmarklet** — a small script saved as a browser bookmark. When clicked while logged into HouseCallPro, it runs directly in the browser using the user's existing authenticated session. It scans all customers, shows a preview of what will be downloaded, then saves everything directly to a folder on the user's computer.

**No backend. No data leaves the browser. No software to install.**

## Features

- **Stream-to-disk** — Files download directly to a folder on the user's computer via the File System Access API. No memory limits, handles tens of thousands of files and tens of GBs
- **Pre-download checkpoint** — After scanning, shows total customers, total files, estimated size, estimated time, and minimum disk space needed. User confirms before any files download
- **6x parallel downloads** — Downloads 6 files simultaneously per customer, reducing export time by ~5-6x
- **ZIP fallback** — Browsers without folder access (Safari, Firefox) automatically fall back to chunked ZIP downloads at 800MB per ZIP with customer-boundary chunking
- **Session keepalive** — Pings HCP every 2 minutes to prevent session timeout during long exports
- **Deduplication** — Tracks completed customers in the browser session. Interrupted exports skip already-downloaded customers on re-run
- **Error retry** — Failed downloads retry up to 2 times with a 2-second delay
- **Time estimation** — Live countdown based on actual download throughput
- **Job/Estimate/Equipment ID mapping** — Each attachment linked to its parent record with separate ID columns
- **Verification summary** — Shows download mode, total files, total size, errors, elapsed time, and lists customers with failures
- **Post-export instructions** — OS-specific instructions for zipping and sending the export folder
- **Excel + CSV export** — 3-sheet Excel workbook and CSV log with full mapping data
- **Access code gate** — Users must enter a valid code before accessing the tool

## Build System

The bookmarklet is built from a standalone JavaScript source file (`bookmarklet_source.js`) using a Python build script. The build process:

1. Verifies syntax with `node --check`
2. Minifies while preserving URLs and string contents
3. URL-encodes and wraps as `javascript:void(...)`
4. Embeds the pre-built bookmarklet URL directly in the HTML

This avoids the fragile `fn.toString()` + runtime minification approach, which previously broke CDN URLs (`https://` was stripped by comment-removal regex).

## User Flow

```
1. Enter access code
2. Drag bookmarklet to bookmarks bar
3. Log into HouseCallPro
4. Click bookmarklet
5. Phase 1: Scan (automatic)
   └─ Scans all customers and attachment metadata
6. Checkpoint: Review before downloading
   ├─ Shows: customers, files, estimated size, estimated time
   ├─ Shows: minimum disk space needed
   └─ User clicks "Start Download" or "Cancel"
7. Choose folder (Chrome/Edge) or wait for ZIPs (Safari/Firefox)
8. Phase 3: Download (6x parallel)
   └─ Live progress: files, bytes, time remaining, errors
9. Reports generated (Excel + CSV)
10. Verification summary + zip/send instructions
```

## Download Modes

| Mode | Browser | How it works | Size limit |
|------|---------|-------------|------------|
| **Direct to folder** (default) | Chrome, Edge | User picks a folder, files stream to disk | None |
| **ZIP fallback** | Safari, Firefox | Chunked ZIPs, 800MB each, customers never split | ~800MB per ZIP |

## Output

### Folder Structure (stream-to-disk mode)

```
HCP_Export_2026-04-08/
  John_Smith_a1b2c3d4/
    Job_e5f6g7h8/
      abc12345_photo_before.jpg
      def67890_photo_after.jpg
    Estimate_f9g0h1i2/
      ghi11111_proposal.pdf
  Jane_Doe_n5o6p7q8/
    ...
  HCP_Export_Log_2026-04-08.csv
  HCP_Export_Log_2026-04-08.xlsx
```

### Excel Workbook Sheets

1. **All Attachments** — Customer ID, Customer Name, Attachment ID, File Name, Job ID, Estimate ID, Equipment ID, Type, File Path, Status
2. **Customer Summary** — Total files, successful, errors, size, completion status per customer
3. **Errors** (if any) — Failed files with context and error details

### ZIP Fallback Output

Each ZIP contains `_log_partN.csv`. Master CSV and Excel download separately after all ZIPs.

## Performance

Estimated times for 10,000 images with 6x parallel downloads:

| Average file size | Total data | ~50 Mbps | ~100 Mbps |
|---|---|---|---|
| 500 KB | ~5 GB | ~3 min | ~2 min |
| 2 MB | ~20 GB | ~10 min | ~6 min |
| 5 MB | ~50 GB | ~25 min | ~15 min |

Phase 1 scanning adds ~1 minute per 1,000 customers.

## Setup

1. Clone this repo
2. Enable GitHub Pages: **Settings → Pages → Deploy from branch → main → / (root)**
3. Share the Pages URL and an access code with the end user

### Rebuilding the Bookmarklet

If you modify `bookmarklet_source.js`:

```bash
# Verify syntax
node --check bookmarklet_source.js

# Rebuild HTML (requires Python 3)
python3 build.py
```

The build script minifies the source, URL-encodes it, and embeds it in `index.html`.

## Access Control

Codes are defined in the `VALID` array in the HTML `<script>` block. For production, replace with server-side validation.

## Technical Details

### API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /alpha/customers?page=N&page_size=100` | Paginate all customers |
| `GET /api/customers/{id}/attachments?page=N&page_size=100` | List attachments (includes `file_file_size`) |
| `GET /api/v2/organization` | Session keepalive ping |
| S3 pre-signed URLs (from attachment response) | Direct file download (6 concurrent) |

### Dependencies (loaded from CDN at runtime)

- [JSZip 3.10.1](https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js) — ZIP generation (fallback + reports)
- [SheetJS 0.18.5](https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js) — Excel generation

### Browser Requirements

- **Recommended:** Chrome or Edge (direct-to-folder)
- **Supported:** Safari, Firefox (ZIP fallback)

### Architecture

```
Bookmarklet runs on pro.housecallpro.com (same-origin)
  │
  ├─ Phase 1: Sequential scan
  │   ├─ GET /alpha/customers → GET /api/customers/{id}/attachments
  │   ├─ Checks sessionStorage for dedup
  │   └─ Collects file_file_size for size estimation
  │
  ├─ Checkpoint: User confirmation
  │   ├─ Customers, files, estimated size, estimated time
  │   ├─ Minimum disk space (estimate + 10%)
  │   └─ "Start Download" or "Cancel"
  │
  ├─ Phase 2: Setup
  │   ├─ File System Access API → folder picker (Chrome/Edge)
  │   ├─ Fallback → JSZip in-memory (Safari/Firefox)
  │   └─ Loads JSZip + SheetJS from CDN
  │
  ├─ Phase 3: Parallel download (6 workers per customer)
  │   ├─ fetch(S3 URL) → blob → write to disk or ZIP
  │   ├─ Retry up to 2x on failure
  │   └─ Mark customer complete in sessionStorage
  │
  └─ Phase 4: Reports + summary
      ├─ Excel (.xlsx) — 3 sheets
      ├─ CSV — master log
      ├─ Save to folder or trigger download
      └─ Verification summary + OS-specific zip instructions
```

## File Structure

```
hcp-export/
  index.html              ← Landing page + embedded bookmarklet (deploy this)
  bookmarklet_source.js   ← Raw bookmarklet source (edit this)
  build.py                ← Build script: source → minified → embedded in HTML
  README.md               ← This file
```

## Limitations

- Requires active HouseCallPro login session
- S3 pre-signed URLs expire after 1 hour — re-run skips completed customers
- Size estimation uses `file_file_size` metadata when available, 2MB average when not
- Access codes are client-side
- If HCP changes internal API endpoints, bookmarklet needs updating

## Changelog

### v4.0
- Rebuilt bookmarklet build system — pre-built and syntax-verified, no runtime fn.toString()
- Fixed critical bug: comment-stripping regex was destroying CDN URLs (https:// treated as comment)
- Bookmarklet source is now a standalone testable JS file

### v3.1
- Pre-download checkpoint screen with size/time estimates
- Size estimation from actual file_file_size metadata
- OS-specific post-export zip instructions

### v3.0
- Stream-to-disk default (File System Access API)
- 6x parallel downloads
- Reduced scan delay (300ms → 50ms)
- ZIP fallback with 800MB byte-based chunking

### v2.0
- Session keepalive, deduplication, error retry
- Time estimation, verification summary
- Job/Estimate/Equipment ID columns
- Excel workbook (3 sheets) + CSV

### v1.0
- Initial bookmarklet with sequential downloads
- Chunked ZIP output, access code gate

## License

Private — not for redistribution.
