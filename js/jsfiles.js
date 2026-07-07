const DRIVE_API_BASE_URL = "https://www.googleapis.com/drive/v3/files";
const GOOGLE_DRIVE_FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

function isGoogleDriveConfigured(config) {
    return Boolean(
        config &&
        config.googleDrive &&
        config.googleDrive.apiKey &&
        config.googleDrive.apiKey !== "PASTE_GOOGLE_DRIVE_API_KEY_HERE"
    );
}

function isDriveFolder(item) {
    return item.mimeType === GOOGLE_DRIVE_FOLDER_MIME_TYPE;
}

function getDriveItemIcon(item) {
    if (isDriveFolder(item)) {
        return "📁";
    }

    if (item.mimeType === "application/pdf") {
        return "📄";
    }

    if (item.mimeType && item.mimeType.startsWith("image/")) {
        return "🖼️";
    }

    if (item.mimeType && item.mimeType.startsWith("audio/")) {
        return "🎵";
    }

    if (item.mimeType && item.mimeType.startsWith("video/")) {
        return "🎬";
    }

    return "📄";
}

function getDriveThumbnailUrl(item) {
    if (!item.thumbnailLink) {
        return "";
    }

    return item.thumbnailLink.replace("=s220", "=s400");
}

function getDriveOpenUrl(item) {
    return item.webViewLink || `https://drive.google.com/file/d/${item.id}/view`;
}

async function getDriveItems(config, folderId) {
    if (!isGoogleDriveConfigured(config)) {
        throw new Error("Google Drive API key is missing. Add it to data/config.json.");
    }

    if (!folderId) {
        throw new Error("Missing Google Drive folder ID.");
    }

    const query = `'${folderId}' in parents and trashed = false`;
    const fields = "files(id,name,mimeType,thumbnailLink,webViewLink,webContentLink,createdTime,modifiedTime)";
    const orderBy = "folder,name";

    const url = new URL(DRIVE_API_BASE_URL);
    url.searchParams.set("key", config.googleDrive.apiKey);
    url.searchParams.set("q", query);
    url.searchParams.set("fields", fields);
    url.searchParams.set("orderBy", orderBy);
    url.searchParams.set("pageSize", "100");
    url.searchParams.set("supportsAllDrives", "true");
    url.searchParams.set("includeItemsFromAllDrives", "true");

    const response = await fetch(url.toString());

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Drive request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return (data.files || []).map(item => ({
        id: item.id,
        title: item.name,
        mimeType: item.mimeType,
        isFolder: isDriveFolder(item),
        thumbnailUrl: getDriveThumbnailUrl(item),
        icon: getDriveItemIcon(item),
        openUrl: getDriveOpenUrl(item),
        downloadUrl: item.webContentLink || "",
        createdTime: item.createdTime || "",
        modifiedTime: item.modifiedTime || ""
    }));
}