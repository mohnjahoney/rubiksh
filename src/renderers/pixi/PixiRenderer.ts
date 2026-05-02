import { Application, Container, Graphics } from "pixi.js";
import type { VisualSticker } from "../../scene/types";

type TransformState = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

type RenderedSticker = {
  graphic: Graphics;
  current: TransformState;
  target: TransformState;
  currentColor: number;
  targetColor: number;
};

function toPixiColor(r: number, g: number, b: number): number {
  return (r << 16) + (g << 8) + b;
}

function lerp(start: number, end: number, alpha: number): number {
  return start + (end - start) * alpha;
}

function closeEnough(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.1;
}

export class PixiRenderer {
  private readonly application: Application;
  private readonly root: Container;
  private readonly stickersById = new Map<string, RenderedSticker>();

  constructor(application: Application) {
    this.application = application;
    this.root = new Container();
    this.application.stage.addChild(this.root);
    this.application.ticker.add(this.tick);
  }

  setScene(scene: VisualSticker[]): void {
    const activeIds = new Set(scene.map((sticker) => sticker.id));

    for (const visual of scene) {
      if (visual.material.kind !== "solid") {
        throw new Error("PixiRenderer v1 only supports solid materials");
      }

      const target: TransformState = {
        x: visual.x,
        y: visual.y,
        width: visual.width,
        height: visual.height,
        rotation: visual.rotation,
      };
      const color = toPixiColor(visual.material.color.r, visual.material.color.g, visual.material.color.b);
      const rendered = this.stickersById.get(visual.id);

      if (!rendered) {
        const graphic = new Graphics();
        const initial = { ...target };

        this.drawSticker(graphic, initial, color);
        this.root.addChild(graphic);
        this.stickersById.set(visual.id, {
          graphic,
          current: initial,
          target,
          currentColor: color,
          targetColor: color,
        });
        continue;
      }

      rendered.target = target;
      rendered.targetColor = color;
    }

    for (const [id, rendered] of this.stickersById) {
      if (!activeIds.has(id)) {
        this.root.removeChild(rendered.graphic);
        rendered.graphic.destroy();
        this.stickersById.delete(id);
      }
    }
  }

  destroy(): void {
    this.application.ticker.remove(this.tick);
    for (const rendered of this.stickersById.values()) {
      rendered.graphic.destroy();
    }
    this.stickersById.clear();
    this.root.destroy({ children: true });
  }

  private readonly tick = (): void => {
    for (const rendered of this.stickersById.values()) {
      rendered.current.x = lerp(rendered.current.x, rendered.target.x, 0.2);
      rendered.current.y = lerp(rendered.current.y, rendered.target.y, 0.2);
      rendered.current.width = lerp(rendered.current.width, rendered.target.width, 0.2);
      rendered.current.height = lerp(rendered.current.height, rendered.target.height, 0.2);
      rendered.current.rotation = lerp(rendered.current.rotation, rendered.target.rotation, 0.2);

      if (closeEnough(rendered.current.x, rendered.target.x)) {
        rendered.current.x = rendered.target.x;
      }
      if (closeEnough(rendered.current.y, rendered.target.y)) {
        rendered.current.y = rendered.target.y;
      }
      if (closeEnough(rendered.current.width, rendered.target.width)) {
        rendered.current.width = rendered.target.width;
      }
      if (closeEnough(rendered.current.height, rendered.target.height)) {
        rendered.current.height = rendered.target.height;
      }
      if (closeEnough(rendered.current.rotation, rendered.target.rotation)) {
        rendered.current.rotation = rendered.target.rotation;
      }

      if (rendered.currentColor !== rendered.targetColor) {
        rendered.currentColor = rendered.targetColor;
      }

      this.drawSticker(rendered.graphic, rendered.current, rendered.currentColor);
    }
  };

  private drawSticker(graphic: Graphics, transform: TransformState, color: number): void {
    graphic.clear();
    graphic.roundRect(-transform.width / 2, -transform.height / 2, transform.width, transform.height, 8);
    graphic.fill({ color });
    graphic.stroke({ width: 3, color: 0x1c1c1c, alpha: 0.9 });
    graphic.position.set(transform.x + transform.width / 2, transform.y + transform.height / 2);
    graphic.rotation = transform.rotation;
  }
}
