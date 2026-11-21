"use strict";

function installMicrophoneOrder() {
    const slug = "qq-call-mic-order";
    const installed = Symbol.for("qq-call-mic-order/installed");
    if (globalThis[installed]) return "already installed";
    globalThis[installed] = true;

    const menuSelector = ".btn-up-box .btn-up__content[data-v-1c51934a]";
    const preferences = globalThis.LiteLoader?.api?.config;
    if (!preferences) {
        delete globalThis[installed];
        return "LiteLoader config unavailable";
    }

    let panelState;
    let observedPanel;
    let framePending = false;
    let configQueue = Promise.resolve();

    function queueRefresh() {
        if (framePending) return;
        framePending = true;
        requestAnimationFrame(() => {
            framePending = false;
            refresh();
        });
    }

    function findMicrophones(panel) {
        if (!panel?.getClientRects().length) return [];
        const children = [...panel.children];
        const start = children.findIndex(child =>
            child.matches(".audio-title") && child.textContent.trim() === "麦克风"
        );
        const end = children.findIndex((child, index) =>
            index > start && child.matches(".audio-title") && child.textContent.trim() === "扬声器"
        );
        if (start < 0 || end <= start + 1) return [];
        const rows = children.slice(start + 1, end);
        if (rows.some(row => !row.matches(".audio-name-box") || !row.querySelector(".audio-name"))) return [];
        return rows;
    }

    function deviceKey(row) {
        const label = row.querySelector(".audio-name").textContent.trim();
        return /^系统默认(?:\s|[(（]|$)/.test(label) ? "default" : "device:" + label;
    }

    function defaultOrder(keys) {
        const preferred = keys.find(key => /^device:Dubbing AI Microphone(?:\s|[(（]|$)/i.test(key));
        return preferred ? [preferred, ...keys.filter(key => key !== preferred)] : keys;
    }

    function resolveOrder(nativeKeys, saved) {
        const active = new Set(nativeKeys);
        const seen = new Set();
        return [...saved, ...nativeKeys].filter(key => {
            if (!active.has(key) || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    function savedKeys(config) {
        if (!Array.isArray(config?.order)) return null;
        return config.order.filter(key =>
            typeof key === "string" && key.length <= 512 && (key === "default" || key.startsWith("device:"))
        ).slice(0, 256);
    }

    function persist(current, order) {
        configQueue = configQueue.catch(() => {}).then(async () => {
            const previous = savedKeys(await preferences.get(slug, {})) ?? [];
            const active = new Set(current.keys);
            const merged = [...new Set([...order, ...previous.filter(key => !active.has(key))])].slice(0, 256);
            if (!await preferences.set(slug, { order: merged })) throw new Error("Unable to save QQ mic order");
        }).catch(() => {
            if (current.panel.isConnected) {
                const tooltip = "麦克风顺序保存失败，请再次拖动重试";
                for (const item of current.items) item.handle.title = tooltip;
            }
        });
    }

    function geometry(items) {
        const boxes = items.map(item => item.row.getBoundingClientRect());
        const positions = boxes.map((box, index) => Math.round((box.top - items[index].offset) * 100) / 100);
        if (boxes[0].height < 1 || boxes.some(box => Math.abs(box.height - boxes[0].height) > 1)) return null;
        for (let index = 1; index < positions.length; index++) {
            if (positions[index] - positions[index - 1] < boxes[index - 1].height - 1) return null;
        }
        return positions;
    }

    function applyOrder(current, order) {
        const positions = geometry(current.items);
        if (!positions) return false;
        order.forEach((key, displayedIndex) => {
            const item = current.byKey.get(key);
            const offset = positions[displayedIndex] - positions[item.naturalIndex];
            item.offset = offset;
            item.row.style.translate = offset ? "0px " + offset + "px" : item.originalTranslate;
            const right = Math.max(4, Math.ceil(item.row.getBoundingClientRect().right - document.documentElement.clientWidth) + 6);
            item.handle.style.right = right + "px";
        });
        return true;
    }

    function clearPanel() {
        if (!panelState) return;
        for (const item of panelState.items) {
            item.handle?.remove();
            item.row.style.translate = item.originalTranslate;
            item.row.style.position = item.originalPosition;
        }
        panelState = undefined;
    }

    function dragHandle(current, item) {
        const handle = document.createElement("span");
        handle.className = "qq-call-mic-order-grip";
        handle.textContent = "⠿";
        handle.title = "拖动调整麦克风顺序";
        handle.setAttribute("aria-hidden", "true");
        Object.assign(handle.style, {
            position: "absolute",
            right: "4px",
            top: "50%",
            translate: "0 -50%",
            display: "grid",
            placeItems: "center",
            width: "19px",
            height: "22px",
            color: "inherit",
            background: "#222",
            borderRadius: "4px",
            fontSize: "16px",
            lineHeight: "1",
            cursor: "grab",
            touchAction: "none",
            userSelect: "none",
            zIndex: "1"
        });
        handle.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
        });
        handle.addEventListener("pointerdown", event => {
            if (event.button !== 0 || current !== panelState || current.drag || !current.order) return;
            const positions = geometry(current.items);
            if (!positions) return;
            const initial = current.items[0];
            const top = initial.row.getBoundingClientRect().top - initial.offset;
            const half = initial.row.offsetHeight / 2;
            current.drag = {
                pointerId: event.pointerId,
                item,
                startY: event.clientY,
                order: [...current.order],
                centers: positions.map(position => top + position - positions[0] + half)
            };
            handle.setPointerCapture(event.pointerId);
            handle.style.cursor = "grabbing";
            event.preventDefault();
            event.stopPropagation();
        });
        handle.addEventListener("pointermove", event => {
            const drag = current.drag;
            if (drag?.item !== item || drag.pointerId !== event.pointerId) return;
            if (!drag.moved && Math.abs(drag.startY - event.clientY) < 4) return;
            drag.moved = true;
            const slot = drag.centers.reduce((closest, center, index) =>
                Math.abs(center - event.clientY) < Math.abs(drag.centers[closest] - event.clientY) ? index : closest, 0
            );
            const order = drag.order.filter(key => key !== item.key);
            order.splice(slot, 0, item.key);
            current.preview = order;
            applyOrder(current, order);
        });

        function finish(event, save) {
            const drag = current.drag;
            if (drag?.item !== item || drag.pointerId !== event.pointerId) return;
            const completed = current.preview;
            current.drag = undefined;
            current.preview = undefined;
            handle.style.cursor = "grab";
            if (save && completed && completed.some((key, index) => key !== current.order[index])) {
                current.order = completed;
                persist(current, completed);
            }
            applyOrder(current, current.order);
        }

        handle.addEventListener("pointerup", event => finish(event, true));
        handle.addEventListener("pointercancel", event => finish(event, false));
        handle.addEventListener("lostpointercapture", event => finish(event, false));
        return handle;
    }

    function refresh() {
        const panels = [...document.querySelectorAll(menuSelector)];
        const nextPanel = panels.length === 1 ? panels[0] : undefined;
        if (observedPanel !== nextPanel) {
            resizeObserver.disconnect();
            observedPanel = nextPanel;
            if (observedPanel) resizeObserver.observe(observedPanel);
        }
        const candidates = panels.map(panel => ({ panel, rows: findMicrophones(panel) }))
            .filter(({ rows }) => rows.length > 1);
        if (candidates.length !== 1) {
            clearPanel();
            return;
        }
        const [{ panel, rows }] = candidates;
        const keys = rows.map(deviceKey);
        if (panelState?.panel === panel && panelState.items.length === rows.length &&
            panelState.items.every((item, index) => item.row === rows[index] && item.key === keys[index])) {
            if (panelState.order && !panelState.drag && !applyOrder(panelState, panelState.order)) {
                clearPanel();
            }
            return;
        }
        clearPanel();
        if (new Set(keys).size !== keys.length || keys.some(key => key === "device:")) return;
        if (rows.some(row => getComputedStyle(row).translate !== "none")) return;
        const items = rows.map((row, naturalIndex) => ({
            row,
            key: keys[naturalIndex],
            naturalIndex,
            originalTranslate: row.style.translate,
            originalPosition: row.style.position,
            offset: 0
        }));
        if (!geometry(items)) return;
        const current = { panel, items, keys, byKey: new Map(items.map(item => [item.key, item])) };
        panelState = current;
        configQueue.catch(() => {}).then(() => preferences.get(slug, {})).catch(() => null).then(config => {
            if (panelState !== current || !panel.isConnected) return;
            for (const item of items) {
                if (getComputedStyle(item.row).position === "static") item.row.style.position = "relative";
                item.handle = dragHandle(current, item);
                item.row.append(item.handle);
            }
            current.order = resolveOrder(keys, savedKeys(config) ?? defaultOrder(keys));
            if (!applyOrder(current, current.order)) clearPanel();
        });
    }

    const resizeObserver = new ResizeObserver(queueRefresh);
    const observer = new MutationObserver(records => {
        if (records.some(record => record.type !== "attributes" ||
            record.target.matches(".btn-up__content, .btn-up-box, .btn-wrapper, .audio-panel"))) queueRefresh();
    });
    observer.observe(document.documentElement, {
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["class", "style", "hidden", "aria-hidden"],
        subtree: true
    });
    window.addEventListener("resize", queueRefresh);
    document.addEventListener("transitionend", queueRefresh, true);
    document.addEventListener("animationend", queueRefresh, true);
    queueRefresh();
    return "installed";
}

module.exports = installMicrophoneOrder;
