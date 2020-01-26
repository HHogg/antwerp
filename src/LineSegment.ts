import Shape from './Shape';
import Vector, { VectorJS } from './Vector';

export type LineSegmentJS = [VectorJS, VectorJS];

export default class LineSegment {
  _angle?: number;
  _centroid?: Vector;
  _length?: number;
  _maxDistance?: number;
  _minDistance?: number;
  _v1Distance?: number;
  _v2Distance?: number;
  connection?: LineSegment;
  isConnected: boolean;
  shape?: Shape;
  v1: Vector;
  v2: Vector;
  xMax: number;
  xMin: number;
  yMax: number;
  yMin: number;

  constructor(v1: Vector, v2: Vector, shape?: Shape) {
    this.isConnected = false;
    this.shape = shape;
    this.v1 = v1;
    this.v2 = v2;

    this.xMax = this.v1.x > this.v2.x ? this.v1.x : this.v2.x;
    this.xMin = this.v1.x > this.v2.x ? this.v2.x : this.v1.x;
    this.yMax = this.v1.y > this.v2.y ? this.v1.y : this.v2.y;
    this.yMin = this.v1.y > this.v2.y ? this.v2.y : this.v1.y;
  }

  get angle() {
    if (this._angle === undefined) {
      this._angle = this.v1.angleTo(this.v2);
    }

    return this._angle;
  }

  get centroid() {
    if (this._centroid === undefined) {
      this._centroid = this.v1.divide(this.v2);
    }

    return this._centroid;
  }

  get v1Distance() {
    if (this._v1Distance === undefined) {
      this._v1Distance = this.v1.distanceTo();
    }

    return this._v1Distance;
  }

  get v2Distance() {
    if (this._v2Distance === undefined) {
      this._v2Distance = this.v2.distanceTo();
    }

    return this._v2Distance;
  }

  get length() {
    if (this._length === undefined) {
      this._length = this.v1.distanceTo(this.v2);
    }

    return this._length;
  }

  get maxDistance() {
    if (this._maxDistance === undefined) {
      this._maxDistance = this.v1Distance > this.v2Distance
        ? this.v1Distance
        : this.v2Distance;
    }

    return this._maxDistance;
  }

  get minDistance() {
    if (this._minDistance === undefined) {
      this._minDistance = this.v1Distance < this.v2Distance
        ? this.v1Distance
        : this.v2Distance;
    }

    return this._minDistance;
  }

  connect(ls: LineSegment) {
    this.connection = ls;
    this.isConnected = true;
  }

  equals(ls: LineSegment) {
    return this.centroid.equals(ls.centroid);
  }

  getNearestPoint(v: Vector) {
    const v1Distance = this.v1.distanceTo(v);
    const v2Distance = this.v2.distanceTo(v);
    const centroidDistance = this.centroid.distanceTo(v);

    if (v1Distance < v2Distance) {
      if (v1Distance < centroidDistance) {
        return this.v1;
      }
    } else {
      if (v2Distance < centroidDistance) {
        return this.v2;
      }
    }

    return this.centroid;
  }

  intersects(ls: LineSegment) {
    const x1 = this.v1.x;
    const y1 = this.v1.y;
    const x2 = this.v2.x;
    const y2 = this.v2.y;
    const x3 = ls.v1.x;
    const y3 = ls.v1.y;
    const x4 = ls.v2.x;
    const y4 = ls.v2.y;

    const d = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / d;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / d;

    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4) || !d || (ua < 0 || ua > 1 || ub < 0 || ub > 1)) {
      return false;
    }

    return new Vector(
      x1 + ua * (x2 - x1),
      y1 + ua * (y2 - y1),
    );
  }

  reset() {
    this._centroid = undefined;
    this._length = undefined;
    this._maxDistance = undefined;
    this._minDistance = undefined;
  }

  toJs(): LineSegmentJS {
    return [
      this.v1.toJs(),
      this.v2.toJs(),
    ];
  }
}
