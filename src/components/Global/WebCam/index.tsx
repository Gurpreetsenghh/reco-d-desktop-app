import { useEffect, useRef } from "react";

const WebCam = () => {
  const camElement = useRef<HTMLVideoElement | null>(null);
  
  const streamWebCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (camElement.current) {
        camElement.current.srcObject = stream;
        await camElement.current.play();
      }
    } catch (error) {
      console.error("Webcam access denied or unavailable", error);
    }
  };

  useEffect(() => {
    streamWebCam();
  }, []);

  return (
    // FIX: Added bg-black so the window isn't totally transparent while the camera loads
    <video
      ref={camElement}
      className="h-screen w-full bg-black draggable object-cover rounded-full aspect-video border-2 relative border-white shadow-lg"
    ></video>
  );
};

export default WebCam;