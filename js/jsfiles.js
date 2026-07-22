const DRIVE_API_BASE_URL = "https://www.googleapis.com/drive/v3/files";
const GOOGLE_DRIVE_FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

const IMAGE_MIME_PREFIX = "image/";
const AUDIO_MIME_PREFIX = "audio/";

const HIDDEN_NAMES = [
    "readme",
    "readme.txt",
    "readme.md",
    ".ds_store",
    "thumbs.db",
    "desktop.ini",
    "not done",
    "_staging",
    "_work in progress"
];

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

function isImageFile(item) {
    return item.mimeType && item.mimeType.startsWith(IMAGE_MIME_PREFIX);
}

function isAudioFile(item) {
    return item.mimeType && item.mimeType.startsWith(AUDIO_MIME_PREFIX);
}

function shouldHideDriveItem(item) {
    const name = (item.name || item.title || "").trim().toLowerCase();

    return (
        !name ||
        HIDDEN_NAMES.includes(name) ||
        name.startsWith(".") ||
        name.startsWith("_")
    );
}

function getDriveItemIcon(item) {
    if (isDriveFolder(item)) return "📁";
    if (item.mimeType === "application/pdf") return "📄";
    if (isImageFile(item)) return "🖼️";
    if (isAudioFile(item)) return "🎵";
    if (item.mimeType && item.mimeType.startsWith("video/")) return "🎬";

    return "📄";
}

function getDriveThumbnailUrl(item) {
    if (!item.thumbnailLink) return "";
    return item.thumbnailLink.replace("=s220", "=s800");
}

function getDriveOpenUrl(item) {
    return item.webViewLink || `https://drive.google.com/file/d/${item.id}/view`;
}

function getDriveMediaUrl(config, item) {
    return `${DRIVE_API_BASE_URL}/${item.id}?alt=media&key=${encodeURIComponent(config.googleDrive.apiKey)}`;
}

function sortDriveItems(items) {
    return items.sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.title.localeCompare(b.title);
    });
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

    const url = new URL(DRIVE_API_BASE_URL);
    url.searchParams.set("key", config.googleDrive.apiKey);
    url.searchParams.set("q", query);
    url.searchParams.set("fields", fields);
    url.searchParams.set("orderBy", "folder,name");
    url.searchParams.set("pageSize", "100");
    url.searchParams.set("supportsAllDrives", "true");
    url.searchParams.set("includeItemsFromAllDrives", "true");

    const response = await fetch(url.toString());

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Drive request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    const items = (data.files || [])
        .filter(item => !shouldHideDriveItem(item))
        .map(item => ({
            id: item.id,
            title: item.name,
            name: item.name,
            mimeType: item.mimeType,
            isFolder: isDriveFolder(item),
            isImage: isImageFile(item),
            isAudio: isAudioFile(item),
            thumbnailUrl: getDriveThumbnailUrl(item),
            icon: getDriveItemIcon(item),
            openUrl: getDriveOpenUrl(item),
            mediaUrl: getDriveMediaUrl(config, item),
            downloadUrl: item.webContentLink || "",
            createdTime: item.createdTime || "",
            modifiedTime: item.modifiedTime || ""
        }));

    return sortDriveItems(items);
}

async function getDriveFolderPackage(config, folderItem) {
    if (!folderItem || !folderItem.isFolder) {
        return null;
    }

    const children = await getDriveItems(config, folderItem.id);
    const cover = children.find(isImageFileLike);
    const audio = children.find(isAudioFileLike);

    if (!audio) {
        return null;
    }

    return {
        type: "story",
        id: folderItem.id,
        title: folderItem.title,
        coverUrl: cover ? cover.thumbnailUrl || cover.mediaUrl : "",
        audioUrl: audio.mediaUrl,
        audioTitle: audio.title,
        folderId: folderItem.id
    };
}

function isImageFileLike(item) {
    return item && item.mimeType && item.mimeType.startsWith(IMAGE_MIME_PREFIX);
}

function isAudioFileLike(item) {
    return item && item.mimeType && item.mimeType.startsWith(AUDIO_MIME_PREFIX);
}

async function getDriveFiles(config, folderId) {
    return getDriveItems(config, folderId);
}