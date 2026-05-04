import { useEffect, useRef, useState } from "react";
import { AppController, initialAppConfig } from "./app/AppController";
import { projectionDefinitions, type ProjectionId } from "./projection/registry";
import { skinNames, type SkinId } from "./skin/registry";

export function App() {
  const pixiContainerRef = useRef<HTMLDivElement | null>(null);
  const [controller, setController] = useState<AppController | null>(null);
  const [projectionId, setProjectionId] = useState<ProjectionId>(initialAppConfig.projectionId);
  const [skinId, setSkinId] = useState<SkinId>(initialAppConfig.skinId);
  const [debug, setDebug] = useState<boolean>(initialAppConfig.debug);

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
      </div>
      <div ref={pixiContainerRef} className="pixi-host" />
    </div>
  );
}
