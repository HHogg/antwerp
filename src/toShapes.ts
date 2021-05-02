import { AntwerpData, AntwerpOptions, TypeShape, Transform, TransformJS, TypeTransformPoint } from './Types';
import toEntities from './toEntities';
import Group from './Group';
import LineSegment from './LineSegment';
import Shape from './Shape';
import Vector from './Vector';

interface Stage {
  value: number;
}

const ErrorSeed = () => ({
  code: 'ErrorSeed',
  type: 'Seed Shape',
  message: 'The seed shape must be one of 3, 4, 6, 8 or 12, directly followed by a `-` to indicate the start of the next shape group.',
});

const ErrorInvalidShape = () => ({
  code: 'ErrorShape',
  type: 'Invalid Shape',
  message: 'Shapes must only be one of 3, 4, 6, 8, or 12.',
});

const ErrorTransformAngleZero = (transform: string) => ({
  code: 'ErrorTransformAngle',
  type: 'Transform Angle',
  message: `The angle of the "${transform}" transform must be greater than 0.`,
});

const ErrorTransformNoChange = () => ({
  code: 'ErrorTransformNoChange',
  type: 'Repeated Transform',
  message: 'The covered area did not increase when the tile was repeated. This is likely caused by one or more incorrect transforms.',
});

const ErrorTransformNoIntersectionPoint = (transform: string) => ({
  code: 'ErrorTransformNoIntersectionPoint',
  type: 'Transform Intersection Point',
  message: `No intersection point found for the "${transform}" transform.`,
});

const DEG_90 = Math.PI / 2;
const DEG_180 = Math.PI;
const DEG_360 = Math.PI * 2;

// Visual adjustments to normalise the shape sizes
const VA_3 = 0.5775;
const VA_4 = 0.95;
const VA_6 = 1;
const VA_8 = 1;
const VA_12 = 1.15;

const validShapes: { [key in TypeShape]: boolean } = {
  3: true,
  4: true,
  6: true,
  8: true,
  12: true,
};

const getSeedShape = (n: number, r: number) => {
  switch (n) {
    case 3: return new Shape(n)
      .fromRadius(r * VA_3)
      .rotate(Math.PI / 3)
      .translate(r * VA_3, 0)
      .rotate(Math.PI / -3);
    case 4: return new Shape(n)
      .fromRadius(r * VA_4)
      .rotate(Math.PI / 4);
    case 6: return new Shape(n)
      .fromRadius(r * VA_6)
      .rotate(Math.PI / 6);
    case 8: return new Shape(n)
      .fromRadius(r * VA_8)
      .rotate(Math.PI / 8);
    case 12: return new Shape(n)
      .fromRadius(r * VA_12)
      .rotate(Math.PI / 12);
  }
};

const transformMirrorPoint = (root: Group, stage: Stage, transform: Transform) => {
  if (!transform.point) return;

  const { point } = transform;
  const mirrorAngle = point[2] === 'l' ? point[1] : point[1] + Math.PI / 2;

  root.add(root
    .clone()
    .setStage(++stage.value)
    .reflect(new LineSegment(
      new Vector(
        Math.cos(mirrorAngle - DEG_180),
        Math.sin(mirrorAngle - DEG_180),
      ).add(point[0]),
      new Vector(
        Math.cos(mirrorAngle),
        Math.sin(mirrorAngle),
      ).add(point[0]),
    ))
  );
};

const transformMirrorCenter = (root: Group, stage: Stage, transform: Transform) => {
  let { actionAngle } = transform;
  const { string } = transform;

  if (!actionAngle) {
    throw ErrorTransformAngleZero(string);
  }

  while (actionAngle < DEG_360) {
    root.add(root
      .clone()
      .setStage(++stage.value)
      .reflect(new LineSegment(
        new Vector(0, 0),
        new Vector(
          Math.cos(actionAngle - DEG_90),
          Math.sin(actionAngle - DEG_90),
        )
      ))
    );

    actionAngle *= 2;
  }
};

const transformRotationPoint = (root: Group, stage: Stage, transform: Transform) => {
  const { point } = transform;

  if (point) {
    root.add(root
      .clone()
      .setStage(++stage.value)
      .rotate(DEG_180, point[0])
    );
  }
};

const transformRotationCenter = (root: Group, stage: Stage, transform: Transform) => {
  let { actionAngle } = transform;
  const { string } = transform;

  if (!actionAngle) {
    throw ErrorTransformAngleZero(string);
  }

  while (actionAngle < DEG_360) {
    root.add(root
      .clone()
      .setStage(++stage.value)
      .rotate(actionAngle)
    );

    actionAngle *= 2;
  }
};

