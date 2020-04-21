import { TypeLineSegmentJS } from './Types';
import Shape from './Shape';
import Vector from './Vector';

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

  static sort(a: LineSegment, b: LineSegment): number {
    return (a.v1.equalsX(0) && a.v2.equalsX(0) && 1) ||
      (b.v1.equalsX(0) && b.v2.equalsX(0) && -1) ||
      a.centroid.angleNorm - b.centroid.angleNorm;
  }

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
      this._angle = this._angle < -(Math.PI / 2) - 0.001
        ? this._angle + (Math.PI * 2)
        : this._angle;
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

  reset() {
    this._angle = undefined;
    this._centroid = undefined;
    this._length = undefined;
    this._maxDistance = undefined;
    this._minDistance = undefined;
  }

  toJS(): TypeLineSegmentJS {
    return [
      this.v1.toJS(),
      this.v2.toJS(),
    ];
  }
}
