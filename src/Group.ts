import { IntersectionPoint } from './Types';
import LineSegment from './LineSegment';
import Shape, { ShapeJS } from './Shape';
import Vector from './Vector';

type Item = Group | Shape;

export default class Group {
  disconnectedVectorDistanceMax?: number;
  disconnectedVectorDistanceMin?: number;
  items: Item[]
  lineSegments: LineSegment[];
  stage?: number;

  constructor(items: Item[] = []) {
    this.items = Array.isArray(items) ? items : [items];
    this.lineSegments = [];
  }

  get lineSegmentsSorted() {
    return this.lineSegments.sort( (ls1: LineSegment, ls2: LineSegment) =>
      ls1.v1.equalsX(0) && ls1.v2.equalsX(0) && 1 ||
      ls2.v1.equalsX(0) && ls2.v2.equalsX(0) && -1 ||
      ls1.centroid.angleDifference(ls2.centroid));
  }

  get tail() {
    return this.items[this.items.length - 1];
  }

  add(item: Item, flatten = true) {
    if (item instanceof Group) {
      if (flatten) {
        item.items.forEach((item) => {
          if (item instanceof Shape) {
            this.addShape(item);
          }
        });
      } else {
        this.items.push(item);
      }
    } else {
      this.addShape(item);
    }

    return this;
  }

  addLineSegments(lineSegments: LineSegment[]) {
    this.lineSegments = this.lineSegments.concat(lineSegments);

    return this;
  }

  addShape(shape: Shape) {
    const length = this.items.length;
    let isAlreadyIncluded = false;

    for (let i = 0; i < length && !isAlreadyIncluded; i++) {
      const item = this.items[i];
      isAlreadyIncluded = item instanceof Shape && item.equals(shape);
    }

    if (!isAlreadyIncluded) {
      this.items.push(shape);
      this.addLineSegments(shape.lineSegments);

      if (this.stage !== undefined) {
        shape.setStage(this.stage);
      }
    }

    return this;
  }

  clone(): Group {
    return new Group(this.items.map((item) => item.clone()));
  }

  connectLineSegments() {
    const lss = this.lineSegmentsSorted;
    const length = lss.length;

    this.disconnectedVectorDistanceMax = undefined;
    this.disconnectedVectorDistanceMin = undefined;

    for (let i = 0; i < length; i++) {
      for (let j = i + 1; j < length && !lss[i].isConnected; j++) {
        if (!lss[j].connection && lss[i].equals(lss[j])) {
          lss[i].connect(lss[j]);
          lss[j].connect(lss[i]);
        }
      }

      if (!lss[i].isConnected) {
        if (this.disconnectedVectorDistanceMax === undefined ||
            lss[i].maxDistance > this.disconnectedVectorDistanceMax) {
          this.disconnectedVectorDistanceMax = lss[i].maxDistance;
        }

        if (this.disconnectedVectorDistanceMin === undefined ||
            lss[i].minDistance < this.disconnectedVectorDistanceMin) {
          this.disconnectedVectorDistanceMin = lss[i].minDistance;
        }
      }
    }

    return this;
  }

  flatten() {
    const items = this.items;
    const l1 = items.length;

    this.items = [];

    for (let i = 0; i < l1; i++) {
      const item = items[i];

      if (item instanceof Group) {
        const l2 = item.items.length;

        for (let j = 0; j < l2; j++) {
          this.items.push(item.items[j]);
        }
      } else {
        this.items.push(items[i]);
      }
    }

    return this;
  }

  getIntersectingPoints(ls1: LineSegment) {
    const ips: IntersectionPoint[] = [];

    for (let i = 0; i < this.lineSegments.length; i++) {
      const ls2 = this.lineSegments[i];
      const ip1 = ls1.intersects(ls2);

      if (ip1 && ls2.shape) {
        const ip1Snap = ls2.getNearestPoint(ip1);
        let ip2: undefined | IntersectionPoint = undefined;

        for (let j = 0; j < ips.length && !ip2; j++) {
          if (ips[j].point.equals(ip1)) {
            ip2 = ips[j];
          }
        }

        if (ip2) {
          if (ls2.shape.centroid.distanceDifference(ip2.centroid) > 0) {
            ip2.centroid = ls2.shape.centroid;
            ip2.edge = ip1Snap;
            ip2.point = ip1;
            ip2.line = ls2;
          }
        } else {
          ips.push({
            centroid: ls2.shape.centroid,
            edge: ip1Snap,
            point: ip1,
            line: ls2,
          });
        }
      }
    }

    return ips
      .sort(({ point: v1a }: IntersectionPoint, { point: v2a }: IntersectionPoint) => v1a.distanceDifference(v2a))
      .filter(({ edge }) => !edge.equals(new Vector(0, 0)));
  }

  setStage(stage: number) {
    if (this.stage === undefined) {
      this.stage = stage;
      this.items.forEach((item) => {
        if (this.stage !== undefined) {
          item.setStage(this.stage);
        }
      });
    }

    return this;
  }

  reflect(ls: LineSegment): this {
    return this.transform((item) => item.reflect(ls));
  }

  rotate(a: number, v = new Vector(0, 0)): this {
    return this.transform((item) => item.rotate(a, v));
  }

  translate(x: number, y: number): this {
    return this.transform((item) => item.translate(x, y));
  }

  transform(transform: (i: Item) => Item): this {
    this.items.forEach(transform);
    return this;
  }

  toJs(): ShapeJS[] {
    return [].concat(...this.items.map((item) => item.toJs()));
  }
}
