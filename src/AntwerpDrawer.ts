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

const AXIS_COLOR = openColor.red[6];
const TRANSFORM_MIRROR_CENTER_COLOR = openColor.cyan[6];
const TRANSFORM_MIRROR_POINT_COLOR = openColor.cyan[6];
const TRANSFORM_ROTATION_POINT_COLOR = openColor.lime[6];
const TRANSFORM_ROTATION_CENTER_COLOR = openColor.lime[6];

interface DrawOptions {
  animate?: boolean;
  colorMethod?: 'placement' | 'transform';
  colorScale?: (t: number) => string;
  fadeConnectedShapes?: boolean;
  showAxis?: boolean;
  showTransforms?: boolean;
}

export default class TilingDrawer {
  container: HTMLDivElement;
  groupAxis?: Two.Group;
  groupShapes?: Two.Group;
  groupTransforms?: Two.Group;
  interval?: number;
  data: AntwerpData;
  opts: DrawOptions;
  toStage?: number;
  two: Two;

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.data = { shapes: [], stages: 0, transforms: [] };
    this.opts = {};
    this.two = new Two({
      autostart: true,
      type: Two.Types.svg,
    }).appendTo(this.container);

  }

  destroy() {
    this.two.remove();
    window.clearInterval(this.interval);
  }

  draw(height: number, width: number, data: AntwerpData, opts: DrawOptions) {
    this.data = data;
    this.opts = opts;
    this.two.renderer.setSize(width, height);
    this.two.width = this.two.renderer.width;
    this.two.height = this.two.renderer.height;

    if (this.interval) {
      window.clearInterval(this.interval);
    }

    if (opts.animate) {
      this.toStage = -1;
      this.interval = window.setInterval(() => {
        this.drawShapes((++(this.toStage as number) % (data.stages + 2)) - 1);

        if (opts.showAxis) this.drawAxis();
        if (opts.showTransforms) this.drawTransforms();
      }, ANIMATE_INTERVAL);
    } else {
      this.drawShapes();

      if (opts.showAxis) this.drawAxis();
      if (opts.showTransforms) this.drawTransforms();
    }
  }

  drawAxis() {
    this.removeAxis();
    this.two.add(this.groupAxis = createGroup());

    this.groupAxis.add(createLine({
      stroke: AXIS_COLOR,
      strokeWidth: borderSizeX1Px,
      vertices: [
        [(this.two.width / 2) + (borderSizeX1Px / 2), 0],
        [(this.two.width / 2) + (borderSizeX1Px / 2), this.two.height],
      ],
    }));

    this.groupAxis.add(createLine({
      stroke: AXIS_COLOR,
      strokeWidth: borderSizeX1Px,
      vertices: [
        [0, (this.two.height / 2) + (borderSizeX1Px / 2)],
        [this.two.width, (this.two.height / 2) + (borderSizeX1Px / 2)],
      ],
    }));
  }

  drawShapes(toStage?: number) {
    const getShapeFill = (shape: TypeShapeJS) => {
      if (!this.opts.colorScale) {
        return colorLightShade1;
      }

      if (this.opts.colorMethod === 'transform') {
        return this.opts.colorScale(1 - (shape[1] / this.data.stages));
      }

      return this.opts.colorScale(1 - (shape[2] / this.data.stagesPlacement));
    };

    if (this.groupShapes) {
      this.groupShapes.remove();
    }

    this.two.add(this.groupShapes = createGroup({
      x: this.two.width / 2,
      y: this.two.height / 2,
    }));

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
    this.removeTransforms();
    this.two.add(this.groupTransforms = createGroup({
      x: this.two.width / 2,
      y: this.two.height / 2,
    }));

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

  drawTransformMirrorPoint({ actionAngle, point }: TransformJS) {
    const hypot = Math.hypot(this.two.height, this.two.width);
    const mirrorAngle = actionAngle + Math.PI / 2;

    const px = point ? point[0][0] : 0;
    const py = point ? point[0][1] : 0;
    const lx1 = (Math.cos(mirrorAngle - DEG_180) * hypot) + px;
    const ly1 = (Math.sin(mirrorAngle - DEG_180) * hypot) + py;
    const lx2 = (Math.cos(mirrorAngle) * hypot) + px;
    const ly2 = (Math.sin(mirrorAngle) * hypot) + py;

    this.groupTransforms?.add(createLine({
      stroke: TRANSFORM_MIRROR_POINT_COLOR,
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

  drawTransformMirrorCenter({ actionAngle }: TransformJS) {
    const hypot = Math.hypot(this.two.height, this.two.width);

    if (!actionAngle) {
      return;
    }

    while (actionAngle <= DEG_360) {
      this.groupTransforms?.add(createLine({
        stroke: TRANSFORM_MIRROR_CENTER_COLOR,
        strokeWidth: borderSizeX1Px,
        vertices: [[0, 0], [
          Math.cos(actionAngle - DEG_90) * hypot,
          Math.sin(actionAngle - DEG_90) * hypot,
        ]],
      }));

      actionAngle *= 2;
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
      this.groupTransforms?.add(createLine({
        stroke: TRANSFORM_ROTATION_CENTER_COLOR,
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
      this.groupTransforms?.add(createCircle({
        fill: TRANSFORM_ROTATION_POINT_COLOR,
        radius: sizeX1Px,
        x: point[0][0],
        y: point[0][1],
      }));

      this.drawArrowArc(TRANSFORM_ROTATION_POINT_COLOR,
        actionAngle + DEG_90 + DEG_180, actionAngle + DEG_90 + DEG_360,
        point[0][0], point[0][1], Math.hypot(point[0][0], point[0][1]));
    }

    this.groupTransforms?.add(createLine({
      stroke: TRANSFORM_ROTATION_POINT_COLOR,
      strokeWidth: borderSizeX1Px,
      vertices: [
        [0, 0],
        [point ? point[0][0] * 2 : hypot, point ? point[0][1] * 2 : hypot],
      ],
    }));
  }

  drawArrowArc(stroke: string, a1: number, a2: number, cx: number, cy: number, radius: number) {
    const anglePadding = Math.PI / (radius / 6);
    const angleStart = a1 + anglePadding - DEG_90;
    const angleEnd = a2 - anglePadding - DEG_90;
    const arrowSize = sizeX2Px;
    const arcRadius = radius - (arrowSize * 2);

    this.groupTransforms?.add(createArc({
      stroke: stroke,
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

  removeAxis() {
    if (this.groupAxis) {
      this.groupAxis.remove();
    }
  }

  removeTransforms() {
    if (this.groupTransforms) {
      this.groupTransforms.remove();
    }
  }
}