const transform = (root: Group, stage: Stage, transform: Transform) => {
  const { action, pointIndex } = transform;

  switch (action) {
    case 'm':
      return pointIndex
        ? transformMirrorPoint(root, stage, transform)
        : transformMirrorCenter(root, stage, transform);
    case 'r':
      return pointIndex
        ? transformRotationPoint(root, stage, transform)
        : transformRotationCenter(root, stage, transform);
  }
};

export const transformToJS = (transform: Transform): TransformJS => ({
  ...transform,
  point: transform.point && [
    transform.point[0].toJS(),
    transform.point[1],
    transform.point[2],
  ],
});

export default (props: AntwerpOptions): AntwerpData => {
  const {
    configuration,
    height,
    maxRepeat,
    shapeSize,
    width,
  } = props;

  const [
    seed,
    shapes,
    transforms,
  ] = toEntities(configuration);

  /** Stage 1 */
  const stage: Stage = { value: 0 };
  const stagePlacement: Stage = { value: 0 };
  const seedShape = getSeedShape(seed, shapeSize / 2);
  const root = new Group();
  const vertices: TypeTransformPoint[][] = [];

  try {
    if (!seed) {
      return {
        shapes: [],
        stages: 0,
        stagesPlacement: 0,
        transforms: [],
        vertices: [],
      };
    }

    if (!seedShape) {
      throw ErrorSeed();
    }

    root.add(seedShape
      .setStage(++stage.value)
      .setStagePlacement(++stagePlacement.value));

    /** Stage 2 */
    for (let i = 0; i < shapes.length; i++) {
      const group = new Group().setStage(stage.value);
      const tail = root.tail;
      const lss = tail.lineSegmentsSorted;

      root.add(group, false);

      for (let j = 0, skip = 0; j < shapes[i].length; j++) {
        if (shapes[i][j]) {
          if (!validShapes[shapes[i][j]]) {
            throw ErrorInvalidShape();
          }

          for (let k = 0, s = skip; k < lss.length; k++) {
            if (!lss[k].isConnected) {
              if (s) {
                s--;
              } else {
                const shape = new Shape(shapes[i][j])
                  .fromLineSegment(lss[k])
                  .setStagePlacement(++stagePlacement.value);

                group.addShape(shape);
                root.addLineSegments(shape.lineSegments);
                root.connectLineSegments();

                break;
              }
            }
          }
        } else {
          skip++;
        }
      }
    }

    if (!shapes.length) {
      root.connectLineSegments();
    }

    root.flatten();
    vertices.push(root.getVertices());

    /** Stage 3 */
    for (let i = 0; i < transforms.length; i++) {
      const tn = transforms[i];

      if (tn.pointIndex && !(tn.point = vertices[i][tn.pointIndex - 1])) {
        throw ErrorTransformNoIntersectionPoint(tn.string);
      }

      transform(root, stage, tn);
      root.connectLineSegments();
      vertices.push(root.getVertices());
    }

    /** Stage 4 */
    let repeat = maxRepeat;

    if ((maxRepeat === undefined || maxRepeat) && transforms.length > 1) {
      const hypot = Math.hypot(height, width) / 2;
      let max = 0;
      let min = 0;

      if (root.disconnectedVectorDistanceMax !== undefined && root.disconnectedVectorDistanceMin !== undefined) {
        while (root.disconnectedVectorDistanceMin < hypot) {
          for (const tn of transforms) {
            transform(root, stage, tn);
          }

          max = root.disconnectedVectorDistanceMax;
          min = root.disconnectedVectorDistanceMin;

          root.connectLineSegments();

          const hasMaxChanged = root.disconnectedVectorDistanceMax !== max;
          const hasMinChanged = root.disconnectedVectorDistanceMin !== min;

          if (!hasMaxChanged && !hasMinChanged) {
            throw ErrorTransformNoChange();
          }

          if (repeat !== undefined && --repeat === 0) {
            break;
          }
        }
      }
    }
  } catch (e) {
    return {
      error: e,
      shapes: root.toJS(),
      stages: stage.value,
      stagesPlacement: stagePlacement.value,
      transforms: transforms.map(transformToJS),
      vertices: vertices[vertices.length - 1]
        .map(([vector]) => vector.toJS()),
    };
  }

  return {
    shapes: root.toJS(),
    stages: stage.value,
    stagesPlacement: stagePlacement.value,
    transforms: transforms.map(transformToJS),
    vertices: vertices[vertices.length - 1]
        .map(([vector]) => vector.toJS()),
  };
};
