import { useEffect, useRef, useState } from "react";
import { setPhoto, type FaceId } from "../photo/photoStorage";

const FACE_SEQUENCE: FaceId[] = ["U", "D", "F", "B", "L", "R"];
const CAPTURE_SIZE = 512;

type CameraCaptureProps = {
  onClose: () => void;
  onPhotoStored: () => void;
};

export function CameraCapture({ onClose, onPhotoStored }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const currentFace = FACE_SEQUENCE[index];

  useEffect(() => {
    let isActive = true;

    async function startCamera(): Promise<void> {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera access is not available in this browser.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        if (!isActive) {
          stopStream(stream);
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        if (isActive) {
          setError("Camera permission was denied or no camera was found.");
        }
      }
    }

    void startCamera();

    return () => {
      isActive = false;
      stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  function handleCancel(): void {
    onClose();
  }

  function handleCapture(): void {
    const video = videoRef.current;

    if (!video || !currentFace || video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    const sourceSize = Math.min(video.videoWidth, video.videoHeight);
    const sourceX = (video.videoWidth - sourceSize) / 2;
    const sourceY = (video.videoHeight - sourceSize) / 2;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      setError("Could not capture an image from the camera.");
      return;
    }

    canvas.width = CAPTURE_SIZE;
    canvas.height = CAPTURE_SIZE;
    context.drawImage(video, sourceX, sourceY, sourceSize, sourceSize, 0, 0, CAPTURE_SIZE, CAPTURE_SIZE);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setPhoto(currentFace, dataUrl);
    onPhotoStored();

    if (index === FACE_SEQUENCE.length - 1) {
      onClose();
      return;
    }

    setIndex((current) => current + 1);
  }

  return (
    <div className="camera-overlay" role="dialog" aria-modal="true" aria-label="Capture cube face photos">
      <div className="camera-panel">
        <div className="camera-preview">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => setIsCameraReady(true)}
          />
        </div>
        <div className="camera-copy">
          <strong>Capture face {currentFace}</strong>
          <span>
            {index + 1} of {FACE_SEQUENCE.length}
          </span>
        </div>
        {error && <p className="camera-error">{error}</p>}
        <div className="camera-actions">
          <button type="button" onClick={handleCapture} disabled={!isCameraReady || !!error}>
            Capture
          </button>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}
