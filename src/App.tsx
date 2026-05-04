import { useEffect, useRef, useState } from "react";
import dataUrlForTestingRaw from "./assets/dataUrls.txt?raw";
import { AppController, initialAppConfig } from "./app/AppController";
import { CameraCapture } from "./camera/CameraCapture";
import {
  clearAllPhotos,
  clearPhoto,
  setPhoto,
  type FaceId,
} from "./photo/photoStorage";
import { projectionDefinitions, type ProjectionId } from "./projection/registry";
import { skinNames, type SkinId } from "./skin/registry";

declare global {
  interface Window {
    rubiksh?: {
      setPhoto: (face: FaceId, dataUrl: string) => void;
      clearPhoto: (face: FaceId) => void;
      clearAllPhotos: () => void;
      test: {
        dataUrlForTesting: string;
      };
    };
  }
}

const dataUrlForTesting = dataUrlForTestingRaw.trim();

export function App() {
  const pixiContainerRef = useRef<HTMLDivElement | null>(null);
  const [controller, setController] = useState<AppController | null>(null);
  const [projectionId, setProjectionId] = useState<ProjectionId>(initialAppConfig.projectionId);
  const [skinId, setSkinId] = useState<SkinId>(initialAppConfig.skinId);
  const [debug, setDebug] = useState<boolean>(initialAppConfig.debug);
  const [cameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    const container = pixiContainerRef.current;

    if (!container) {
      return;
    }

    let controller: AppController | undefined;
    let isMounted = true;

    void AppController.mount(
      container,
      initialAppConfig,
      {
        onProjectionChange: setProjectionId,
        onSkinChange: setSkinId,
        onDebugToggle: () => setDebug((current) => !current),
      },
    ).then((mountedController) => {
      if (!isMounted) {
        mountedController.destroy();
        return;
      }

      controller = mountedController;
      setController(mountedController);
    });

    return () => {
      isMounted = false;
      setController(null);
      controller?.destroy();
    };
  }, []);

  useEffect(() => {
    controller?.setProjection(projectionId);
  }, [controller, projectionId]);

  useEffect(() => {
    controller?.setSkin(skinId);
  }, [controller, skinId]);

  useEffect(() => {
    controller?.setDebug(debug);
  }, [controller, debug]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLButtonElement
      ) {
        return;
      }

      if (event.key.toLowerCase() === "p") {
        event.preventDefault();
        setSkinId("imageTiles");
        setCameraOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    window.rubiksh = {
      setPhoto: (face, dataUrl) => {
        setPhoto(face, dataUrl);
        controller?.refreshSkin();
      },
      clearPhoto: (face) => {
        clearPhoto(face);
        controller?.refreshSkin();
      },
      clearAllPhotos: () => {
        clearAllPhotos();
        controller?.refreshSkin();
      },
      test: {
        dataUrlForTesting,
      },
    };

    return () => {
      delete window.rubiksh;
    };
  }, [controller]);

  return (
    <div className="app-shell">
      <div className="app-controls">
        <label>
          Projection
          <select value={projectionId} onChange={(event) => setProjectionId(event.target.value as ProjectionId)}>
            {projectionDefinitions.map((projection) => (
              <option key={projection.id} value={projection.id}>
                {projection.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Skin
          <select value={skinId} onChange={(event) => setSkinId(event.target.value as SkinId)}>
            {Object.entries(skinNames).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input type="checkbox" checked={debug} onChange={(event) => setDebug(event.target.checked)} />
          Debug
        </label>
        <button
          type="button"
          onClick={() => {
            setSkinId("imageTiles");
            setCameraOpen(true);
          }}
        >
          Capture Photos
        </button>
      </div>
      {cameraOpen && (
        <CameraCapture
          onClose={() => setCameraOpen(false)}
          onPhotoStored={() => {
            controller?.refreshSkin();
          }}
        />
      )}
      <div ref={pixiContainerRef} className="pixi-host" />
    </div>
  );
}
