# HouseCallPro Attachment Exporter

A browser-based tool that bulk-downloads every customer photo, document, and attachment from a HouseCallPro account. Built for data migration scenarios where HCP doesn't offer a native bulk export.

## How It Works

The tool uses a **bookmarklet** — a small script saved as a browser bookmark. When clicked while logged into HouseCallPro, it runs directly in the browser using the user's existing authenticated session. It hits HCP's internal APIs to scan all customers, shows the user exactly how much data will be downloaded, then saves everything directly to a folder on their computer.

**No backend. No data leaves the browser. No software to install.**

## Features

- **Stream-to-disk** — Files download directly to a folder on the user's computer via the File System Access API. No memory limits, handles accounts with tens of thousands of files and tens of GBs
- **Pre-download checkpoint** — After scanning, shows the user total customers, total files, estimated size, estimated time, and minimum disk space needed. The user confirms before any files are downloaded
- **6x parallel downloads** — Downloads 6 files simultaneously, reducing export time by roughly 5-6x compared to sequential
- **ZIP fallback** — Browsers that don't support direct folder access (Safari, Firefox) automatically fall back to chunked ZIP downloads at 800MB per ZIP with customer-boundary chunking
- **Session keepalive** — Pings HCP every 2 minutes to prevent session timeout during long exports
- **Deduplication** — Tracks completed customers in the browser session. If the export is interrupted and re-run, already-downloaded customers are skipped automatically
- **Error retry** — Failed downloads are retried up to 2 times with a 2-second delay before being marked as errors
- **Time estimation** — Live countdown based on actual download throughput, updated in real time
- **Job/Estimate/Equipment ID mapping** — Each attachment is linked back to its parent record with separate ID columns for Jobs, Estimates, and Equipment
- **Verification summary** — On completion, shows download mode, total files, total size, errors, elapsed time, and lists any customers with failures
- **Post-export instructions** — OS-specific instructions for zipping and sending the export folder (Mac and Windows), with Google Drive/Dropbox suggested for very large exports
- **Excel + CSV export** — Generates both an `.xlsx` workbook and a `.csv` log file with full mapping data

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

The tool automatically selects the best download method based on browser capability:

| Mode | Browser | How it works | Size limit |
|------|---------|-------------|------------|
| **Direct to folder** (default) | Chrome, Edge | User picks a folder, files stream directly to disk | None |
| **ZIP fallback** | Safari, Firefox | Chunked ZIP downloads, 800MB per ZIP, customers never split | ~800MB per ZIP |

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
    Customer_j2k3l4m5/
      klm22222_id_scan.png
  Jane_Doe_n5o6p7q8/
    ...
  HCP_Export_Log_2026-04-08.csv
  HCP_Export_Log_2026-04-08.xlsx
```

### Excel Workbook Sheets

1. **All Attachments** — Every file with columns: Customer ID, Customer Name, Attachment ID, File Name, Job ID, Estimate ID, Equipment ID, Attachable Type, File Path, Status
2. **Customer Summary** — One row per customer: total files, successful downloads, errors, total size, completion status
3. **Errors** (only present if errors occurred) — Failed files with customer/job/estimate context and error details

### ZIP Fallback Output

Each ZIP contains a per-ZIP CSV log (`_download_log_partN.csv`). A master CSV and Excel file download separately after all ZIPs complete.

## Performance

Estimated times for 10,000 images with 6x parallel downloads:

| Average file size | Total data | ~50 Mbps connection | ~100 Mbps connection |
|---|---|---|---|
| 500 KB | ~5 GB | ~3 min | ~2 min |
| 2 MB | ~20 GB | ~10 min | ~6 min |
| 5 MB | ~50 GB | ~25 min | ~15 min |

Phase 1 (scanning customer/attachment metadata) adds roughly 1 minute per 1,000 customers.

## Access Control

The tool is gated behind access codes. Users must enter a valid code before the bookmarklet and instructions are revealed. Codes are defined in the `VALID` array in `index.html`.

For production use, replace the client-side array with a server-side validation API.

## Setup

1. Clone this repo
2. Enable GitHub Pages: **Settings → Pages → Deploy from branch → main → / (root)**
3. Share the Pages URL and an access code with the end user

## Usage (End User)

1. Enter access code at the gate screen
2. Drag the **"Export HCP Attachments"** button to the browser bookmarks bar
3. Log into [pro.housecallpro.com](https://pro.housecallpro.com) in the same browser
4. Click the bookmarklet from the bookmarks bar
5. Wait for the scan to complete
6. Review the summary — check disk space
7. Click **"Start Download"**
8. Choose a folder when prompted (Chrome/Edge)
9. Wait for the export to complete
10. Follow the on-screen instructions to zip and send the folder

## Technical Details

### API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /alpha/customers?page=N&page_size=100` | Paginate all customers |
| `GET /api/customers/{id}/attachments?page=N&page_size=100` | List attachments per customer (includes `file_file_size` for size estimation) |
| `GET /api/v2/organization` | Session keepalive ping |
| S3 pre-signed URLs (from attachment response) | Direct file download (6 concurrent) |

