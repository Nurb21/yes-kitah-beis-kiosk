const DRIVE_API_BASE_URL = "https://www.googleapis.com/drive/v3/files";
const GOOGLE_DRIVE_FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

const IMAGE_MIME_PREFIX = "image/";
const AUDIO_MIME_PREFIX = "audio/";

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

function isPdfFile(item) {
    return item.mimeType === "application/pdf";
}

function shouldHideDriveItem(item) {
    const name = (item.name || item.title || "").toLowerCase().trim();

    return (
        name === "readme.txt" ||
        name === "readme.md" ||
        name === ".ds_store" ||
        name === "thumbs.db" ||
        name === "desktop.ini" ||
        name === "not done" ||
        name === "_staging" ||
        name === "_work in progress" ||
        name.startsWith(".") ||
        name.startsWith("_")
    );
}

function getDriveItemIcon(item) {
    if (isDriveFolder(item)) return "📁";
    if (isPdfFile(item)) return "📄";
    if (isImageFile(item)) return "🖼️";
    if (isAudioFile(item)) return "🎵";
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

function normalizeDriveItem(config, item) {
    return {
        id: item.id,
        title: item.name,
        name: item.name,
        mimeType: item.mimeType,
        isFolder: isDriveFolder(item),
        isImage: isImageFile(item),
        isAudio: isAudioFile(item),
        isPdf: isPdfFile(item),
        thumbnailUrl: getDriveThumbnailUrl(item),
        icon: getDriveItemIcon(item),
        openUrl: getDriveOpenUrl(item),
        mediaUrl: getDriveMediaUrl(config, item),
        downloadUrl: item.webContentLink || "",
        createdTime: item.createdTime || "",
        modifiedTime: item.modifiedTime || ""
    };
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
        .map(item => normalizeDriveItem(config, item));

    return sortDriveItems(items);
}

async function getDriveFiles(config, folderId) {
    return getDriveItems(config, folderId);
}

async function getStoryPackages(config, folderId) {
    const items = await getDriveItems(config, folderId);
    const storyFolders = items.filter(item => item.isFolder);
    const packages = [];

    for (const folder of storyFolders) {
        const children = await getDriveItems(config, folder.id);
        const cover = children.find(item => item.isImage);
        const audio = children.find(item => item.isAudio);

        if (!audio) {
            packages.push({
                type: "folder",
                id: folder.id,
                title: folder.title,
                icon: folder.icon
            });

            continue;
        }

        packages.push({
            type: "story",
            id: folder.id,
            title: folder.title,
            coverUrl: cover ? cover.mediaUrl : "",
            audioUrl: audio.mediaUrl,
            audioFileName: audio.title
        });
    }

    return packages.sort((a, b) => a.title.localeCompare(b.title));
}