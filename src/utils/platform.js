import { Capacitor } from '@capacitor/core';

export function isElectron() {
    if (typeof navigator === 'undefined') return false;
    return /electron/i.test(navigator.userAgent);
}

export function isNativeMobile() {
    return Capacitor.isNativePlatform();
}

export function shouldShowPreTitleVideos() {
    return isElectron() || isNativeMobile();
}
