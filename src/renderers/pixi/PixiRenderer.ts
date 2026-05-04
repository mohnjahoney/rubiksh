import { Application, Assets, Container, Graphics, Rectangle, Sprite, Text, Texture } from "pixi.js";
import { FACES, type Face } from "../../core/types";
import type { VisualSticker } from "../../scene/types";
import { faceImages } from "../../skin/faceImages";
import { FACE_COLORS, type Material } from "../../skin/types";

type TransformState = {
  x: number;
  y: number;
  width: number;
  height: number;
  cornerRadius: number;
  rotation: number;
};

type RenderedSticker = {
  container: Container;
  body: Graphics | Sprite;
  border: Graphics;
  mask?: Graphics;
  label?: Text;
  material: Material;
  current: TransformState;
  target: TransformState;
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
  private readonly faceTextures = new Map<Face, Texture>();
  private readonly tileTextures = new Map<string, Texture>();
  private lastScene: VisualSticker[] = [];
  private showStickerIds = false;
  private isDestroyed = false;

  constructor(application: Application) {
    this.application = application;
    this.root = new Container();
    this.application.stage.addChild(this.root);
    this.application.ticker.add(this.tick);
    void this.loadFaceTextures();
  }

  setScene(scene: VisualSticker[]): void {
    this.lastScene = scene;
    const activeIds = new Set(scene.map((sticker) => sticker.id));

    for (const visual of scene) {
      const target: TransformState = {
        x: visual.x,
        y: visual.y,
        width: visual.width,
        height: visual.height,
        cornerRadius: visual.cornerRadius,
        rotation: visual.rotation,
      };
      const rendered = this.stickersById.get(visual.id);

      if (!rendered) {
        const container = new Container();
        const body = this.createBody(visual.material);
        const mask = body instanceof Sprite ? new Graphics() : undefined;
        const border = new Graphics();

        if (mask && body instanceof Sprite) {
          body.mask = mask;
        }

        const label = this.showStickerIds ? this.createLabel(visual.id) : undefined;
        const initial = { ...target };

        container.addChild(body);
        if (mask) {
          container.addChild(mask);
        }
        container.addChild(border);
        if (label) {
          label.anchor.set(0.5);
          container.addChild(label);
        }
        this.drawSticker(container, body, border, mask, label, initial, visual.material);
        this.root.addChild(container);
        this.stickersById.set(visual.id, {
          container,
          body,
          border,
          mask,
          label,
          material: visual.material,
          current: initial,
          target,
        });
        continue;
      }

      rendered.target = target;
      this.updateMaterial(rendered, visual.material);
    }

    for (const [id, rendered] of this.stickersById) {
      if (!activeIds.has(id)) {
        this.root.removeChild(rendered.container);
        rendered.container.destroy({ children: true });
        this.stickersById.delete(id);
      }
    }
  }

  destroy(): void {
    this.isDestroyed = true;
    this.application.ticker.remove(this.tick);
    for (const rendered of this.stickersById.values()) {
      rendered.container.destroy({ children: true });
    }
    this.stickersById.clear();
    for (const texture of this.tileTextures.values()) {
      texture.destroy(false);
    }
    this.tileTextures.clear();
    this.root.destroy({ children: true });
  }

  setDebug(showStickerIds: boolean): void {
    if (this.showStickerIds === showStickerIds) {
      return;
    }

    this.showStickerIds = showStickerIds;

    for (const [id, rendered] of this.stickersById) {
      if (showStickerIds && !rendered.label) {
        rendered.label = this.createLabel(id);
        rendered.container.addChild(rendered.label);
        this.drawSticker(
          rendered.container,
          rendered.body,
          rendered.border,
          rendered.mask,
          rendered.label,
          rendered.current,
          rendered.material,
        );
      }

      if (!showStickerIds && rendered.label) {
        rendered.container.removeChild(rendered.label);
        rendered.label.destroy();
        rendered.label = undefined;
      }
    }
  }

  private readonly tick = (): void => {
    for (const rendered of this.stickersById.values()) {
      rendered.current.x = lerp(rendered.current.x, rendered.target.x, 0.2);
      rendered.current.y = lerp(rendered.current.y, rendered.target.y, 0.2);
      rendered.current.width = lerp(rendered.current.width, rendered.target.width, 0.2);
      rendered.current.height = lerp(rendered.current.height, rendered.target.height, 0.2);
      rendered.current.cornerRadius = lerp(rendered.current.cornerRadius, rendered.target.cornerRadius, 0.2);
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
      if (closeEnough(rendered.current.cornerRadius, rendered.target.cornerRadius)) {
        rendered.current.cornerRadius = rendered.target.cornerRadius;
      }
      if (closeEnough(rendered.current.rotation, rendered.target.rotation)) {
        rendered.current.rotation = rendered.target.rotation;
      }

      this.drawSticker(
        rendered.container,
        rendered.body,
        rendered.border,
        rendered.mask,
        rendered.label,
        rendered.current,
        rendered.material,
      );
    }
  };

  private drawSticker(
    container: Container,
    body: Graphics | Sprite,
    border: Graphics,
    mask: Graphics | undefined,
    label: Text | undefined,
    transform: TransformState,
    material: Material,
  ): void {
    if (body instanceof Graphics) {
      const color = material.kind === "solid" ? toPixiColor(material.color.r, material.color.g, material.color.b) : this.placeholderColor(material.imageId);

      body.clear();
      body.roundRect(
        -transform.width / 2,
        -transform.height / 2,
        transform.width,
        transform.height,
        transform.cornerRadius,
      );
      body.fill({ color });
    } else {
      body.width = transform.width;
      body.height = transform.height;
      body.position.set(0, 0);
    }

    if (mask) {
      mask.clear();
      mask.roundRect(
        -transform.width / 2,
        -transform.height / 2,
        transform.width,
        transform.height,
        transform.cornerRadius,
      );
      mask.fill({ color: 0xffffff });
    }

    border.clear();
    border.roundRect(
      -transform.width / 2,
      -transform.height / 2,
      transform.width,
      transform.height,
      transform.cornerRadius,
    );
    // border.stroke({ width: 1, color: 0xffffff, alpha: 0.9 });
    border.stroke({ width: 1, color: 0x888888, alpha: 0.9 });
    container.position.set(transform.x + transform.width / 2, transform.y + transform.height / 2);
    container.rotation = transform.rotation;

    if (label) {
      // label.style.fontSize = Math.max(10, Math.min(14, transform.width * 0.24));
      label.style.fontSize = 24;
      label.position.set(0, 0);
    }
  }

  private createBody(material: Material): Graphics | Sprite {
    if (material.kind === "imageTile") {
      const texture = this.getImageTileTexture(material);

      if (texture) {
        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5);
        return sprite;
      }
    }

    return new Graphics();
  }

  private createLabel(text: string): Text {
    const label = new Text({
      text,
      style: {
        fill: 0x111111,
        fontFamily: "Menlo, Monaco, monospace",
        fontSize: 48,
        fontWeight: "700",
        stroke: {
          color: 0xffffff,
          width: 4,
        },
      },
    });

    label.anchor.set(0.5);
    return label;
  }

  private updateMaterial(rendered: RenderedSticker, material: Material): void {
    const needsBodySwap = this.materialBodyKind(rendered.body) !== this.requiredBodyKind(material);
    const sameMaterial = this.materialKey(rendered.material) === this.materialKey(material);

    rendered.material = material;

    if (!needsBodySwap && sameMaterial) {
      return;
    }

    if (material.kind === "imageTile" && rendered.body instanceof Sprite) {
      const texture = this.getImageTileTexture(material);

      if (texture) {
        rendered.body.texture = texture;
        return;
      }
    }

    const nextBody = this.createBody(material);
    const nextMask = nextBody instanceof Sprite ? new Graphics() : undefined;

    if (nextMask && nextBody instanceof Sprite) {
      nextBody.mask = nextMask;
    }

    if (!needsBodySwap && nextBody instanceof Graphics && rendered.body instanceof Graphics) {
      return;
    }

    rendered.container.removeChild(rendered.body);
    rendered.body.destroy();

    if (rendered.mask) {
      rendered.container.removeChild(rendered.mask);
      rendered.mask.destroy();
    }

    rendered.body = nextBody;
    rendered.mask = nextMask;
    rendered.container.addChildAt(nextBody, 0);

    if (nextMask) {
      rendered.container.addChildAt(nextMask, 1);
    }
  }

  private requiredBodyKind(material: Material): "graphics" | "sprite" {
    return material.kind === "imageTile" && this.getImageTileTexture(material) ? "sprite" : "graphics";
  }

  private materialBodyKind(body: Graphics | Sprite): "graphics" | "sprite" {
    return body instanceof Sprite ? "sprite" : "graphics";
  }

  private getImageTileTexture(material: Extract<Material, { kind: "imageTile" }>): Texture | undefined {
    const faceTexture = this.faceTextures.get(material.imageId);

    if (!faceTexture) {
      return undefined;
    }

    const key = this.materialKey(material);
    const cached = this.tileTextures.get(key);

    if (cached) {
      return cached;
    }

    const { x, y, width, height } = material.sourceRect;

    if (width <= 0 || height <= 0) {
      return undefined;
    }

    const clampedX = Math.max(0, Math.floor(x));
    const clampedY = Math.max(0, Math.floor(y));
    const clampedWidth = Math.min(Math.floor(width), faceTexture.source.width - clampedX);
    const clampedHeight = Math.min(Math.floor(height), faceTexture.source.height - clampedY);

    const texture = new Texture({
      source: faceTexture.source,
      frame: new Rectangle(clampedX, clampedY, clampedWidth, clampedHeight),
    });

    this.tileTextures.set(key, texture);
    return texture;
  }

  private materialKey(material: Material): string {
    if (material.kind === "solid") {
      return `solid:${material.color.r},${material.color.g},${material.color.b}`;
    }

    const { x, y, width, height } = material.sourceRect;
    return `image:${material.imageId}:${x},${y},${width},${height}`;
  }

  private placeholderColor(face: Face): number {
    const color = FACE_COLORS[face];
    return toPixiColor(color.r, color.g, color.b);
  }

  private async loadFaceTextures(): Promise<void> {
    await Promise.all(
      FACES.map(async (face) => {
        const texture = await Assets.load<Texture>(faceImages[face].url);
        this.faceTextures.set(face, texture);
      }),
    );

    if (!this.isDestroyed) {
      this.setScene(this.lastScene);
    }
  }
}
