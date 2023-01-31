import HTMLCanvas from './Canvas/HTMLCanvas';
import { ICanvas } from './Canvas/ICanvas';
import Vec2 from './Math/Vec2';
import Template from './Playgrounds/Template';

const Playgrounds = {
  DrawTemplate: (canvas: ICanvas) => {
    const size = new Vec2(480, 480);
    canvas.size = size;
    return new Template();
  },
};

const appRoot = document.getElementById('root');
if (appRoot) {
  const canvas = HTMLCanvas.createInRootElement(appRoot!);
  const playground = Playgrounds.DrawTemplate(canvas);
  playground.run(canvas);
}
