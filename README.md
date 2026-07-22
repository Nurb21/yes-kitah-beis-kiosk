# YES Kitah Beis Kiosk

Version **0.6.0**

A student-friendly classroom kiosk for Yeshiva Elementary School.

## Production Features

- Print Center backed by Google Drive
- One-tap printing for single-page PDF worksheets
- Animated worksheet preparation screen
- Native browser/iPadOS print dialog (AirPrint compatible)
- Recursive Google Drive folders
- Six items per page with pagination
- Listening Center with story packages and automatic audio playback
- GitHub Pages deployment

## v0.6.0 Student Print Workflow

Home → Print Center → Category → Folder → Tap worksheet → Print dialog

The kiosk does not open Google Drive, a browser tab, or a separate PDF preview screen. After printing or canceling, the student remains in the same folder and on the same pagination page.

## Important

Browsers and iPadOS require the native print dialog. The kiosk cannot silently print without confirmation.


## v0.6.0 Final Print Workflow

Tap worksheet, wait for the animated preparation screen, then tap the large **PRINT MY WORKSHEET** button to open the native print dialog. This direct student tap avoids Safari automatic-print blocking.
