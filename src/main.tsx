import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ClerkProvider } from "@clerk/react";
import { getClerkPublishableKey } from "./lib/env";
import { KeyRound, Terminal } from "lucide-react"; 

const PUBLISHABLE_KEY = getClerkPublishableKey();

const MissingConfig = () => (
  // 1. Made the entire background 'draggable' so the frameless window isn't trapped
  <div className="flex h-screen w-screen items-center justify-center bg-neutral-950 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-neutral-900 to-neutral-950 p-6 draggable">
    
    {/* 2. Glassmorphic card, 'non-draggable' so users can highlight the text */}
    <div className="non-draggable max-w-md w-full space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl transition-all">
      
      {/* Icon Header */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <KeyRound className="h-8 w-8 text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Missing Authentication Key
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            The app cannot launch without a valid Clerk Publishable Key.
          </p>
        </div>
      </div>

      {/* Code / Instructions Box */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          <Terminal size={14} />
          <span>Action Required</span>
        </div>
        <p className="text-sm text-neutral-300 font-mono leading-relaxed">
          Add <span className="text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">VITE_CLERK_PUBLISHABLE_KEY</span> to your root <span className="text-white">.env</span> file and restart the development server.
        </p>
      </div>

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

// Safely bridge IPC without ignoring TypeScript
if (typeof window !== "undefined" && window.ipcRenderer) {
  window.ipcRenderer.on("main-process-message", (_event, message) => {
    console.log(message);
  });
}