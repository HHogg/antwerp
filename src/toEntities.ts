import {
  TypeAction,
  TypePoint,
  TypeEntities,
  Transform,
} from './Types';

const DELIMITER_STAGE = '/';
const DELIMITER_PHASE = '-';
const DELIMITER_SHAPE = ',';

const REGEX_TRANSFORM = /([mr])([\d.]*)?\(?(\d+)?\)?/i;

const toRadians = (n: number) => (n * (Math.PI / 180));

const toTransform = (transform: string): Transform | undefined => {
  const match = REGEX_TRANSFORM.exec(transform);

  if (match) {
    const [,
      action,
      actionAngle = '180',
      pointIndex,
    ] = match as unknown as [
      string,
      TypeAction,
      string | undefined,
      string | undefined,
      TypePoint | undefined,
    ];

    if ((action === 'm' || action === 'r')) {
      return {
        action: action,
        actionAngle: pointIndex
          ? undefined
          : toRadians(+actionAngle),
        pointIndex: pointIndex ? +pointIndex : 0,
        string: transform,
      };
    }
  }
};

export default (string: string): TypeEntities => {
  const [
    shapes,
    ...transforms
  ] = string.split(DELIMITER_STAGE);

  const [
    shapeSeed,
    ...shapeGroups
  ] = shapes
    .split(DELIMITER_PHASE)
    .map((group) =>
      group
        .split(DELIMITER_SHAPE)
        .map((shape) => +shape));

  const transformEntities = transforms
    .map(toTransform)
    .filter(Boolean);


  return [
    +shapeSeed,
    shapeGroups,
    transformEntities,
  ] as TypeEntities;
};
