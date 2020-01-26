import Two from 'two.js';
import {
  AntwerpData,
  TransformJS,
  POINT_CENTROID,
  POINT_EDGE,
  TRANSFORM_MIRROR,
  TRANSFORM_ROTATION,
} from 'antwerp';
import {
  borderSizeX1Px,
  colorAccent1Shade1,
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
} from '../../utils/Two';

const ANIMATE_INTERVAL = 500;

const DEG_90 = Math.PI * 0.5;
const DEG_180 = Math.PI;
const DEG_360 = Math.PI * 2;

const TRANSFORM_MIRROR_CENTER_COLOR = '#00FFFF';
const TRANSFORM_MIRROR_POINT_COLOR = '#00FF00';
const TRANSFORM_ROTATION_POINT_COLOR = '#0000FF';
const TRANSFORM_ROTATION_CENTER_COLOR = '#FF0000';

interface DrawOptions {
  animate?: boolean;
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
  data?: AntwerpData;
  opts?: DrawOptions;
  toStage?: number;
  two: Two;

  constructor(container: HTMLDivElement) {
    this.container = container;
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
        this.drawShapes((++this.toStage % (data.stages + 2)) - 1);

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
      stroke: colorAccent1Shade1,
      strokeWidth: borderSizeX1Px,
      vertices: [
        [(this.two.width / 2) + (borderSizeX1Px / 2), 0],
        [(this.two.width / 2) + (borderSizeX1Px / 2), this.two.height],
      ],
    }));

    this.groupAxis.add(createLine({
      stroke: colorAccent1Shade1,
      strokeWidth: borderSizeX1Px,
      vertices: [
        [0, (this.two.height / 2) + (borderSizeX1Px / 2)],
        [this.two.width, (this.two.height / 2) + (borderSizeX1Px / 2)],
      ],
    }));
  }

  drawShapes(toStage?: number) {
    if (this.groupShapes) {
      this.groupShapes.remove();
    }

    this.two.add(this.groupShapes = createGroup({
      x: this.two.width / 2,
      y: this.two.height / 2,
    }));

    for (const shape of this.data.shapes) {
      if (toStage === undefined || shape.stage <= toStage) {
        this.groupShapes.add(createPolygon({
          fill: this.opts.colorScale
            ? this.opts.colorScale(1 - (shape.stage / this.data.stages))
            : colorLightShade1,
          opacity: (!this.opts.fadeConnectedShapes || shape.disconnected) ? 1 : 0.1,
          stroke: colorDarkShade1,
          strokeWidth: borderSizeX1Px,
          vertices: shape.vectors,
        }));
      }
    }
  }

  drawTransforms() {
    this.removeTransforms();
    this.two.add(this.groupTransforms = createGroup({
      x: this.two.width / 2,
      y: this.two.height / 2,
    }));

    for (const transform of this.data.transforms) {
      switch (transform.action) {
        case TRANSFORM_MIRROR:
          transform.pointType
            ? this.drawTransformMirrorPoint(transform)
            : this.drawTransformMirrorCenter(transform);
          break;
        case TRANSFORM_ROTATION:
          transform.pointType
            ? this.drawTransformRotationPoint(transform)
            : this.drawTransformRotationCenter(transform);
      }
    }
  }

  drawTransformMirrorPoint({ actionAngle, point, pointType }: TransformJS) {
    if (!point) return;

    const hypot = Math.hypot(this.two.height, this.two.width);
    let px: number, py: number, lx1: number, ly1: number, lx2: number, ly2: number;

    if (pointType === POINT_CENTROID && point.centroid) {
      const [ x, y ] = point.centroid;

      px = x;
      py = y;
      lx1 = (Math.cos(actionAngle - DEG_180) * hypot) + x;
      ly1 = (Math.sin(actionAngle - DEG_180) * hypot) + y;
      lx2 = (Math.cos(actionAngle) * hypot) + x;
      ly2 = (Math.sin(actionAngle) * hypot) + y;
    }

    if (pointType === POINT_EDGE && point.line) {
      const { centroid: [ x, y ], v1, v2, v1AngleToV2 } = point.line;

      px = x;
      py = y;
      lx1 = (Math.cos(v1AngleToV2 - DEG_180) * hypot) + v1[0];
      ly1 = (Math.sin(v1AngleToV2 - DEG_180) * hypot) + v1[1];
      lx2 = (Math.cos(v1AngleToV2) * hypot) + v2[0];
      ly2 = (Math.sin(v1AngleToV2) * hypot) + v2[1];
    }

    this.groupTransforms.add(createLine({
      stroke: TRANSFORM_MIRROR_POINT_COLOR,
      strokeWidth: borderSizeX1Px,
      vertices: [[lx1, ly1], [lx2, ly2]],
    }));

    this.groupTransforms.add(createCircle({
      fill: TRANSFORM_MIRROR_POINT_COLOR,
      radius: sizeX1Px,
      x: px,
      y: py,
    }));
  }

  drawTransformMirrorCenter({ actionAngle }: TransformJS) {
    const hypot = Math.hypot(this.two.height, this.two.width);

    if (!actionAngle) {
      return;
    }

    while (actionAngle <= DEG_360) {
      this.groupTransforms.add(createLine({
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
      this.groupTransforms.add(createLine({
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

  drawTransformRotationPoint({ point, pointType }: TransformJS) {
    if (!point) return;

    const [ x, y, pointAngle ] = pointType === POINT_EDGE
      ? point.edge
      : point.centroid;

    this.groupTransforms.add(createCircle({
      fill: TRANSFORM_ROTATION_POINT_COLOR,
      radius: sizeX1Px,
      x: x,
      y: y,
    }));

    this.groupTransforms.add(createLine({
      stroke: TRANSFORM_ROTATION_POINT_COLOR,
      strokeWidth: borderSizeX1Px,
      vertices: [[0, 0], [x * 2, y * 2]],
    }));

    this.drawArrowArc(TRANSFORM_ROTATION_POINT_COLOR,
      pointAngle + DEG_180, pointAngle + DEG_360,
      x, y, Math.hypot(x, y));
  }

  drawArrowArc(stroke: string, a1: number, a2: number, cx: number, cy: number, radius: number) {
    const anglePadding = Math.PI / (radius / 6);
    const angleStart = a1 + anglePadding - DEG_90;
    const angleEnd = a2 - anglePadding - DEG_90;
    const arrowSize = sizeX2Px;
    const arcRadius = radius - (arrowSize * 2);

    this.groupTransforms.add(createArc({
      stroke: stroke,
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
