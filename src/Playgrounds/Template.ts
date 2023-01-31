import { ICanvas } from '../Canvas/ICanvas';
import Vec2 from '../Math/Vec2';
import Color from '../Models/Color';

export default class Template {
  private mousePos = Vec2.zero;

  constructor() {}

  run(canvas: ICanvas) {
    const deltaTimeMs = 16;
    window.onmousemove = (e) => {
      this.onMouseMove(new Vec2(e.clientX, e.clientY));
    };
    setInterval(() => this.draw(canvas, deltaTimeMs), deltaTimeMs / 1000);
  }

  onMouseMove(position: Vec2) {
    this.mousePos = position;
  }

  draw(canvas: ICanvas, deltaTime: number) {
    canvas.clear(Color.grey(0.2));
    canvas.drawRect({
      origin: this.mousePos,
      size: new Vec2(30, 30),
      color: Color.fromHex(0xadffa8),
    });
  }
}
