import React from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { App } from "./App.jsx";

// Initialize Better Stack error tracking via Sentry SDK
Sentry.init({
    dsn: "https://c3zCGS3ToBrg8gN8BFxw1QXC@s1653707.eu-nbg-2.betterstackdata.com/1653707",
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
    ],
    // Performance Monitoring - capture 10% of transactions
    tracesSampleRate: 0.1,
    // Session Replay - capture 10% of sessions, 100% on error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
});

const root = createRoot(document.getElementById("root"));
root.render(<App />);
