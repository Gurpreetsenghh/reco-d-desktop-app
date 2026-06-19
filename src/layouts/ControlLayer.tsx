import { Button } from "@/components/ui/button";
import { cn, onCloseApp } from "@/lib/utils";
import { UserButton } from "@clerk/react";
import { X } from "lucide-react";
import React, { useState, useEffect } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

const ControlLayer = ({ children, className }: Props) => {
  const [isHidden, setIsHidden] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ipcRenderer) return;

    const handleHide = (_event: unknown, payload: { state: boolean }) => {
      setIsHidden(payload.state);
    };

    window.ipcRenderer.on("hide-plugin", handleHide);

    return () => {
      window.ipcRenderer.removeListener?.("hide-plugin", handleHide);
    };
  }, []);

  return (
    <div
      className={cn(
        className,
        isHidden ? "opacity-0 pointer-events-none" : "opacity-100",
        "flex flex-col h-screen bg-linear-to-br from-neutral-900 to-neutral-800 text-white rounded-lg overflow-hidden transition-opacity duration-300 ease-in-out"
      )}
    >
      <div className="flex justify-between items-center p-2 bg-neutral-800 draggable">
        <div className="flex items-center gap-2 non-draggable">
          <img src="/reco-d-logo.svg" alt="reco-d logo" className="w-6 h-6" />
          <p className="text-lg font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-600">
            reco-d
          </p>
        </div>
        <div className="flex items-center gap-2 non-draggable">
          <UserButton />
          <Button
            onClick={onCloseApp}
            className="p-1 outline-none border-none bg-transparent rounded-xl h-fit w-fit hover:bg-red-600 transition-colors duration-200"
            aria-label="Close"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  );
};

export default ControlLayer;