### Dependencies (loaded from CDN at runtime)

- [JSZip 3.10.1](https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js) — ZIP generation (fallback mode)
- [SheetJS 0.18.5](https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js) — Excel generation

### Browser Requirements

- **Recommended:** Google Chrome or Microsoft Edge (supports direct-to-folder saving)
- **Supported with limitations:** Safari, Firefox (falls back to ZIP downloads)

### Architecture

```
Bookmarklet runs on pro.housecallpro.com (same-origin)
  │
  ├─ Phase 1: Sequential scan
  │   └─ GET /alpha/customers → GET /api/customers/{id}/attachments
  │       (checks sessionStorage for dedup, skips completed customers)
  │       (collects file_file_size for size estimation)
  │
  ├─ Checkpoint: User confirmation
  │   ├─ Shows customers, files, estimated size, estimated time
  │   ├─ Shows minimum disk space required (estimate + 10%)
  │   └─ Waits for "Start Download" or "Cancel"
  │
  ├─ Phase 2: Setup
  │   ├─ File System Access API → folder picker (Chrome/Edge)
  │   └─ Fallback → JSZip in-memory (Safari/Firefox)
  │
  ├─ Phase 3: Parallel download (6 workers per customer)
  │   ├─ fetch(S3 pre-signed URL) → blob
  │   ├─ Stream to disk (FS mode) or add to ZIP (fallback)
  │   ├─ Retry up to 2x on failure
  │   └─ Mark customer complete in sessionStorage on success
  │
  └─ Phase 4: Generate reports
      ├─ Excel (.xlsx) — 3 sheets
      ├─ CSV — master log
      ├─ Save to export folder or trigger browser download
      └─ Show verification summary + OS-specific zip instructions
```

## Limitations

- Requires an active HouseCallPro login session in the same browser
- S3 pre-signed URLs expire after 1 hour — very large accounts with slow connections may see expiration errors; re-running skips completed customers and retries failures
- Size estimation uses `file_file_size` metadata when available, falls back to 2MB average when not
- ZIP fallback uses a 2MB-per-file size estimate for chunking decisions
- Access codes are stored client-side
- If HouseCallPro changes their internal API endpoints, the bookmarklet will need updating

## Changelog

### v3.1
- Pre-download checkpoint screen with file count, size estimate, time estimate, and disk space warning
- User must confirm before any files are downloaded
- Size estimation uses actual `file_file_size` metadata from HCP attachment records
- OS-specific post-export instructions for zipping (Mac: Finder → Compress, Windows: Explorer → Compress to ZIP file)
- Google Drive / Dropbox suggested as alternative for very large exports

### v3.0
- Stream-to-disk as default download method (File System Access API)
- 6x parallel downloads
- Reduced scan phase delay (300ms → 50ms per customer)
- ZIP fallback with 800MB byte-based chunking
- Total bytes tracked and displayed in real time

### v2.0
- Session keepalive (2-minute ping)
- Deduplication via sessionStorage
- Error retry (2 attempts per file)
- Time estimation with live countdown
- Job/Estimate/Equipment ID as separate columns
- Verification summary overlay
- Excel workbook with 3 sheets (All Attachments, Customer Summary, Errors)
- Per-ZIP CSV + standalone master CSV + master Excel

### v1.0
- Initial bookmarklet with sequential downloads
- Chunked ZIP output (500 files per ZIP)
- Customer-boundary chunking
- Access code gate
- Basic progress overlay

## License

Private — not for redistribution.
