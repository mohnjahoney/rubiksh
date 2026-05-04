import { useEffect, useRef } from "react";
import { AppController } from "./app/AppController";

export function App() {
  const pixiContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = pixiContainerRef.current;

    if (!container) {
      return;
    }

    let controller: AppController | undefined;
    let isMounted = true;

    void AppController.mount(container).then((mountedController) => {
      if (!isMounted) {
        mountedController.destroy();
        return;
      }

      controller = mountedController;
    });

    return () => {
      isMounted = false;
      controller?.destroy();
    };
  }, []);

  return (
    <div className="app-shell">
      <div ref={pixiContainerRef} className="pixi-host" />
    </div>
  );
}
