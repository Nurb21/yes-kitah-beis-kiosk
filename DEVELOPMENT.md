# YES Kitah Beis Kiosk — Development Notes

## Current Release

**Version 0.6.0 — One-Tap Worksheet Printing**

## Hardware Target

- iPad Air running iPadOS 12.5.7
- Dell E310dw AirPrint printer
- Bluetooth speaker

## v0.6.0 Scope

- Replaced the Print Center PDF browser-tab workflow with one-tap printing.
- A full-screen animated gear message appears while the PDF downloads.
- The PDF is fetched directly through the Google Drive API.
- The native print dialog opens from an off-screen PDF frame.
- No Drive page, Drive branding, new tab, or separate preview screen is shown.
- Current folder and pagination state remain unchanged.
- Listening Center behavior is unchanged.

## Required Production Test

1. Open the kiosk through a local web server or GitHub Pages.
2. Enter Print Center and navigate to a folder containing a PDF.
3. Tap a worksheet thumbnail.
4. Confirm the animated gears appear.
5. Confirm the native print dialog opens.
6. Print or cancel.
7. Confirm the same folder and pagination page remain visible.
8. Test the same workflow on the target iPad and Dell E310dw printer.
9. Confirm Listening Center still browses folders and plays story audio.

## Browser Constraint

Automatic printing without the native print dialog is intentionally impossible in normal Safari/browser security.
