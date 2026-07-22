# YES Kitah Beis Kiosk — Development Notes

## Current Release

**Version 0.6.1-test2 — iPad Home Screen Test**

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


## v0.6.0 iPad Printing Decision

Automatic printing after an asynchronous PDF download can be blocked by Safari. The production workflow therefore prepares the PDF first and then requires a fresh tap on a large print confirmation button. Cancel returns to the existing folder without changing pagination.


## v0.6.1-test2 Test Scope

- Added Apple mobile web app metadata in the existing document head.
- Added a web app manifest.
- Added Apple and manifest PNG icons.
- Did not modify the HTML body, CSS, JavaScript, print workflow, folder state, pagination, or Listening Center behavior.

### Required Test

1. Remove any older Home Screen shortcut for the kiosk.
2. Open the GitHub Pages kiosk in Safari.
3. Add it to the Home Screen.
4. Launch only from the new Home Screen icon.
5. Confirm the original v0.6.0 interface is unchanged.
6. Confirm Safari address and browser controls are absent.
7. Confirm Print Center and Listening Center open normally.
