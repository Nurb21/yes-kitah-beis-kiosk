# YES Kitah Beis Kiosk — Development Notes

## Current Test Build

**Version 0.6.1-test7-revised — Listening Center UI Refinements**

## Hardware Target

- iPad Air running iPadOS 12.5.7
- Dell E310dw AirPrint printer
- Bluetooth speaker

## Verified Before This Build

- GitHub Pages deployment
- Google Drive browsing
- Recursive folders
- Six items per page and pagination
- Story packages and audio playback
- Add to Home Screen and standalone launch
- Native AirPrint to the Dell E310dw
- Approved Home-screen PRINT/LISTEN spacing from v0.6.1-test4

## v0.6.1-test7-revised Scope

This build combines four closely related Listening Center visual changes:

1. Stories and Music are larger, stacked, centered, and positioned lower on the menu screen.
2. The Stories grid uses tighter spacing while retaining six items per page.
3. Previous/Next pagination is displayed above the Stories grid.
4. Story covers use uniform 220 x 220 square frames with `object-fit: cover`.

No print logic, Google Drive calls, navigation actions, pagination calculations, audio playback logic, or story-package parsing was changed.

## Required Test

1. Launch from the iPad Home Screen icon.
2. Confirm the approved PRINT/LISTEN spacing remains.
3. Open Listening Center and confirm Stories and Music are centered, stacked, and easy to tap.
4. Open Stories and confirm six items still appear per page.
5. Confirm the artwork frames are uniform squares.
6. Confirm Previous/Next appears near the top and changes pages correctly.
7. Open a story and confirm audio still starts and controls work.
8. Return Home and briefly confirm Print Center still opens.


## v0.6.1-test7 Scope

Story Browser layout only: six smaller square covers remain visible in two rows of three, with Previous/Page/Next controls below the grid. No print, Drive, pagination calculation, or audio logic changed.
