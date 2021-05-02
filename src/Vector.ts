import { TypeVectorJS } from './Types';
import LineSegment from './LineSegment';

const ANGLE_PRECISION = 0.001;
const VECTOR_PRECISION = 1;

export const getAngle = (a: number) => {
  const a1 = a > -ANGLE_PRECISION && a < ANGLE_PRECISION ? 0 : a;
  return a1 < -(Math.PI / 2) - ANGLE_PRECISION
    ? a1 + (Math.PI * 2)
    : a1;
};

export default class Vector {
  angle: number;
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.angle = getAngle(Math.atan2(y, x));
    this.x = x;
    this.y = y;
  }

  add(v: Vector) {
    return this.translate(v.x, v.y);
  }

  angleEquals(v: Vector) {
    const d = v.angle - this.angle;
    return d >= -ANGLE_PRECISION && d <= ANGLE_PRECISION;
  }

  angleTo(v: Vector) {
    return getAngle(Math.atan2(v.y - this.y, v.x - this.x));
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  distanceTo(v = new Vector(0, 0)) {
    return Math.hypot(v.x - this.x, v.y - this.y);
  }

  divide(v: Vector) {
    return new Vector((this.x + v.x) / 2, (this.y + v.y) / 2);
  }

  equals(v: Vector) {
    return this.equalsX(v.x) && this.equalsY(v.y);
  }

  equalsX(x: number) {
    const dx = this.x - x;
    return dx > -VECTOR_PRECISION && dx < VECTOR_PRECISION;
  }

  equalsY(y: number) {
    const dy = this.y - y;
    return dy > -VECTOR_PRECISION && dy < VECTOR_PRECISION;
  }

  reflect(lineSegment: LineSegment) {
    const x1 = lineSegment.v1.x;
    const y1 = lineSegment.v1.y;
    const x2 = lineSegment.v2.x;
    const y2 = lineSegment.v2.y;
    const x = this.x;
    const y = this.y;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const a = (dx * dx - dy * dy) / (dx * dx + dy * dy);
    const b = 2 * dx * dy / (dx * dx + dy * dy);

    return this.setXY(
      a * (x - x1) + b * (y - y1) + x1,
      b * (x - x1) - a * (y - y1) + y1,
    );
  }

  rotate(a: number, v = new Vector(0, 0)) {
    const x = this.x;
    const y = this.y;
    const cos = Math.cos(a);
    const sin = Math.sin(a);

    return this.setXY(
      (cos * (x - v.x)) - (sin * (y - v.y)) + v.x,
      (cos * (y - v.y)) + (sin * (x - v.x)) + v.y,
    );
  }

  setXY(x: number, y: number) {
    this.x = x;
    this.y = y;

    this.angle = getAngle(Math.atan2(y, x));

    return this;
  }

  translate(x: number, y: number) {
    return this.setXY(
      this.x + x,
      this.y + y,
    );
  }

  toJS(): TypeVectorJS {
    return [
      this.x,
      this.y,
    ];
  }
}
