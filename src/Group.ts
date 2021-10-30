import { TypeGroupJS, TypeTransformPoint } from './Types';
import LineSegment from './LineSegment';
import Shape from './Shape';
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
    return this.lineSegments.sort(LineSegment.sort);
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

  getVertices() {
    const vertices: TypeTransformPoint[] = [];
    let c = 0, v = 0, h = 0;

    this.items.forEach((item) => {
      if (item instanceof Shape) {
        vertices.push([item.centroid, item.centroid.angle, 'c', 0]);
      }
    });

    this.lineSegments.forEach(({ angle, centroid, v1, v2 }) => {
      vertices.push(
        [v1, v1.angle, 'v', 0],
        [centroid, angle, 'h', 0],
        [v2, v2.angle, 'v', 0],
      );
    });

    return vertices
      .filter(([a], i) => !a.equals(new Vector(0, 0)) && vertices.slice(i + 1).every(([b]) => !b.equals(a)))
      .sort(([a], [b]) => {
        if (a.angleEquals(b)) {
          return a.distanceTo() - b.distanceTo();
        }

        return a.angle - b.angle;
      })
      .map<TypeTransformPoint>(([vector, angle, type]) => [
        vector, angle, type,
        (type === 'c' && ++c) ||
        (type === 'v' && ++v) ||
        (type === 'h' && ++h) || 0,
      ]);
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

  toJS(): TypeGroupJS {
    return this.flatten().items.map((item) => (item as Shape).toJS());
  }
}
