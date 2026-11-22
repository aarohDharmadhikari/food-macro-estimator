import { useCallback, useRef, useState } from "react";

function friendlyError(err) {
  switch (err?.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Camera permission was denied. Allow access in your browser's address bar, then retry.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "No camera was found on this device. Use the Upload tab instead.";
    case "NotReadableError":
    case "TrackStartError":
      return "The camera is being used by another app. Close it and retry.";
    case "OverconstrainedError":
      return "This camera does not support the requested mode. Try switching cameras.";
    default:
      return "Could not start the camera. Use the Upload tab instead.";
  }
}

/**
 * Wraps navigator.mediaDevices.getUserMedia.
 * - start(facing): opens the stream ("environment" = rear, "user" = front)
 * - stop(): releases the camera
 * - switchCamera(): toggles front/rear
 * - capture(): resolves with a JPEG File taken from the current video frame
 */
export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const requestId = useRef(0); // lets us ignore stale async starts

  const [facing, setFacing] = useState("environment");
  const [status, setStatus] = useState("idle"); // idle | starting | live | error
  const [error, setError] = useState("");

  const stop = useCallback(() => {
    requestId.current += 1;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const start = useCallback(
    async (mode = "environment") => {
      stop();

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("error");
        setError("Camera access needs HTTPS or localhost, and a supported browser.");
        return;
      }

      const id = ++requestId.current;
      setFacing(mode);
      setStatus("starting");
      setError("");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
          audio: false,
        });

        // A newer start()/stop() happened while we were waiting -> discard.
        if (id !== requestId.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {});
        }
        setStatus("live");
      } catch (err) {
        if (id !== requestId.current) return;
        setStatus("error");
        setError(friendlyError(err));
      }
    },
    [stop]
  );

  const switchCamera = useCallback(() => {
    start(facing === "environment" ? "user" : "environment");
  }, [facing, start]);

  const capture = useCallback(
    () =>
      new Promise((resolve, reject) => {
        const video = videoRef.current;
        if (!video || !video.videoWidth) {
          reject(new Error("Camera is not ready yet."));
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Could not capture the photo."));
              return;
            }
            resolve(new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.92
        );
      }),
    []
  );

  return { videoRef, status, error, facing, start, stop, switchCamera, capture };
}