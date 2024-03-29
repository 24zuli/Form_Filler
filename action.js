document.getElementById('fillForm').addEventListener('click', function() {
    chrome.tabs.executeScript({
        file: "injector.js"
    });
});

chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
        chrome.tabs.create({
            url: "popup.html"
        });
    }
});

async function getCurrentTab(callback) {
    let queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, ([tab]) => {
        if (chrome.runtime.lastError)
            console.error(chrome.runtime.lastError);
        callback(tab);
    });
}

async function toggleMuteState(tabId) {
    const tab = await chrome.tabs.get(tabId);
    const muted = !tab.mutedInfo.muted;
    await chrome.tabs.update(tabId, { muted });
    console.log(`Tab ${tab.id} is ${muted ? "muted" : "unmuted"}`);
}

chrome.tabs.onActivated.addListener(moveToFirstPosition);
chrome.tabs.onActivated.addListener(moveToFirstPositionMV2);

async function moveToFirstPosition(activeInfo) {
    try {
        await chrome.tabs.move(activeInfo.tabId, { index: 0 });
        console.log("Success.");
    } catch (error) {
        if (error == "Error: Tabs cannot be edited right now (user may be dragging a tab).") {
            setTimeout(() => moveToFirstPosition(activeInfo), 50);
        } else {
            console.error(error);
        }
    }
}

function moveToFirstPositionMV2(activeInfo) {
    chrome.tabs.move(activeInfo.tabId, { index: 0 }, () => {
        if (chrome.runtime.lastError) {
            const error = chrome.runtime.lastError;
            if (error == "Error: Tabs cannot be edited right now (user may be dragging a tab).") {
                setTimeout(() => moveToFirstPositionMV2(activeInfo), 50);
            } else {
                console.error(error);
            }
        } else {
            console.log("Success.");
        }
    });
}

async function sendMessageToActiveTab(message) {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, message);
    // TODO: Do something with the response.
}