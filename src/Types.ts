import Vector from './Vector';

export type TypeAction = 'm' | 'r';
export type TypePoint = 'v' | 'l';
export type TypeShape = 3 | 4 | 6 | 8 | 12;

export type TypeVectorJS = [number, number];
export type TypeLineSegmentJS = [TypeVectorJS, TypeVectorJS];
export type TypeShapeJS = [TypeVectorJS[], number, number];
export type TypeGroupJS = TypeShapeJS[];

export type TypeTransformPoint = [Vector, number, TypePoint];

export type TypeEntities = [
  TypeShape,
  TypeShape[][],
  Transform[],
];

export interface Transform {
  action: TypeAction;
  actionAngle?: number;
  point?: TypeTransformPoint;
  pointIndex: number;
  string: string;
}

export interface TransformJS extends Omit<Transform, 'point'> {
  point?: [TypeVectorJS, number, TypePoint];
}

export interface AntwerpError extends Error {
  type: string;
}

export interface AntwerpData {
  error?: AntwerpError;
  shapes: TypeShapeJS[];
  stages: number;
  stagesPlacement: number;
  transforms: TransformJS[];
  vertices: TypeVectorJS[];
}

export interface AntwerpOptions {
  configuration: string;
  height: number;
  maxRepeat?: number;
  shapeSize: number;
  width: number;
}
