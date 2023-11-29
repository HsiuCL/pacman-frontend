import { EFourDir } from "components/Game";

export type TFourDirSprite = {
    [EFourDir.left]: Sprite,
    [EFourDir.right]: Sprite,
    [EFourDir.up]: Sprite,
    [EFourDir.down]: Sprite
}



export const SpriteXStrategy = (sprite: Sprite) => {
    const startPoint = sprite.getStartPoint();
    const width = sprite.getWidth();
    sprite.curPoint.x = startPoint.x + sprite.curFrame * width;
}

export const SpriteYStrategy = (sprite: Sprite) => {
    const startPoint = sprite.getStartPoint();
    const height = sprite.getHeight();
    sprite.curPoint.y = startPoint.x + sprite.curFrame * height;
}

export class Sprite {
    protected _img: HTMLImageElement;
    protected _frameWidth: number;
    protected _frameHeight: number;
    protected _drawWidth: number;
    protected _drawHeight: number;
    protected _startPoint: {
        x: number,
        y: number
    };
    protected _frameCnt: number;
    protected _strategy: (sprite: Sprite) => void;
    public curPoint: {
        x: number,
        y: number
    };
    public curFrame: number;

    public constructor(img: HTMLImageElement, frameWidth: number, frameHeight: number,
        drawWidth: number, drawHeight: number, startX: number, startY: number, frameCnt: number, strategy: (sprite: Sprite) => void) {
        this._img = img;
        this._frameWidth = frameWidth;
        this._frameHeight = frameHeight;
        this._drawWidth = drawWidth;
        this._drawHeight = drawHeight;
        this._startPoint = { x: startX, y: startY };
        this.curPoint = { x: startX, y: startY };
        this._frameCnt = frameCnt;
        this.curFrame = 0;
        this._strategy = strategy;
    }

    public getStartPoint() {
        return this._startPoint;
    }

    public getWidth() {
        return this._frameWidth;
    }

    public getHeight() {
        return this._frameHeight;
    }

    public updateFrame() {
        console.log("frame: " + this.curFrame)
        this.curFrame = (this.curFrame + 1) % this._frameCnt;
        this._strategy(this);
    }

    public draw(context: CanvasRenderingContext2D, x: number, y: number) {
        context.drawImage(
            this._img,
            this.curPoint.x,
            this.curPoint.y,
            this._frameWidth,
            this._frameHeight,
            x,
            y,
            this._drawWidth,
            this._drawHeight
        );
    }
}