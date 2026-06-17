/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore
import React from "react";
//@ts-ignore
import ReactDOM from "react-dom/client";
import App from "./studio_app";
import "./index.css";
import { ClerkProvider } from "@clerk/react";
import { getClerkPublishableKey } from "./lib/env";

const PUBLISHABLE_KEY = getClerkPublishableKey();

const MissingConfig = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-neutral-950 p-6 text-center text-white">
    <div className="max-w-md space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-lg font-semibold">Missing Clerk publishable key</p>
      <p className="text-sm text-white/70">
        Set VITE_CLERK_PUBLISHABLE_KEY or VITE_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file, then restart the app.
      </p>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    ) : (
      <MissingConfig />
    )}
  </React.StrictMode>
);

// Use contextBridge
//@ts-ignore
window.ipcRenderer?.on("main-process-message", (_event, message) => {
  console.log(message);
});