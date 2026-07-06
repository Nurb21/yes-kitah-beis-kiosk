let kioskConfig = null;

async function loadConfig() {
    if (kioskConfig) {
        return kioskConfig;
    }

    const response = await fetch("data/config.json");

    if (!response.ok) {
        throw new Error("Unable to load config.json");
    }

    kioskConfig = await response.json();
    return kioskConfig;
}