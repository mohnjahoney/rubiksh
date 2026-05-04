import { Application, Text } from "pixi.js";
import { createSolvedCube } from "../core/cube";
import { applyMove, inverseMove, randomMoves } from "../core/moves";
import type { CubeState, Move } from "../core/types";
import { bindKeyboardInput, type KeyboardAction } from "../input/keyboard";
import { projectionNames, projections, type ProjectionId } from "../projection/registry";
import { buildScene } from "../scene/buildScene";
import { PixiRenderer } from "../renderers/pixi/PixiRenderer";
import { skinNames, skins, type SkinId } from "../skin/registry";

type AppState = {
  cube: CubeState;
  projectionId: ProjectionId;
  skinId: SkinId;
  debug: boolean;
  moveHistory: Move[];
};

export type AppConfig = {
  projectionId: ProjectionId;
  skinId: SkinId;
  debug: boolean;
};

export const initialAppConfig: AppConfig = {
  projectionId: "floatingFacesGrid3x2",
  skinId: "solidColors",
  debug: false,
};

type AppControllerHandlers = {
  onProjectionChange: (projectionId: ProjectionId) => void;
  onSkinChange: (skinId: SkinId) => void;
  onDebugToggle: () => void;
};

export class AppController {
  private readonly app: Application;
  private readonly renderer: PixiRenderer;
  private readonly handlers: AppControllerHandlers;
  private readonly cleanupKeyboard: () => void;
  private readonly instructionLabel: Text;
  private readonly historyLabel: Text;
  private state: AppState;

  private constructor(app: Application, config: AppConfig, handlers: AppControllerHandlers) {
    this.app = app;
    this.handlers = handlers;
    this.renderer = new PixiRenderer(app);
    this.state = {
      cube: createSolvedCube(),
      ...config,
      moveHistory: [],
    };
    this.renderer.setDebug(this.state.debug);
    this.instructionLabel = new Text({
      text: "",
      style: {
        fill: 0xf0f0f0,
        fontFamily: "Menlo, Monaco, monospace",
        fontSize: 16,
      },
    });
    this.instructionLabel.position.set(24, 24);
    this.app.stage.addChild(this.instructionLabel);
    this.historyLabel = new Text({
      text: "",
      style: {
        fill: 0xf0f0f0,
        fontFamily: "Menlo, Monaco, monospace",
        fontSize: 16,
        wordWrap: true,
        wordWrapWidth: 900,
      },
    });
    this.app.stage.addChild(this.historyLabel);
    this.cleanupKeyboard = bindKeyboardInput((action) => this.handleKeyboardAction(action));
    window.addEventListener("resize", this.layoutLabels);
    this.layoutLabels();
    this.render();
  }

  static async mount(
    container: HTMLElement,
    config: AppConfig,
    handlers: AppControllerHandlers,
  ): Promise<AppController> {
    const app = new Application();
    await app.init({
      background: "#111111",
      antialias: true,
      resizeTo: window,
      resolution: window.devicePixelRatio,
      autoDensity: true,
    });
    container.appendChild(app.canvas);

    return new AppController(app, config, handlers);
  }

  destroy(): void {
    this.cleanupKeyboard();
    window.removeEventListener("resize", this.layoutLabels);
    this.renderer.destroy();
    this.instructionLabel.destroy();
    this.historyLabel.destroy();
    this.app.destroy(true, { children: true });
  }

  private handleKeyboardAction(action: KeyboardAction): void {
    if (action.kind === "move") {
      this.applyMove(action.move, true);
      return;
    }

    if (action.kind === "projection") {
      this.handlers.onProjectionChange(action.projectionId);
      return;
    }

    if (action.kind === "skin") {
      this.handlers.onSkinChange(action.skinId);
      return;
    }

    if (action.kind === "debug") {
      this.handlers.onDebugToggle();
      return;
    }

    if (action.kind === "reset") {
      this.reset();
      return;
    }

    if (action.kind === "scramble") {
      this.scramble();
      return;
    }

    this.undo();
  }

  private applyMove(move: Move, shouldRecord: boolean): void {
    this.state = {
      ...this.state,
      cube: applyMove(this.state.cube, move),
      moveHistory: shouldRecord ? [...this.state.moveHistory, move] : this.state.moveHistory,
    };
    this.render();
  }

  setProjection(projectionId: ProjectionId): void {
    if (this.state.projectionId === projectionId) {
      return;
    }

    this.state = {
      ...this.state,
      projectionId,
    };
    this.render();
  }

  setSkin(skinId: SkinId): void {
    if (this.state.skinId === skinId) {
      return;
    }

    this.state = {
      ...this.state,
      skinId,
    };
    this.render();
  }

  setDebug(debug: boolean): void {
    if (this.state.debug === debug) {
      return;
    }

    this.state = {
      ...this.state,
      debug,
    };
    this.renderer.setDebug(debug);
    this.render();
  }

  refreshSkin(): void {
    void this.renderer.reloadFaceTextures().then(() => {
      this.render();
    });
  }

  private reset(): void {
    this.state = {
      ...this.state,
      cube: createSolvedCube(),
      moveHistory: [],
    };
    this.render();
  }

  private scramble(): void {
    const moves = randomMoves(5);
    const cube = moves.reduce((current, move) => applyMove(current, move), this.state.cube);

    this.state = {
      ...this.state,
      cube,
      moveHistory: [...this.state.moveHistory, ...moves],
    };
    this.render();
  }

  private undo(): void {
    const lastMove = this.state.moveHistory[this.state.moveHistory.length - 1];

    if (!lastMove) {
      return;
    }

    this.state = {
      ...this.state,
      cube: applyMove(this.state.cube, inverseMove(lastMove)),
      moveHistory: this.state.moveHistory.slice(0, -1),
    };
    this.render();
  }

  private readonly layoutLabels = (): void => {
    this.historyLabel.position.set(24, Math.max(84, this.app.screen.height - 72));
    this.historyLabel.style.wordWrapWidth = Math.max(260, this.app.screen.width - 48);
  };

  private render(): void {
    const projectionEntry = projections[this.state.projectionId];
    const scene = buildScene(this.state.cube, projectionEntry.project, skins[this.state.skinId]);
    this.renderer.setScene(scene);
    this.instructionLabel.text = [
      "Moves: U D F B L R | Shift=inverse | s=scramble | z=undo | Esc=reset | c/i=skin | 0=debug",
      `Projection: ${projectionNames[this.state.projectionId]} | 1 Grid | 2 Hex | 3 Net`,
      `Skin: ${skinNames[this.state.skinId]}`,
      `Debug: ${this.state.debug ? "on" : "off"}`,
    ].join("\n");
    this.historyLabel.text = `History: ${this.state.moveHistory.join(" ") || "(empty)"}`;
  }
}
