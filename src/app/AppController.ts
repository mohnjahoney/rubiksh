import { Application, Text } from "pixi.js";
import { createSolvedCube } from "../core/cube";
import { applyMove } from "../core/moves";
import type { CubeState, Move } from "../core/types";
import { bindKeyboardInput } from "../input/keyboard";
import { floatingFacesProjection } from "../projection/floatingFaces";
import { buildScene } from "../scene/buildScene";
import { PixiRenderer } from "../renderers/pixi/PixiRenderer";
import { solidColorSkin } from "../skin/solidColors";

type AppState = {
  cube: CubeState;
  projectionId: "floatingFaces";
  skinId: "solidColors";
};

export class AppController {
  private readonly app: Application;
  private readonly renderer: PixiRenderer;
  private readonly cleanupKeyboard: () => void;
  private readonly instructionLabel: Text;
  private state: AppState;

  private constructor(app: Application) {
    this.app = app;
    this.renderer = new PixiRenderer(app);
    this.state = {
      cube: createSolvedCube(),
      projectionId: "floatingFaces",
      skinId: "solidColors",
    };
    this.instructionLabel = new Text({
      text: "Moves: U D F B L R | Hold Shift for inverse",
      style: {
        fill: 0xf0f0f0,
        fontFamily: "Menlo, Monaco, monospace",
        fontSize: 18,
      },
    });
    this.instructionLabel.position.set(24, 24);
    this.app.stage.addChild(this.instructionLabel);
    this.cleanupKeyboard = bindKeyboardInput((move) => this.applyMove(move));
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
    this.renderer.destroy();
    this.instructionLabel.destroy();
    this.app.destroy(true, { children: true });
  }

  private applyMove(move: Move): void {
    this.state = {
      ...this.state,
      cube: applyMove(this.state.cube, move),
    };
    this.render();
  }

  private render(): void {
    const scene = buildScene(this.state.cube, floatingFacesProjection, solidColorSkin);
    this.renderer.setScene(scene);
  }
}
