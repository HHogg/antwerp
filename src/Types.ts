import LineSegment from './LineSegment';
import { ShapeJS } from './Shape';
import Vector, { VectorJS } from './Vector';

export type SideN = 3 | 4 | 6 | 8 | 12;

export type Entities = [
  SideN,
  SideN[][],
  Transform[],
]

export interface IntersectionPoint {
  centroid: Vector;
  edge: Vector;
  point: Vector;
  line: LineSegment;
}

export interface Transform {
  action: 'm' | 'r';
  actionAngle: number;
  point?: IntersectionPoint;
  pointNumber?: number;
  pointType?: 'c' | 'e';
  string: string;
}

export interface TransformJS extends Omit<Transform, 'point'> {
  point?: {
    centroid: VectorJS;
    edge: VectorJS;
    line?: {
      centroid: VectorJS;
      v1: VectorJS;
      v2: VectorJS;
      v1AngleToV2: number;
    };
  };
}

export interface AntwerpData {
  error?: Error;
  shapes: ShapeJS[];
  stages: number;
  transforms: TransformJS[];
}
