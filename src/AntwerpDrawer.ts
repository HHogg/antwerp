import Two from 'two.js';
import openColor from 'open-color';
import { AntwerpData, TransformJS, TypeShapeJS } from './Types';
import {
  borderSizeX1Px,
  colorDarkShade1,
  colorLightShade1,
  sizeX1Px,
  sizeX2Px,
} from 'preshape';
import {
  createArc,
  createCircle,
  createGroup,
  createLine,
  createPolygon,
  createText,
} from './Two';

const DEG_90 = Math.PI * 0.5;
const DEG_180 = Math.PI;
const DEG_360 = Math.PI * 2;

const AXIS_COLOR_PRI = openColor.red[6];
const AXIS_COLOR_SEC = openColor.red[2];
const TRANSFORM_MIRROR_CENTER_COLOR = openColor.blue[6];
const TRANSFORM_MIRROR_POINT_COLOR = openColor.blue[6];
const TRANSFORM_ROTATION_POINT_COLOR = openColor.blue[6];
const TRANSFORM_ROTATION_CENTER_COLOR = openColor.blue[6];

interface TwoRenderer {
  height: number;
  width: number;
  setSize: (width: number, height: number) => void;
}

interface DrawOptions {
  animateInterval?: number;
  colorMethod?: 'placement' | 'transform';
  colorScale?: (t: number) => string;
  fadeConnectedShapes?: boolean;
  showAxis15?: boolean;
  showAxis90?: boolean;
  showTransforms?: boolean;
  showVertices?: boolean;
}

export default class TilingDrawer {
  animateStep?: number;
  bounds?: Two.BoundingClientRect;
  container: HTMLDivElement;
  data: AntwerpData;
  groupAxis: Two.Group;
  groupRoot: Two.Group;
  groupShapes?: Two.Group;
  groupTransforms?: Two.Group;
  groupVertices?: Two.Group;
  interval?: number;
  opts: DrawOptions;
  two: Two;

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.data = {
      shapes: [],
      stages: 0,
      stagesPlacement: 0,
      transforms: [],
      vertices: [],
    };

    this.opts = {};
    this.two = new Two({
      autostart: true,
      height: 0,
      width: 0,
      type: Two.Types.svg,
    }).appendTo(this.container);

