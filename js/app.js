const STUDENTS_SHEET = 'Students';
const PRINT_LOG_SHEET = 'Print Log';

function doGet(e) {
  try {
    const action = String(
      (e && e.parameter && e.parameter.action) || ''
    ).trim();

    const callback = String(
      (e && e.parameter && e.parameter.callback) || ''
    ).trim();

    if (action === 'students') {
      return sendResponse({
        ok: true,
        students: getStudents()
      }, callback);
    }

    if (action === 'log') {
      const lock = LockService.getScriptLock();

      try {
        lock.waitLock(10000);

        const studentName = String(e.parameter.studentName || '').trim();
        const worksheetName = String(e.parameter.worksheetName || '').trim();
        const printCategory = String(e.parameter.printCategory || '').trim();

        if (!studentName || !worksheetName || !printCategory) {
          throw new Error(
            'Missing studentName, worksheetName, or printCategory.'
          );
        }

        const students = getStudents();

        if (!students.includes(studentName)) {
          throw new Error(
            'Student name was not found in the Students sheet.'
          );
        }

        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const logSheet = ss.getSheetByName(PRINT_LOG_SHEET);

        if (!logSheet) {
          throw new Error(
            `Sheet "${PRINT_LOG_SHEET}" was not found.`
          );
        }

        const now = new Date();
        const timezone = ss.getSpreadsheetTimeZone();

        const date = Utilities.formatDate(
          now,
          timezone,
          'MM/dd/yyyy'
        );

        const time = Utilities.formatDate(
          now,
          timezone,
          'h:mm:ss a'
        );

        const total =
          getStudentPrintTotal(logSheet, studentName) + 1;

        logSheet.appendRow([
          date,
          time,
          studentName,
          worksheetName,
          printCategory,
          total
        ]);

        return sendResponse({
          ok: true,
          studentName: studentName,
          total: total
        }, callback);

      } finally {
        try {
          lock.releaseLock();
        } catch (error) {
          // No lock to release.
        }
      }
    }

    return sendResponse({
      ok: true,
      message: 'Kitah Beis Kiosk Print Log API is running'
    }, callback);

  } catch (error) {
    return sendResponse({
      ok: false,
      error: error.message
    }, String(
      (e && e.parameter && e.parameter.callback) || ''
    ).trim());
  }
}

function getStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(STUDENTS_SHEET);

  if (!sheet) {
    throw new Error(
      `Sheet "${STUDENTS_SHEET}" was not found.`
    );
  }

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  return sheet
    .getRange(2, 1, lastRow - 1, 1)
    .getValues()
    .flat()
    .map(name => String(name).trim())
    .filter(Boolean);
}

function getStudentPrintTotal(logSheet, studentName) {
  const lastRow = logSheet.getLastRow();

  if (lastRow < 2) {
    return 0;
  }

  const names = logSheet
    .getRange(2, 3, lastRow - 1, 1)
    .getValues()
    .flat();

  return names.filter(
    name => String(name).trim() === studentName
  ).length;
}

function sendResponse(data, callback) {
  if (callback) {
    return ContentService
      .createTextOutput(
        `${callback}(${JSON.stringify(data)});`
      )
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
