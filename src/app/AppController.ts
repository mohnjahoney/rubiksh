import { Application, Text } from "pixi.js";
import { createSolvedCube } from "../core/cube";
import { applyMove, inverseMove, randomMoves } from "../core/moves";
import type { CubeState, Move } from "../core/types";
import { bindKeyboardInput, type KeyboardAction } from "../input/keyboard";
import { projectionNames, projections, type ProjectionId } from "../projection/registry";
import { buildScene } from "../scene/buildScene";
import { PixiRenderer } from "../renderers/pixi/PixiRenderer";
import { solidColorSkin } from "../skin/solidColors";

type AppState = {
  cube: CubeState;
  projectionId: ProjectionId;
  skinId: "solidColors";
  moveHistory: Move[];
};

export class AppController {
  private readonly app: Application;
  private readonly renderer: PixiRenderer;
  private readonly cleanupKeyboard: () => void;
  private readonly instructionLabel: Text;
  private readonly historyLabel: Text;
  private state: AppState;

  private constructor(app: Application) {
    this.app = app;
    this.renderer = new PixiRenderer(app);
    this.state = {
      cube: createSolvedCube(),
      projectionId: "floatingFacesGrid3x2",
      skinId: "solidColors",
      moveHistory: [],
    };
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

  static async mount(container: HTMLElement): Promise<AppController> {
    const app = new Application();
    await app.init({
      background: "#111111",
      antialias: true,
      resizeTo: window,
    });
    container.appendChild(app.canvas);

    return new AppController(app);
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
      this.setProjection(action.projectionId);
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

  private setProjection(projectionId: ProjectionId): void {
    this.state = {
      ...this.state,
      projectionId,
    };
    this.render();
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
    const scene = buildScene(this.state.cube, projections[this.state.projectionId], solidColorSkin);
    this.renderer.setScene(scene);
    this.instructionLabel.text = [
      "Moves: U D F B L R | Shift=inverse | s=scramble | z=undo | Esc=reset",
      `Projection: ${projectionNames[this.state.projectionId]} | 1 Grid | 2 Hex | 3 Net`,
    ].join("\n");
    this.historyLabel.text = `History: ${this.state.moveHistory.join(" ") || "(empty)"}`;
  }
}
