"use strict";

const { app, BrowserWindow } = require("electron");
const install = require("./call-menu.js");

const callTitle = /^(?:(?:QQ\s*)?(?:语音通话|视频通话|音视频通话)|等待对方接听)[\s.…。]*$/u;
const installScript = "(" + install.toString() + ")()";
const tracked = new WeakSet();
const scanning = new WeakSet();
const ready = new WeakSet();

async function checkCallWindow(window, reload = false) {
    if (window.isDestroyed() || scanning.has(window) || (!reload && ready.has(window))) return;
    const contents = window.webContents;
    if (contents.isDestroyed() ||
        (!callTitle.test(window.getTitle().trim()) && !callTitle.test(contents.getTitle().trim()))) return;

    scanning.add(window);
    if (reload) ready.delete(window);
    try {
        const main = contents.mainFrame;
        for (const frame of main.framesInSubtree || [main]) {
            try {
                const status = await frame.executeJavaScript(installScript);
                if (status === "installed" || status === "already installed") ready.add(window);
            } catch {
                // A frame may be destroyed while a call window is closing.
            }
        }
    } finally {
        scanning.delete(window);
    }
}

function inspect(window, reload) {
    void checkCallWindow(window, reload).catch(() => {});
}

function track(window) {
    if (tracked.has(window)) return;
    tracked.add(window);
    window.on("ready-to-show", () => inspect(window, false));
    window.on("page-title-updated", () => inspect(window, false));
    window.webContents.on("did-finish-load", () => inspect(window, true));
    window.webContents.on("did-navigate-in-page", () => inspect(window, true));
}

exports.onBrowserWindowCreated = track;
app.on("browser-window-created", (_event, window) => track(window));

app.whenReady().then(() => {
    function discoverCalls() {
        for (const window of BrowserWindow.getAllWindows()) {
            track(window);
            inspect(window, false);
        }
    }
    discoverCalls();
    // Some QQ builds assign the call window's title after its initial load.
    const timer = setInterval(discoverCalls, 850);
    timer.unref();
}).catch(() => {});