    this.groupAxis = new Two.Group();
    this.groupRoot = new Two.Group();
  }

  reset() {
    if (this.interval) {
      window.clearInterval(this.interval);
    }

    this.animateStep = undefined;
    this.two.clear();
    this.two.remove(this.groupRoot);
    this.two.add(this.groupRoot = createGroup());
  }

  destroy() {
    window.clearInterval(this.interval);
    delete this.interval;
    this.two.clear();
    this.two.remove();
  }

  draw(height: number, width: number, data: AntwerpData, opts: DrawOptions) {
    this.data = data;
    this.opts = opts;
    (this.two.renderer as TwoRenderer).setSize(width, height);
    this.two.width = (this.two.renderer as TwoRenderer).width;
    this.two.height = (this.two.renderer as TwoRenderer).height;

    this.reset();

    if (opts.animateInterval) {
      this.animateStep = 0;
      this.interval = window.setInterval(() => {
        this.drawLayers();

        if (this.animateStep !== undefined) {
          if (this.animateStep >= data.stagesPlacement + data.stages) {
            this.animateStep = 0;
          } else {
            this.animateStep++;
          }
        }
      }, opts.animateInterval);
    } else {
      this.drawLayers();
    }
  }

  drawLayers() {
    this.drawShapes();
    if (this.opts.showAxis15 || this.opts.showAxis90) this.drawAxis();
    if (this.opts.showTransforms) this.drawTransforms();
    if (this.opts.showVertices) this.drawVertices();

    if (this.opts.showAxis15 || this.opts.showAxis90 || this.opts.showTransforms || this.opts.showVertices) {
      if (this.groupShapes) this.groupShapes.opacity = 0.5;
    }
  }

  drawAxis() {
    if (this.groupAxis) {
      this.groupRoot.remove(this.groupAxis);
    }

    this.groupRoot.add(this.groupAxis = createGroup());

    const cx = this.two.width / 2;
    const cy = this.two.height / 2;
    const hypot = Math.hypot(this.two.height, this.two.width);

    for (let i = 0; i < 24; i++) {
      if (this.opts.showAxis15 || i % 6 === 0) {
        this.groupAxis.add(createLine({
          stroke: this.opts.showAxis90 && i % 6 === 0
            ? AXIS_COLOR_PRI
            : AXIS_COLOR_SEC,
          strokeDasharray: [4, 4],
          strokeWidth: borderSizeX1Px,
          vertices: [[cx, cy], [
            cx + Math.cos(i * (Math.PI / 12)) * hypot,
            cy + Math.sin(i * (Math.PI / 12)) * hypot,
          ]],
        }));
      }
    }
  }

  drawShapes() {
    const getShapeFill = (shape: TypeShapeJS) => {
      if (!this.opts.colorScale) {
        return colorLightShade1;
      }

      if (this.opts.colorMethod === 'transform') {
        return this.opts.colorScale((1 - (shape[1] / this.data.stages)) || 0);
      }

      return this.opts.colorScale((1 - (shape[2] / this.data.stagesPlacement)) || 0);
    };

    if (this.groupShapes) {
      this.groupRoot.remove(this.groupShapes);
    }

    this.groupRoot.add(this.groupShapes = createGroup({ x: this.two.width / 2, y: this.two.height / 2 }));

    this.data.shapes.forEach((shape) => {
      if (this.animateStep === undefined ||
          (shape[1] === 1 && shape[2] <= this.animateStep) ||
          shape[1] + this.data.stagesPlacement <= this.animateStep) {
        this.groupShapes?.add(createPolygon({
          fill: getShapeFill(shape),
          stroke: colorDarkShade1,
          strokeWidth: borderSizeX1Px,
          vertices: shape[0],
        }));
      }
    });
  }

  drawTransforms() {
    if (this.groupTransforms) {
      this.groupRoot.remove(this.groupTransforms);
    }

    this.groupRoot.add(this.groupTransforms = createGroup({ x: this.two.width / 2, y: this.two.height / 2 }));

    this.data.transforms.forEach((transform) => {
      switch (transform.action) {
        case 'm':
          return transform.pointIndex
            ? this.drawTransformMirrorPoint(transform)
            : this.drawTransformMirrorCenter(transform);
        case 'r':
          return transform.pointIndex
            ? this.drawTransformRotationPoint(transform)
            : this.drawTransformRotationCenter(transform);
      }
    });
  }

  drawTransformMirrorCenter({ actionAngle }: TransformJS) {
    if (!actionAngle) {
      return;
    }

    const hypot = Math.hypot(this.two.height, this.two.width);

    while (actionAngle <= DEG_360) {
      this.groupTransforms?.add(createLine({
        stroke: TRANSFORM_MIRROR_CENTER_COLOR,
        strokeDasharray: [12, 4],
        strokeWidth: borderSizeX1Px,
        vertices: [[0, 0], [
          Math.cos(actionAngle - DEG_90) * hypot,
          Math.sin(actionAngle - DEG_90) * hypot,
        ]],
      }));

      actionAngle *= 2;
    }
  }

  drawTransformMirrorPoint({ point }: TransformJS) {
    if (!point) {
      return;
    }

    const [[px, py], pa] = point;
    const length = Math.hypot(py, px) * 2;
    const lx1 = (Math.cos(pa - DEG_180) * length) + px;
    const ly1 = (Math.sin(pa - DEG_180) * length) + py;
    const lx2 = (Math.cos(pa) * length) + px;
    const ly2 = (Math.sin(pa) * length) + py;

    this.groupTransforms?.add(createLine({
      stroke: TRANSFORM_MIRROR_POINT_COLOR,
      strokeDasharray: [12, 4],
      strokeWidth: borderSizeX1Px,
      vertices: [[lx1, ly1], [lx2, ly2]],
    }));

    if (px && py) {
      this.groupTransforms?.add(createCircle({
        fill: TRANSFORM_MIRROR_POINT_COLOR,
        radius: sizeX1Px,
        x: px,
        y: py,
      }));
    }
  }

  drawTransformRotationCenter({ actionAngle }: TransformJS) {
    if (!actionAngle) {
      return;
    }

    const hypot = Math.hypot(this.two.height, this.two.width);
    const radius = Math.min(this.two.height, this.two.width) / 2;
    let angle = actionAngle;

    while (angle <= DEG_360) {
      this.groupTransforms?.add(createLine({
        stroke: TRANSFORM_ROTATION_CENTER_COLOR,
        strokeDasharray: [12, 4],
        strokeWidth: borderSizeX1Px,
        vertices: [[0, 0], [
          Math.cos(angle - DEG_90) * hypot,
          Math.sin(angle - DEG_90) * hypot,
        ]],
      }));

      this.drawArrowArc(TRANSFORM_ROTATION_CENTER_COLOR,
        angle, Math.min(angle * 2, actionAngle + DEG_360),
        0, 0, radius);

      angle *= 2;
    }
  }

  drawTransformRotationPoint({ point }: TransformJS) {
    if (!point) {
      return;
    }

    const [[px, py], pa] = point;

    this.groupTransforms?.add(createCircle({
      fill: TRANSFORM_ROTATION_POINT_COLOR,
      radius: sizeX1Px,
      x: px,
      y: py,
    }));

    this.drawArrowArc(TRANSFORM_ROTATION_POINT_COLOR,
      pa - DEG_90, pa + DEG_180 - DEG_90,
      px, py, Math.hypot(px, py));
  }

  drawVertices() {
    if (this.groupVertices) {
      this.groupRoot.remove(this.groupVertices);
    }

    this.groupRoot.add(this.groupVertices = createGroup({ x: this.two.width / 2, y: this.two.height / 2 }));

    this.data.vertices.forEach(([[x, y],, type, index]) => {
      this.groupVertices?.add(createText((`${type}${index}`).toString(), {
        alignment: 'middle',
        fill: 'currentColor',
        size: 10,
        x: x,
        y: y,
      }));
    });

  }

  drawArrowArc(stroke: string, a1: number, a2: number, cx: number, cy: number, radius: number) {
    const anglePadding = Math.PI / (radius / 6);
    const angleStart = a1 + anglePadding - DEG_90;
    const angleEnd = a2 - anglePadding - DEG_90;
    const arrowSize = sizeX2Px;
    const arcRadius = radius - (arrowSize * 2);

    this.groupTransforms?.add(createArc({
      stroke: stroke,
      strokeDasharray: [12, 4],
      strokeWidth: borderSizeX1Px,
      a1: angleStart,
      a2: angleEnd,
      cx: cx,
      cy: cy,
      radius: arcRadius,
    }));

    this.groupTransforms?.add(createLine({
      stroke: stroke,
      strokeWidth: borderSizeX1Px,
      vertices: [[
        cx + Math.cos(angleEnd - (anglePadding / 2)) * (arcRadius - arrowSize),
        cy + Math.sin(angleEnd - (anglePadding / 2)) * (arcRadius - arrowSize),
      ], [
        cx + Math.cos(angleEnd) * arcRadius,
        cy + Math.sin(angleEnd) * arcRadius,
      ], [
        cx + Math.cos(angleEnd - (anglePadding / 2)) * (arcRadius + arrowSize),
        cy + Math.sin(angleEnd - (anglePadding / 2)) * (arcRadius + arrowSize),
      ]],
    }));
  }
}
