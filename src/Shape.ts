import LineSegment from './LineSegment';
import Vector, { VectorJS } from './Vector';

const mean = (values: number[]) => values.reduce((n, v) => n + v, 0) / values.length;

const callReset = (ls: LineSegment) => ls.reset();

const extractClone = (vector: Vector) => vector.clone();
const extractDistanceTo = (vector: Vector) => vector.distanceTo();
const extractJs = (vector: Vector) => vector.toJs();

const sortLineSegments = (ls1: LineSegment, ls2: LineSegment) =>
  ls1.v1.equalsX(0) && ls1.v2.equalsX(0) && 1 ||
  ls2.v1.equalsX(0) && ls2.v2.equalsX(0) && -1 ||
  ls1.centroid.angleDifference(ls2.centroid);

export interface ShapeJS {
  disconnected: boolean;
  stage?: number;
  vectors: VectorJS[];
}

export default class Shape {
  _centroid?: Vector;
  _distances?: number[];
  _lineSegments?: LineSegment[];
  _maxDistance?: number;
  _minDistance?: number;
  angle: number;
  sides: number;
  stage?: number;
  vectors: Vector[];

  constructor(sides: number, vectors: Vector[] = []) {
    this.angle = (Math.PI * 2) / sides;
    this.sides = sides;
    this.vectors = vectors;
  }

  get centroid() {
    if (this._centroid === undefined) {
      this._centroid = new Vector(
        mean(this.vectors.map(({ x }) => x)),
        mean(this.vectors.map(({ y }) => y)),
      );
    }

    return this._centroid;
  }

  get distances() {
    if (this._distances === undefined) {
      this._distances = this.vectors.map(extractDistanceTo);
    }

    return this._distances;
  }

  get lineSegments() {
    if (this._lineSegments === undefined) {
      this._lineSegments = this.vectors.map((vector, i) =>
        new LineSegment(vector, this.vectors[i + 1] || this.vectors[0], this));
    }

    return this._lineSegments;
  }

  get lineSegmentsSorted() {
    return this.lineSegments
      .sort(sortLineSegments);
  }

  get maxDistance() {
    if (this._maxDistance === undefined) {
      this._maxDistance = Math.max(...this.distances);
    }

    return this._maxDistance;
  }

  get minDistance() {
    if (this._minDistance === undefined) {
      this._minDistance = Math.min(...this.distances);
    }

    return this._minDistance;
  }

  clone() {
    return new Shape(this.sides, this.vectors.map(extractClone));
  }

  equals(s: Shape) {
    return this.centroid.equals(s.centroid);
  }

  fromLineSegment(lineSegment: LineSegment) {
    const v1 = lineSegment.v2.clone();
    const v2 = lineSegment.v1.clone();
    const length = lineSegment.length;
    let a = v1.angleTo(v2) + this.angle;

    this.vectors = [v1, v2];

    for (let i = this.vectors.length; i < this.sides; i++, a += this.angle) {
      this.vectors.push(new Vector(
        Math.cos(a) * length,
        Math.sin(a) * length,
      ).add(this.vectors[i - 1]));
    }

    return this;
  }

  fromRadius(r: number, v = new Vector(0, 0)) {
    this.vectors = [];

    for (let i = 0; i < this.sides; i++) {
      this.vectors.push(new Vector(
        Math.cos(this.angle * i) * r,
        Math.sin(this.angle * i) * r,
      ).add(v));
    }

    return this;
  }

  reflect(ls: LineSegment) {
    return this.transform((vector) => vector.reflect(ls));
  }

  rotate(a: number, v?: Vector) {
    return this.transform((vector) => vector.rotate(a, v));
  }

  setStage(stage: number) {
    if (this.stage === undefined) {
      this.stage = stage;
    }

    return this;
  }

  translate(x: number, y: number) {
    return this.transform((vector) => vector.translate(x, y));
  }

  transform(fn: (v: Vector) => Vector) {
    this._centroid = undefined;
    this._distances = undefined;
    this._maxDistance = undefined;
    this._minDistance = undefined;
    this.vectors.forEach(fn);
    this.lineSegments.forEach(callReset);
    return this;
  }

  toJs(): ShapeJS {
    return {
      stage: this.stage,
      disconnected: this.lineSegments.some(({ isConnected }) => !isConnected),
      vectors: this.vectors.map(extractJs),
    };
  }
}
