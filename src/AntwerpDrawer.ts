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
} from './Two';

const ANIMATE_INTERVAL = 250;

const DEG_90 = Math.PI * 0.5;
const DEG_180 = Math.PI;
const DEG_360 = Math.PI * 2;

const AXIS_COLOR_PRI = openColor.red[6];
const AXIS_COLOR_SEC = openColor.red[2];
const TRANSFORM_MIRROR_CENTER_COLOR = openColor.blue[6];
const TRANSFORM_MIRROR_POINT_COLOR = openColor.blue[6];
const TRANSFORM_ROTATION_POINT_COLOR = openColor.green[6];
const TRANSFORM_ROTATION_CENTER_COLOR = openColor.green[6];

interface DrawOptions {
  animate?: boolean;
  colorMethod?: 'placement' | 'transform';
  colorScale?: (t: number) => string;
  fadeConnectedShapes?: boolean;
  showAxis15?: boolean;
  showAxis90?: boolean;
  showTransforms?: boolean;
}

export default class TilingDrawer {
  container: HTMLDivElement;
  groupAxis: Two.Group;
  groupRoot: Two.Group;
  groupShapes: Two.Group;
  groupTransforms: Two.Group;
  interval?: number;
  data: AntwerpData;
  opts: DrawOptions;
  toStage?: number;
  two: Two;

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.data = { shapes: [], stages: 0, stagesPlacement: 0, transforms: [] };
    this.opts = {};
    this.two = new Two({
      autostart: true,
      type: Two.Types.svg,
    }).appendTo(this.container);

    this.groupAxis = new Two.Group();
    this.groupRoot = new Two.Group();
    this.groupShapes = new Two.Group();
    this.groupTransforms = new Two.Group();
  }

  init() {
    this.two.clear();
    this.two.remove(this.groupRoot);
    this.two.add(this.groupRoot = createGroup());
    this.groupRoot.add(this.groupShapes = createGroup({ x: this.two.width / 2, y: this.two.height / 2 }));
    this.groupRoot.add(this.groupAxis = createGroup());
    this.groupRoot.add(this.groupTransforms = createGroup({ x: this.two.width / 2, y: this.two.height / 2 }));
  }

  destroy() {
    this.two.clear();
    this.two.remove();
    window.clearInterval(this.interval);
    delete this.interval;
    delete this.two;
  }

  draw(height: number, width: number, data: AntwerpData, opts: DrawOptions) {
    this.data = data;
    this.opts = opts;
    this.two.renderer.setSize(width, height);
    this.two.width = this.two.renderer.width;
    this.two.height = this.two.renderer.height;

    this.init();

    if (this.interval) {
      window.clearInterval(this.interval);
    }

    if (opts.animate) {
      this.toStage = -1;
      this.interval = window.setInterval(() => {
        this.drawShapes((++(this.toStage as number) % (data.stages + 2)) - 1);

        if (opts.showAxis15 || opts.showAxis90) this.drawAxis();
        if (opts.showTransforms) this.drawTransforms();
      }, ANIMATE_INTERVAL);
    } else {
      this.drawShapes();

      if (opts.showAxis15 || opts.showAxis90) this.drawAxis();
      if (opts.showTransforms) this.drawTransforms();
    }
  }

  drawAxis() {
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

  drawShapes(toStage?: number) {
    const getShapeFill = (shape: TypeShapeJS) => {
      if (!this.opts.colorScale) {
        return colorLightShade1;
      }

      if (this.opts.colorMethod === 'transform') {
        return this.opts.colorScale((1 - (shape[1] / this.data.stages)) || 0);
      }

      return this.opts.colorScale((1 - (shape[2] / this.data.stagesPlacement)) || 0);
    };

    this.data.shapes.forEach((shape) => {
      if (toStage === undefined || shape[1] <= toStage) {
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
    this.groupShapes.opacity = 0.5;
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
    const hypot = Math.hypot(this.two.height, this.two.width);

    if (!actionAngle) {
      return;
    }

    while (actionAngle <= DEG_360) {
      this.groupTransforms.add(createLine({
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

  drawTransformMirrorPoint({ actionAngle, point }: TransformJS) {
    const px = point ? point[0][0] : 0;
    const py = point ? point[0][1] : 0;
    const a = point && point[2] === 'l' ? point[1] : actionAngle + Math.PI / 2;

    const length = Math.hypot(py, px) * 2;

    const lx1 = (Math.cos(a - DEG_180) * length) + px;
    const ly1 = (Math.sin(a - DEG_180) * length) + py;
    const lx2 = (Math.cos(a) * length) + px;
    const ly2 = (Math.sin(a) * length) + py;

    this.groupTransforms.add(createLine({
      stroke: TRANSFORM_MIRROR_POINT_COLOR,
      strokeDasharray: [12, 4],
      strokeWidth: borderSizeX1Px,
      vertices: [[lx1, ly1], [lx2, ly2]],
    }));

    if (px && py) {
      this.groupTransforms.add(createCircle({
        fill: TRANSFORM_MIRROR_POINT_COLOR,
        radius: sizeX1Px,
        x: px,
        y: py,
      }));
    }
  }

  drawTransformRotationCenter({ actionAngle }: TransformJS) {
    const hypot = Math.hypot(this.two.height, this.two.width);
    const radius = Math.min(this.two.height, this.two.width) / 2;
    let angle = actionAngle;

    if (!actionAngle) {
      return;
    }

    while (angle <= DEG_360) {
      this.groupTransforms.add(createLine({
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

  drawTransformRotationPoint({ actionAngle, point }: TransformJS) {
    const hypot = Math.hypot(this.two.height, this.two.width);

    if (point) {
      this.groupTransforms.add(createCircle({
        fill: TRANSFORM_ROTATION_POINT_COLOR,
        radius: sizeX1Px,
        x: point[0][0],
        y: point[0][1],
      }));

      this.drawArrowArc(TRANSFORM_ROTATION_POINT_COLOR,
        actionAngle + DEG_90 + DEG_180, actionAngle + DEG_90 + DEG_360,
        point[0][0], point[0][1], Math.hypot(point[0][0], point[0][1]));
    }

    this.groupTransforms.add(createLine({
      stroke: TRANSFORM_ROTATION_POINT_COLOR,
      strokeDasharray: [12, 4],
      strokeWidth: borderSizeX1Px,
      vertices: [[0, 0], [
        point ? point[0][0] * 2 : hypot,
        point ? point[0][1] * 2 : hypot,
      ]],
    }));
  }

  drawArrowArc(stroke: string, a1: number, a2: number, cx: number, cy: number, radius: number) {
    const anglePadding = Math.PI / (radius / 6);
    const angleStart = a1 + anglePadding - DEG_90;
    const angleEnd = a2 - anglePadding - DEG_90;
    const arrowSize = sizeX2Px;
    const arcRadius = radius - (arrowSize * 2);

    this.groupTransforms.add(createArc({
      stroke: stroke,
      strokeDasharray: [12, 4],
      strokeWidth: borderSizeX1Px,
      a1: angleStart,
      a2: angleEnd,
      cx: cx,
      cy: cy,
      radius: arcRadius,
    }));

    this.groupTransforms.add(createLine({
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
