# YES Kitah Beis Kiosk — Development Notes

## Current Test Build

**Version 0.6.1-test4 — Home Button Spacing**

## Hardware Target

- iPad Air running iPadOS 12.5.7
- Dell E310dw AirPrint printer
- Bluetooth speaker

## Verified Before This Build

- GitHub Pages deployment
- Google Drive browsing
- Recursive folders
- Pagination
- Story packages
- Audio playback
- Listening Center
- Google Drive thumbnails
- Add to Home Screen
- Standalone full-screen launch
- Native AirPrint successfully prints to the Dell E310dw

## v0.6.1-test4 Scope

This build changes one visual detail only:

- Increased the vertical space between the large **PRINT** and **LISTEN** buttons on the Home screen.
- Button sizes, colors, wording, and actions are unchanged.
- No print, Google Drive, pagination, Listening Center, audio, or worksheet-preparation logic was changed.

## Required Test

1. Deploy the complete test build to GitHub Pages.
2. Launch the kiosk from the iPad Home Screen icon.
3. Confirm the PRINT and LISTEN buttons have clearer separation.
4. Confirm both buttons remain fully visible and easy to tap in landscape mode.
5. Open Print Center and return Home.
6. Open Listening Center and return Home.
7. Confirm both buttons still open the correct section.

## Browser Constraint

Safari requires the native print dialog and a direct user action. The kiosk must not attempt silent printing.
