const FOCUSABLE_SELECTOR =
    "[data-nav-item]:not([disabled]), button:not([disabled]), [role='button']:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])";

function isVisible(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

export function getActiveScope() {
    return (
        document.querySelector(".qq-modal") ||
        document.querySelector(".qq-upgrade-panel") ||
        // Prefer the full screen container so we can hit buttons outside the menu-list (like "Back")
        document.querySelector(".qq-screen")
    );
}

export function getFocusable(scope) {
    if (!scope) return [];
    return Array.from(scope.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => isVisible(el) && el.tabIndex !== -1 && !el.disabled
    );
}

function getScrollableParent(element) {
    if (!element) return null;
    let el = element.parentElement;
    while (el) {
        const style = window.getComputedStyle(el);
        const overflowY = style.getPropertyValue("overflow-y");
        if (overflowY === "auto" || overflowY === "scroll") {
            return el;
        }
        el = el.parentElement;
    }
    return document.scrollingElement || document.body;
}

function revealElement(element) {
    if (!element) return;
    const container = getScrollableParent(element);
    if (!container) return;

    const elRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const isAbove = elRect.top < containerRect.top;
    const isBelow = elRect.bottom > containerRect.bottom;

    if (isAbove) {
        container.scrollTo({
            top: container.scrollTop - (containerRect.top - elRect.top) - 12,
            behavior: "smooth",
        });
    } else if (isBelow) {
        container.scrollTo({
            top: container.scrollTop + (elRect.bottom - containerRect.bottom) + 12,
            behavior: "smooth",
        });
    }
}

export function findScrollable(scope) {
    if (!scope) return null;
    const nodes = [scope, ...Array.from(scope.querySelectorAll("*"))];
    return (
        nodes.find((el) => {
            const style = window.getComputedStyle(el);
            const overflowY = style.getPropertyValue("overflow-y");
            return (
                (overflowY === "auto" || overflowY === "scroll") &&
                el.scrollHeight > el.clientHeight
            );
        }) || null
    );
}

export function activateElement(element) {
    if (!element) return;
    element.focus({ preventScroll: true });
    element.click();
}

export function focusAndReveal(element) {
    if (!element) return;
    element.focus({ preventScroll: true });
    revealElement(element);
}
