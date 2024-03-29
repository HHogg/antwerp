import Two from 'two.js';

const PI = Math.PI;
const HALF_PI = PI / 2;

interface ShapeProps {
  alignment?: string;
  family?: string;
  fill?: string;
  opacity?: number;
  radius?: number;
  rotate?: number;
  size?: number;
  stroke?: string;
  strokeDasharray?: [number, number];
  strokeWidth?: number;
  style?: string;
  translate?: boolean;
}

interface ArcProps extends ShapeProps {
  a1: number;
  a2: number;
  cx: number;
  cy: number;
  radius: number;
}

const createShape = (shape: Two.Path, props: ShapeProps) => {
  const {
    fill = 'transparent',
    opacity = 1,
    rotate = 0,
    stroke = 'transparent',
    strokeDasharray,
    strokeWidth = 0,
    translate,
  } = props;

  const {
    top,
    left,
    width,
    height,
  } = shape.getBoundingClientRect();

  const cx = left + (width / 2);
  const cy = top + (height / 2);

  if (translate) {
    shape.center();
    shape.translation.set(cx, cy);
  }

  shape.fill = fill;
  shape.stroke = stroke;
  shape.linewidth = strokeWidth;
  shape.opacity = opacity;
  shape.rotation = rotate;

  if (strokeDasharray) {
    shape.dashes[0] = strokeDasharray[0];
    shape.dashes[1] = strokeDasharray[1];
  }

  return shape;
};

export const createCircle = (props: ShapeProps & { radius: number; x: number; y: number }) => {
  return createShape(
    new Two.Circle(props.x, props.y, props.radius),
  props);
};

export const createGroup = (props: ShapeProps & { x?: number; y?: number } = {}) => {
  const group = new Two.Group();

  if (props.x !== undefined && props.y !== undefined) {
    group.translation.set(props.x, props.y);
  }

  return group;
};

export const createLine = (props: ShapeProps & { curved?: boolean; vertices: [number, number][] }) => {
  return createShape(
    new Two.Path(
      props.vertices.map(([x, y]) =>
        new Two.Vector(x, y)
      ),
    false, props.curved || false),
  props);
};

export const createPolygon = (props: ShapeProps & { curved?: boolean; vertices: [number, number][] }) => {
  return createShape(
    new Two.Path(
      props.vertices.map(([ x, y ]) =>
        new Two.Vector(x, y)
      ),
    true, props.curved || false),
  props);
};

export const createText = (text: string, props: ShapeProps & { x: number; y: number }) => {
  return new Two.Text(text, props.x, props.y, props);
};

const arcsToAnchors = (arcs: ArcProps[], closed?: boolean) => {
  const R = Two.Resolution * 3;
  const anchors = Array
    .from({ length: (R * arcs.length) })
    .map(() => new Two.Anchor(0, 0, 0, 0, 0, 0, Two.Commands.move));

  for (let i = 0; i < arcs.length; i++) {
    const { a1, a2, cx, cy, radius } = arcs[i];

    for (let j = 0; j < R; j++) {
      const anchorIndex = i * R + j;
      const anchor = anchors[anchorIndex];
      const theta = (j / (R - 1)) * (a2 - a1) + a1;

      if (i === 0 && j === 0) {
        anchor.command = Two.Commands.move;
      } else {
        anchor.command = Two.Commands.curve;
      }

      anchor.x = cx + (radius * Math.cos(theta));
      anchor.y = cy + (radius * Math.sin(theta));

      if (anchor.controls) {
        anchor.controls.left.clear();
        anchor.controls.right.clear();
      }

      if (anchor.command === Two.Commands.curve) {
        const amp = (radius * ((a2 - a1) / R) / PI);

        if (anchor.controls) {
          if (j !== 0) {
            anchor.controls.left.x = amp * Math.cos(theta - HALF_PI);
            anchor.controls.left.y = amp * Math.sin(theta - HALF_PI);
          }

          if (j !== R - 1) {
            anchor.controls.right.x = amp * Math.cos(theta + HALF_PI);
            anchor.controls.right.y = amp * Math.sin(theta + HALF_PI);
          }
        }

      }
    }
  }

  if (closed) {
    anchors[anchors.length - 1].x = anchors[0].x;
    anchors[anchors.length - 1].y = anchors[0].y;
  }

  return anchors;
};

export const createArc = (props: ArcProps) => {
  return createShape(
    new Two.Path(arcsToAnchors([props]), false, false, true),
  props);
};
