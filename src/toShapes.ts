import { AntwerpData, SideN, Transform, TransformJS } from './Types';
import toEntities, {
  POINT_CENTROID,
  POINT_EDGE,
  TRANSFORM_MIRROR,
  TRANSFORM_ROTATION,
} from './toEntities';
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

const ErrorTranformNoIntersectionPoint = (transform: string) => ({
  code: 'ErrorTranformNoIntersectionPoint',
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

const validShapes: { [key in SideN]: boolean } = {
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

const getIntersectingPoint = (root: Group, transform: Transform) => {
  const { actionAngle, pointNumber } = transform;

  if (pointNumber !== undefined && root.disconnectedVectorDistanceMax !== undefined) {
    return root.getIntersectingPoints(new LineSegment(
      new Vector(0, 0),
      new Vector(
        Math.cos(actionAngle - DEG_90) * root.disconnectedVectorDistanceMax,
        Math.sin(actionAngle - DEG_90) * root.disconnectedVectorDistanceMax,
      ),
    ))[pointNumber - 1];
  }
};

const transformMirrorPoint = (root: Group, stage: Stage, transform: Transform) => {
  const { actionAngle, point, pointType } = transform;

  if (pointType === POINT_CENTROID && point) {
    root.add(root
      .clone()
      .setStage(stage.value++)
      .reflect(new LineSegment(
        new Vector(
          Math.cos(actionAngle - DEG_180),
          Math.sin(actionAngle - DEG_180),
        ).add(point.centroid),
        new Vector(
          Math.cos(actionAngle),
          Math.sin(actionAngle),
        ).add(point.centroid),
      ))
    );
  }

  if (pointType === POINT_EDGE && point) {
    root.add(root
      .clone()
      .setStage(stage.value++)
      .reflect(point.line)
    );
  }
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
      .setStage(stage.value++)
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
  const { point, pointType } = transform;

  if (point) {
    root.add(root
      .clone()
      .setStage(stage.value++)
      .rotate(DEG_180, pointType === POINT_EDGE
        ? point.edge
        : point.centroid)
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
      .setStage(stage.value++)
      .rotate(actionAngle)
    );

    actionAngle *= 2;
  }
};

const transform = (root: Group, stage: Stage, transform: Transform) => {
  const { action, pointType } = transform;

  switch (action) {
    case TRANSFORM_MIRROR:
      return pointType
        ? transformMirrorPoint(root, stage, transform)
        : transformMirrorCenter(root, stage, transform);
    case TRANSFORM_ROTATION:
      return transform.pointType
        ? transformRotationPoint(root, stage, transform)
        : transformRotationCenter(root, stage, transform);
  }
};


const transformToJs = ({ point, ...rest }: Transform): TransformJS => ({
  ...rest,
  point: point && {
    centroid: point.centroid && point.centroid.toJs(),
    edge: point.edge && point.edge.toJs(),
    line: point.line && {
      centroid: point.line.centroid.toJs(),
      v1: point.line.v1.toJs(),
      v2: point.line.v2.toJs(),
      v1AngleToV2: point.line.v1.angleTo(point.line.v2),
    },
  },
});

interface Props {
  configuration: string;
  disableRepeating?: boolean;
  height: number;
  maxRepeat?: number;
  shapeSize: number;
  width: number;
}

export default (props: Props): AntwerpData => {
  const {
    configuration,
    disableRepeating,
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
  const seedShape = getSeedShape(seed, shapeSize / 2);
  const root = new Group();

  try {
    if (!seedShape) {
      throw ErrorSeed();
    }

    root.add(seedShape.setStage(stage.value++));


    /** Stage 2 */
    for (let i = 0; i < shapes.length; i++) {
      const group = new Group().setStage(stage.value++);
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
                const shape = new Shape(shapes[i][j]).fromLineSegment(lss[k]);

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

    /** Stage 3 */
    for (const tn of transforms) {
      if (tn.pointType) {
        tn.point = getIntersectingPoint(root, tn);

        if (!tn.point) {
          throw ErrorTranformNoIntersectionPoint(tn.string);
        }
      }

      transform(root, stage, tn);
      root.connectLineSegments();
    }

    /** Stage 4 */
    let repeat = maxRepeat;

    if (!disableRepeating && transforms.length > 1) {
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
      shapes: root.toJs(),
      stages: stage.value,
      transforms: transforms.map(transformToJs),
    };
  }

  return {
    shapes: root.toJs(),
    stages: stage.value,
    transforms: transforms.map(transformToJs),
  };
};
