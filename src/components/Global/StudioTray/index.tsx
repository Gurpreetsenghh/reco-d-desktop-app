import { onStopRecording, selectSources, StartRecording } from "@/lib/recorder";
import { cn, videoRecordingTime } from "@/lib/utils";
import { Cast, Pause, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Sources = {
  screen: string;
  id: string;
  audio: string;
  preset: "HD" | "SD";
  plan: "PRO" | "FREE";
};

const StudioTray = () => {
  const videoElement = useRef<HTMLVideoElement | null>(null);

  const [preview, setPreview] = useState(false);
  const [onTimer, setOnTimer] = useState<string>("00:00:00");
  const [count, setCount] = useState<number>(0);
  const [recording, setRecording] = useState(false);
  const [onSources, setOnSources] = useState<Sources | undefined>(undefined);

  // IPC listener into useEffect with cleanup
  useEffect(() => {
    if (!window.ipcRenderer) return;
    const handleProfile = (_: unknown, payload: Sources) => {
      setOnSources(payload);
    };
    window.ipcRenderer.on("profile-received", handleProfile);
    return () => {
      window.ipcRenderer.removeListener?.("profile-received", handleProfile);
    };
  }, []);

  // Set up media sources for the preview
  useEffect(() => {
    if (onSources?.screen) selectSources(onSources, videoElement);
  }, [onSources, preview]);

  // Ref for start time so it's stable across renders
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!recording) return;
    startTimeRef.current = Date.now() - count;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setCount(elapsed);
      const recordingTime = videoRecordingTime(elapsed);

      if (onSources?.plan === "FREE" && recordingTime.minute === "05") {
        setRecording(false);
        clearTime();
        onStopRecording();
        return;
      }
      setOnTimer(recordingTime.length);
    }, 1000); // 1000ms is sufficient

    return () => clearInterval(interval);
  }, [recording]);

  const stopRecording = () => {
    setRecording(false);
    clearTime();
    onStopRecording();
  };

  const clearTime = () => {
    setOnTimer("00:00:00");
    setCount(0);
  };

  if (!onSources) {
    return (
      <div className="flex items-center justify-center h-20 draggable">
        <p className="text-[11px] font-medium tracking-widest text-neutral-700 uppercase">
          Waiting for sources…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 draggable">
      {/* Preview panel */}
      {preview && (
        <div className="rounded-xl overflow-hidden border border-white/6 bg-black aspect-video w-full">
          <video
            autoPlay
            ref={videoElement}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Tray - REMOVED non-draggable so the background can be dragged */}
      <div className="flex items-center justify-between gap-3 bg-[#161616] border border-white/6 rounded-2xl px-4 py-3">

        {/* Record button + timer */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!recording) {
                setRecording(true);
                StartRecording({
                  audio: onSources.audio,
                  id: onSources.id,
                  screen: onSources.screen,
                });
              }
            }}
            disabled={recording}
            aria-label="Start recording"
            className={cn(
              "non-draggable w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200", // ADDED non-draggable
              recording
                ? "bg-red-500 cursor-default scale-90"
                : "bg-red-500/80 hover:bg-red-500 hover:scale-105 cursor-pointer"
            )}
          >
            <span
              className={cn(
                "block bg-white transition-all duration-200",
                recording ? "w-3 h-3 rounded-sm" : "w-3.5 h-3.5 rounded-full"
              )}
            />
          </button>

          <span
            className={cn(
              "text-sm font-medium tabular-nums tracking-wide transition-colors duration-300 min-w-15",
              recording ? "text-red-400" : "text-neutral-700"
            )}
          >
            {recording && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1.5 mb-px" />
            )}
            {onTimer}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/6" />

        {/* Controls */}
        <div className="flex items-center gap-1">
          {recording ? (
            <button
              onClick={stopRecording}
              aria-label="Stop recording"
              className="non-draggable flex items-center justify-center w-9 h-9 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-150" // ADDED non-draggable
            >
              <Square size={15} fill="currentColor" stroke="none" />
            </button>
          ) : (
            <button
              disabled
              aria-label="Pause (unavailable)"
              className="non-draggable flex items-center justify-center w-9 h-9 rounded-xl text-neutral-700 cursor-not-allowed opacity-40" // ADDED non-draggable
            >
              <Pause size={16} fill="currentColor" stroke="none" />
            </button>
          )}

          <button
            onClick={() => setPreview((prev) => !prev)}
            aria-label={preview ? "Hide preview" : "Show preview"}
            className={cn(
              "non-draggable flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150", // ADDED non-draggable
              preview
                ? "bg-indigo-500/12 text-indigo-400 hover:bg-indigo-500/20"
                : "text-neutral-600 hover:bg-white/6 hover:text-neutral-300"
            )}
          >
            <Cast size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudioTray;