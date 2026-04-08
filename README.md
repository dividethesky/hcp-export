[README.md](https://github.com/user-attachments/files/26558353/README.md)
# HouseCallPro Attachment Exporter

A browser-based tool that bulk-downloads every customer photo, document, and attachment from a HouseCallPro account. Built for data migration scenarios where HCP doesn't offer a native bulk export.

## How It Works

The tool uses a **bookmarklet** — a small script saved as a browser bookmark. When clicked while logged into HouseCallPro, it runs directly in the browser using the user's existing authenticated session. It hits HCP's internal APIs to paginate through all customers, collects every attachment URL, downloads the files, and packages them into ZIP files.

**No backend. No data leaves the browser. No software to install.**

## Features

- **Bulk download** — Exports all attachments across all customers, jobs, estimates, and equipment records
- **Smart chunking** — Downloads are split into multiple ZIPs (~500 files each) to prevent browser memory issues. A customer's files are never split across ZIPs
- **Session keepalive** — Pings HCP every 2 minutes to prevent session timeout during long exports
- **Deduplication** — Tracks completed customers in the browser session. If the export is interrupted and re-run, already-downloaded customers are skipped automatically
- **Error retry** — Failed downloads are retried up to 2 times before being marked as errors
- **Time estimation** — Live countdown based on actual download throughput
- **Job/Estimate/Equipment ID mapping** — Each attachment is linked back to its parent record with separate ID columns
- **Verification summary** — On completion, shows total files, errors, and lists any customers with failures
- **Excel + CSV export** — Generates both an `.xlsx` workbook and a `.csv` log file with full mapping data

## Output Files

After export, the user receives:

| File | Contents |
|------|----------|
| `HCP_Attachments_[date].zip` (or `_part1of3`, etc.) | Photos and documents organized as `CustomerName_ID/AttachableType_ID/filename` |
| `_download_log_partN.csv` (inside each ZIP) | CSV log for just the files in that ZIP |
| `HCP_Attachments_FULL_LOG_[date].csv` | Standalone master CSV covering all ZIPs |
| `HCP_Attachments_FULL_LOG_[date].xlsx` | Excel workbook with three sheets |

### Excel Workbook Sheets

1. **All Attachments** — Every file with columns: Customer ID, Customer Name, Attachment ID, File Name, Job ID, Estimate ID, Equipment ID, Attachable Type, ZIP File, File Path, Status
2. **Customer Summary** — One row per customer with total files, successful downloads, errors, and completion status
3. **Errors** (only present if errors occurred) — Failed files with customer/job/estimate context and error details

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
3. Log into [pro.housecallpro.com](https://pro.housecallpro.com)
4. Click the bookmarklet from the bookmarks bar
5. Wait for the export to complete — ZIPs download automatically
6. Send the ZIP files and Excel log to the migration team

## Technical Details

### API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /alpha/customers?page=N&page_size=100` | Paginate all customers |
| `GET /api/customers/{id}/attachments?page=N&page_size=100` | List attachments per customer |
| `GET /api/v2/organization` | Session keepalive ping |
| S3 pre-signed URLs (from attachment response) | Direct file download |

### Dependencies (loaded from CDN at runtime)

- [JSZip 3.10.1](https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js) — ZIP generation
- [SheetJS 0.18.5](https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js) — Excel generation

### Browser Requirements

- Google Chrome or Microsoft Edge recommended
- Safari not recommended for large exports

## Limitations

- Requires an active HouseCallPro login session
- ZIP chunking is based on file count (500), not file size
- Access codes are stored client-side
- If HouseCallPro changes their internal API endpoints, the bookmarklet will need updating

## License

Private — not for redistribution.
