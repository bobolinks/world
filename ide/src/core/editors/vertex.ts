/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BufferGeometry, DoubleSide, EventDispatcher, Float32BufferAttribute,
  Line, Line3, LineBasicMaterial, MathUtils, Matrix4, Mesh, MeshBasicMaterial,
  Ray, Uint16BufferAttribute, Vector2, Vector3, Vector4, WebGLRenderer
} from "three";
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { CONTAINED, INTERSECTED, MeshBVH, NOT_INTERSECTED } from "three-mesh-bvh";
import type { HistoryManager } from "u3js/src/types/types";
import { SceneEditorEventMap } from "./event";
import { GeometryEditor } from "./geometry";

const tempVec0 = new Vector2();
const tempVec1 = new Vector2();
const tempVec2 = new Vector2();

const invWorldMatrix = new Matrix4();
const camLocalPosition = new Vector3();
const tempRay = new Ray();
const centroid = new Vector3();
const screenCentroid = new Vector3();
const faceNormal = new Vector3();
const toScreenSpaceMatrix = new Matrix4();
const boxPoints: Array<Vector4> = new Array(8).fill(null).map(() => new Vector4());
const boxLines = new Array(12).fill(null).map(() => new Line3());
const lassoSegments: any[] = [];
const perBoundsSegments: any[] = [];

export class VertexEditor extends GeometryEditor {
  private selectionShape: Line;
  private highlightMesh: Mesh<BufferGeometry, MeshBasicMaterial>;

  public toolMode: 'box' | 'lasso' = 'lasso';
  private selectionMode: 'centroid' | 'centroid-visible' | 'intersection' = 'intersection';
  private liveUpdate = false;
  private rotate = false;
  private useBoundsTree = false;
  private selectModel = false;
  private selectionShapeNeedsUpdate = false;
  private selectionNeedsUpdate = false;
  private selectionPoints: Array<number> = [];

  constructor(
    public readonly renderer: WebGLRenderer,
    public readonly size: { width: number; height: number },
    public readonly history: HistoryManager,
    public readonly dispatcher: EventDispatcher<SceneEditorEventMap>
  ) {
    super(renderer, size, history, dispatcher);

    // selection shape
    const selectionShape = new Line<BufferGeometry, LineBasicMaterial>();
    selectionShape.material.color.set(0xff9800).convertSRGBToLinear();
    selectionShape.material.depthTest = false;
    selectionShape.renderOrder = 1;
    selectionShape.position.z = - .2;
    selectionShape.scale.setScalar(1);

    this.selectionShape = selectionShape;
    this.camera.add(selectionShape);

    // meshes for selection highlights
    const highlightMesh = new Mesh<BufferGeometry, MeshBasicMaterial>();
    highlightMesh.geometry = this.mesh.geometry.clone();
    highlightMesh.geometry.drawRange.count = 0;
    highlightMesh.material = new MeshBasicMaterial({
      opacity: 0.05,
      transparent: true,
      depthWrite: false,
    });
    highlightMesh.material.color.set(0xff9800).convertSRGBToLinear();
    highlightMesh.renderOrder = 1;
    this.highlightMesh = highlightMesh;
    this.group.add(highlightMesh);
  }

  set object(m: Mesh) {
    super.object = m;

    this.highlightMesh.geometry.dispose();
    this.highlightMesh.geometry = this.mesh.geometry.clone();
  }

  render(delta: number, now: number) {
    // Update the selection lasso lines
    if (this.selectionShapeNeedsUpdate) {
      if (this.toolMode === 'lasso') {
        const ogLength = this.selectionPoints.length;
        this.selectionPoints.push(
          this.selectionPoints[0],
          this.selectionPoints[1],
          this.selectionPoints[2]
        );

        this.selectionShape.geometry.setAttribute(
          'position',
          new Float32BufferAttribute(this.selectionPoints, 3, false)
        );
        this.selectionPoints.length = ogLength;
      } else {
        this.selectionShape.geometry.setAttribute(
          'position',
          new Float32BufferAttribute(this.selectionPoints, 3, false)
        );
      }

      this.selectionShape.frustumCulled = false;
      this.selectionShapeNeedsUpdate = false;
    }

    if (this.selectionNeedsUpdate) {
      this.selectionNeedsUpdate = false;
      if (this.selectionPoints.length > 0) {
        this.updateSelection();
      }
    }

    const yScale = Math.tan(MathUtils.DEG2RAD * this.camera.fov / 2) * this.selectionShape.position.z;
    this.selectionShape.scale.set(- yScale * this.camera.aspect, - yScale, 1);

    this.renderer.render(this, this.camera);

    if (this.rotate) {
      this.group.rotation.y += 0.01;
      if (this.liveUpdate && this.dragging) {
        this.selectionNeedsUpdate = true;
      }
    }
  }

  protected onTargetMove(delta: Vector3) {
    if (!this.controls.object) {
      return;
    }
    const invert = delta.clone().multiplyScalar(-1);
    const index: Uint16BufferAttribute = this.highlightMesh.geometry.index!.clone();
    const count = this.highlightMesh.geometry.drawRange.count;
    // update target's geometry
    this.moveSelectedPoints(delta);
    this.dispatcher.dispatchEvent({ type: 'objectModified', soure: this, objects: [this.controls.object] });
    this.history.push({
      tip: 'Object changed!',
      undo: () => {
        this.highlightMesh.geometry.index = index;
        this.highlightMesh.geometry.drawRange.count = count;
        this.moveSelectedPoints(invert);
      },
      redo: () => {
        this.highlightMesh.geometry.index = index;
        this.highlightMesh.geometry.drawRange.count = count;
        this.moveSelectedPoints(delta);
      },
    });
  }

  protected onPointerDown(e: PointerEvent) {
    if (!super.onPointerDown(e)) {
      return false;
    } else if (this.transforming) {
      return true;
    }
    this.selectionPoints.length = 0;
    return true;
  }
  protected onPointerUp(e: PointerEvent) {
    if (!super.onPointerUp(e)) {
      return false;
    } else if (!this.dragging && this.selectionShape.visible) {
      this.selectionShape.visible = false;
      if (this.selectionPoints.length) {
        this.selectionNeedsUpdate = true;
      }
    }
    return true;
  }
  protected onPointerMove(e: PointerEvent) {
    if (!this._actived || this.transforming) {
      return;
    }
    // If the left mouse button is not pressed
    if ((1 & e.buttons) === 0) {
      return;
    }

    const { left, top, width, height } = this.renderer.domElement.getBoundingClientRect();
    const ex = e.clientX;
    const ey = e.clientY;
    const nx = ((e.clientX - left) / width) * 2 - 1;
    const ny = - (((e.clientY - top) / height) * 2 - 1);

    if (this.toolMode === 'box') {
      // set points for the corner of the box
      this.selectionPoints.length = 3 * 5;

      this.selectionPoints[0] = this.startPoint.x;
      this.selectionPoints[1] = this.startPoint.y;
      this.selectionPoints[2] = 0;

      this.selectionPoints[3] = nx;
      this.selectionPoints[4] = this.startPoint.y;
      this.selectionPoints[5] = 0;

      this.selectionPoints[6] = nx;
      this.selectionPoints[7] = ny;
      this.selectionPoints[8] = 0;

      this.selectionPoints[9] = this.startPoint.x;
      this.selectionPoints[10] = ny;
      this.selectionPoints[11] = 0;

      this.selectionPoints[12] = this.startPoint.x;
      this.selectionPoints[13] = this.startPoint.y;
      this.selectionPoints[14] = 0;

      if (ex !== this.prevPoint.x || ey !== this.prevPoint.y) {
        this.selectionShapeNeedsUpdate = true;
      }

      this.prevPoint.x = ex;
      this.prevPoint.y = ey;
      this.selectionShape.visible = true;
      if (this.liveUpdate) {
        this.selectionNeedsUpdate = true;
      }

    } else {
      // If the mouse hasn't moved a lot since the last point
      if (
        Math.abs(ex - this.prevPoint.x) >= 3 ||
        Math.abs(ey - this.prevPoint.y) >= 3
      ) {
        // Check if the mouse moved in roughly the same direction as the previous point
        // and replace it if so.
        const i = (this.selectionPoints.length / 3) - 1;
        const i3 = i * 3;
        let doReplace = false;
        if (this.selectionPoints.length > 3) {

          // prev segment direction
          tempVec0.set(this.selectionPoints[i3 - 3], this.selectionPoints[i3 - 3 + 1]);
          tempVec1.set(this.selectionPoints[i3], this.selectionPoints[i3 + 1]);
          tempVec1.sub(tempVec0).normalize();

          // this segment direction
          tempVec0.set(this.selectionPoints[i3], this.selectionPoints[i3 + 1]);
          tempVec2.set(nx, ny);
          tempVec2.sub(tempVec0).normalize();

          const dot = tempVec1.dot(tempVec2);
          doReplace = dot > 0.99;

        }

        if (doReplace) {
          this.selectionPoints[i3] = nx;
          this.selectionPoints[i3 + 1] = ny;
        } else {
          this.selectionPoints.push(nx, ny, 0);
        }

        this.selectionShapeNeedsUpdate = true;
        this.selectionShape.visible = true;

        this.prevPoint.x = ex;
        this.prevPoint.y = ey;

        if (this.liveUpdate) {
          this.selectionNeedsUpdate = true;
        }
      }
    }
  }

  private moveSelectedPoints(delta: Vector3) {
    const meshPosition = this.mesh.geometry.attributes.position;
    const selPosition = this.highlightMesh.geometry.attributes.position;
    const index: Uint16BufferAttribute = this.highlightMesh.geometry.index as any;
    const set = new Set();
    const dc = this.highlightMesh.geometry.drawRange.count;
    const count = dc === Infinity ? index.count : dc;

    for (let i = 0; i < count; i++) {
      const idx = index.getX(i);
      if (set.has(idx)) {
        continue;
      }
      set.add(idx);
      const x = meshPosition.getX(idx);
      const y = meshPosition.getY(idx);
      const z = meshPosition.getZ(idx);
      meshPosition.setXYZ(idx, x + delta.x, y + delta.y, z + delta.z);
      selPosition.setXYZ(idx, x + delta.x, y + delta.y, z + delta.z);
    }
    meshPosition.needsUpdate = true;
    selPosition.needsUpdate = true;
  }

  removeSelectedPoints(ignoreEvent?: boolean) {
    const indexSelected: Uint16BufferAttribute = this.highlightMesh.geometry.index as any;
    const dc = this.highlightMesh.geometry.drawRange.count;
    const count = dc === Infinity ? indexSelected.count : dc;

    if (!count) {
      return;
    }

    const positionsSelected = new Set();

    for (let i = 0; i < count; i++) {
      const idx = indexSelected.getX(i);
      positionsSelected.add(idx);
    }

    const index: Uint16BufferAttribute = this.mesh.geometry.index as any;
    const idxCount = index.count;
    const newIdx: number[] = [];
    for (let i = 0; i < idxCount; i += 3) {
      const idx = index.getX(i);
      const idx1 = index.getX(i + 1);
      const idx2 = index.getX(i + 2);
      if (positionsSelected.has(idx) && positionsSelected.has(idx1) && positionsSelected.has(idx2)) {
        continue;
      }
      newIdx.push(idx, idx1, idx2);
    }

    const oldIndex = this.mesh.geometry.index;
    const newIndex = new Uint16BufferAttribute(newIdx, 1, false);
    const ver = oldIndex!.version + 1;
    this.mesh.geometry.index = newIndex;
    this.mesh.geometry.index.needsUpdate = true;
    this.mesh.geometry.index.version = ver;

    if (this.selectionPoints.length) {
      this.selectionShape.visible = false;
      this.selectionNeedsUpdate = true;
      this.selectionPoints.length = 0;
    }

    const drawRangeCount = this.highlightMesh.geometry.drawRange.count;
    this.highlightMesh.geometry.drawRange.count = 0;

    if (!ignoreEvent) {
      this.dispatcher.dispatchEvent({ type: 'objectModified', soure: this, objects: [this.mesh] });
      this.history.push({
        tip: 'Points removed!',
        undo: () => {
          oldIndex!.needsUpdate = true;
          oldIndex!.version++;
          this.mesh.geometry.index = oldIndex;
          this.highlightMesh.geometry.drawRange.count = drawRangeCount;
          this.dispatcher.dispatchEvent({ type: 'objectModified', soure: this, objects: [this.mesh] });
        },
        redo: () => {
          newIndex!.needsUpdate = true;
          newIndex!.version++;
          this.mesh.geometry.index = newIndex;
          this.highlightMesh.geometry.drawRange.count = 0;
          this.dispatcher.dispatchEvent({ type: 'objectModified', soure: this, objects: [this.mesh] });
        },
      });
    }
  }

  replaceGeometry(geometry: BufferGeometry) {
    if (!this._object) {
      return;
    }

    const oldGeo = this.mesh.geometry;
    const drawRangeCount = this.highlightMesh.geometry.drawRange.count;
    const oldHighlightGeo = this.highlightMesh.geometry;
    this.highlightMesh.geometry.drawRange.count = 0;

    if (!geometry.index) {
      geometry = mergeVertices(geometry);
    }

    if (!this.mesh.geometry.boundsTree) {
      this.mesh.geometry.boundsTree = new MeshBVH(this.mesh.geometry);
    }

    const newHighlightGeo = geometry.clone();

    this.mesh.geometry.dispose();
    this.mesh.geometry = geometry;
    this.highlightMesh.geometry.dispose();
    this.highlightMesh.geometry = newHighlightGeo;
    this._object.geometry = geometry;

    if (this.selectionPoints.length) {
      this.selectionShape.visible = false;
      this.selectionNeedsUpdate = true;
      this.selectionPoints.length = 0;
    }

    const undo = () => {
      this.mesh.geometry.dispose();
      this.mesh.geometry = oldGeo;
      this.highlightMesh.geometry.dispose();
      this.highlightMesh.geometry = oldHighlightGeo;
      this.highlightMesh.geometry.drawRange.count = drawRangeCount;
      this._object!.geometry = oldGeo;
      this.dispatcher.dispatchEvent({ type: 'objectModified', soure: this, objects: [this.mesh] });
    };
    const redo = () => {
      this.mesh.geometry.dispose();
      this.mesh.geometry = geometry;
      this.highlightMesh.geometry.dispose();
      this.highlightMesh.geometry = newHighlightGeo;
      this.highlightMesh.geometry.drawRange.count = 0;
      this._object!.geometry = geometry;
      this.dispatcher.dispatchEvent({ type: 'objectModified', soure: this, objects: [this.mesh] });
    };
    this.dispatcher.dispatchEvent({ type: 'objectModified', soure: this, objects: [this.mesh] });
    this.history.push({
      tip: 'Geo Replaced!',
      undo,
      redo,
    });
  }

  updateSelection() {
    // TODO: Possible improvements
    // - Correctly handle the camera near clip
    // - Improve line line intersect performance?

    toScreenSpaceMatrix
      .copy(this.mesh.matrixWorld)
      .premultiply(this.camera.matrixWorldInverse)
      .premultiply(this.camera.projectionMatrix);

    // create scratch points and lines to use for selection
    while (lassoSegments.length < this.selectionPoints.length) {

      lassoSegments.push(new Line3());

    }

    lassoSegments.length = this.selectionPoints.length;

    for (let s = 0, l = this.selectionPoints.length; s < l; s += 3) {
      const line = lassoSegments[s];
      const sNext = (s + 3) % l;
      line.start.x = this.selectionPoints[s];
      line.start.y = this.selectionPoints[s + 1];

      line.end.x = this.selectionPoints[sNext];
      line.end.y = this.selectionPoints[sNext + 1];
    }

    invWorldMatrix.copy(this.mesh.matrixWorld).invert();
    camLocalPosition.set(0, 0, 0).applyMatrix4(this.camera.matrixWorld).applyMatrix4(invWorldMatrix);

    const indices: number[] = [];
    this.mesh.geometry.boundsTree!.shapecast({
      intersectsBounds: (box, isLeaf, score, depth) => {

        // check if bounds intersect or contain the lasso region
        if (!this.useBoundsTree) {
          return INTERSECTED;
        }

        // Get the bounding box points
        const { min, max } = box;
        let index = 0;

        let minY = Infinity;
        let maxY = - Infinity;
        let minX = Infinity;
        for (let x = 0; x <= 1; x++) {
          for (let y = 0; y <= 1; y++) {
            for (let z = 0; z <= 1; z++) {
              const v = boxPoints[index];
              v.x = x === 0 ? min.x : max.x;
              v.y = y === 0 ? min.y : max.y;
              v.z = z === 0 ? min.z : max.z;
              v.w = 1;
              v.applyMatrix4(toScreenSpaceMatrix);
              index++;

              if (v.y < minY) minY = v.y;
              if (v.y > maxY) maxY = v.y;
              if (v.x < minX) minX = v.x;
            }
          }
        }

        // Find all the relevant segments here and cache them in the above array for
        // subsequent child checks to use.
        const parentSegments = perBoundsSegments[depth - 1] || lassoSegments;
        const segmentsToCheck = perBoundsSegments[depth] || [];
        segmentsToCheck.length = 0;
        perBoundsSegments[depth] = segmentsToCheck;
        for (let i = 0, l = parentSegments.length; i < l; i++) {

          const line = parentSegments[i];
          const sx = line.start.x;
          const sy = line.start.y;
          const ex = line.end.x;
          const ey = line.end.y;
          if (sx < minX && ex < minX) continue;

          const startAbove = sy > maxY;
          const endAbove = ey > maxY;
          if (startAbove && endAbove) continue;

          const startBelow = sy < minY;
          const endBelow = ey < minY;
          if (startBelow && endBelow) continue;
          segmentsToCheck.push(line);
        }

        if (segmentsToCheck.length === 0) {
          return NOT_INTERSECTED;
        }

        // Get the screen space hull lines
        const hull = this.getConvexHull(boxPoints);
        const lines = hull.map((p, i) => {
          const nextP = hull[(i + 1) % hull.length];
          const line = boxLines[i];
          line.start.copy(p);
          line.end.copy(nextP);
          return line;
        });

        // If a lasso point is inside the hull then it's intersected and cannot be contained
        if (this.pointRayCrossesSegments(segmentsToCheck[0].start, lines) % 2 === 1) {
          return INTERSECTED;
        }

        // check if the screen space hull is in the lasso
        let crossings = 0;
        for (let i = 0, l = hull.length; i < l; i++) {
          const v = hull[i];
          const pCrossings = this.pointRayCrossesSegments(v, segmentsToCheck);

          if (i === 0) {
            crossings = pCrossings;
          }

          // if two points on the hull have different amounts of crossings then
          // it can only be intersected
          if (crossings !== pCrossings) {
            return INTERSECTED;
          }
        }

        // check if there are any intersections
        for (let i = 0, l = lines.length; i < l; i++) {
          const boxLine = lines[i];
          for (let s = 0, ls = segmentsToCheck.length; s < ls; s++) {
            if (this.lineCrossesLine(boxLine, segmentsToCheck[s])) {
              return INTERSECTED;
            }
          }
        }
        return crossings % 2 === 0 ? NOT_INTERSECTED : CONTAINED;
      },

      intersectsTriangle: (tri, index, contained, depth) => {

        const i3 = index * 3;
        const a = i3 + 0;
        const b = i3 + 1;
        const c = i3 + 2;

        // check all the segments if using no bounds tree
        const segmentsToCheck = this.useBoundsTree ? perBoundsSegments[depth] : lassoSegments;
        if (this.selectionMode === 'centroid' || this.selectionMode === 'centroid-visible') {

          // get the center of the triangle
          centroid.copy(tri.a).add(tri.b).add(tri.c).multiplyScalar(1 / 3);
          screenCentroid.copy(centroid).applyMatrix4(toScreenSpaceMatrix);

          // counting the crossings
          if (
            contained ||
            this.pointRayCrossesSegments(screenCentroid, segmentsToCheck) % 2 === 1
          ) {

            // if we're only selecting visible faces then perform a ray check to ensure the centroid
            // is visible.
            if (this.selectionMode === 'centroid-visible') {
              tri.getNormal(faceNormal);
              tempRay.origin.copy(centroid).addScaledVector(faceNormal, 1e-6);
              tempRay.direction.subVectors(camLocalPosition, centroid);

              const res = this.mesh.geometry.boundsTree!.raycastFirst(tempRay, DoubleSide);
              if (res) {
                return false;
              }
            }

            indices.push(a, b, c);
            return this.selectModel;
          }

        } else if (this.selectionMode === 'intersection') {
          // if the parent bounds were marked as contained then we contain all the triangles within
          if (contained) {
            indices.push(a, b, c);
            return this.selectModel;
          }

          // get the projected vertices
          const vertices = [
            tri.a,
            tri.b,
            tri.c,
          ];

          // check if any of the vertices are inside the selection and if so then the triangle is selected
          for (let j = 0; j < 3; j++) {
            const v = vertices[j];
            v.applyMatrix4(toScreenSpaceMatrix);
            const crossings = this.pointRayCrossesSegments(v, segmentsToCheck);
            if (crossings % 2 === 1) {
              indices.push(a, b, c);
              return this.selectModel;
            }
          }

          // get the lines for the triangle
          const lines = [
            boxLines[0],
            boxLines[1],
            boxLines[2],
          ];

          lines[0].start.copy(tri.a);
          lines[0].end.copy(tri.b);

          lines[1].start.copy(tri.b);
          lines[1].end.copy(tri.c);

          lines[2].start.copy(tri.c);
          lines[2].end.copy(tri.a);

          // check for the case where a selection intersects a triangle but does not contain any
          // of the vertices
          for (let i = 0; i < 3; i++) {
            const l = lines[i];
            for (let s = 0, sl = segmentsToCheck.length; s < sl; s++) {
              if (this.lineCrossesLine(l, segmentsToCheck[s])) {
                indices.push(a, b, c);
                return this.selectModel;
              }
            }
          }
        }

        return false;
      }
    });

    const position: Float32BufferAttribute = this.mesh.geometry.attributes.position as any;
    const indexAttr: Float32BufferAttribute = this.mesh.geometry.index as any;
    const newIndexAttr: Float32BufferAttribute = this.highlightMesh.geometry.index as any;
    if (indices.length && this.selectModel) {
      // if we found indices and we want to select the whole model
      for (let i = 0, l = indexAttr.count; i < l; i++) {
        const i2 = indexAttr.getX(i);
        newIndexAttr.setX(i, i2);
      }

      this.highlightMesh.geometry.drawRange.count = Infinity;
      newIndexAttr.needsUpdate = true;

      if (this._target) {
        this._target.position.set(0, 0, 0);
      }
    } else {
      let x = 0, y = 0, z = 0;
      // update the highlight mesh
      for (let i = 0, l = indices.length; i < l; i++) {
        const i2 = indexAttr.getX(indices[i]);
        newIndexAttr.setX(i, i2);

        if (this._target) {
          const xx = position.getX(i2);
          const yy = position.getY(i2);
          const zz = position.getZ(i2);
          x += xx;
          y += yy;
          z += zz;
        }
      }

      // calc center of selected points
      if (this._target) {
        const c = indices.length;
        x /= c;
        y /= c;
        z /= c;
        this._target.position.set(x, y, z);
      }

      this.highlightMesh.geometry.drawRange.count = indices.length;
      newIndexAttr.needsUpdate = true;
    }
  }

  // Math Functions
  // https://www.geeksforgeeks.org/convex-hull-set-2-graham-scan/
  getConvexHull(points: any[]) {
    function orientation(p: Vector3, q: Vector3, r: Vector3) {
      const val =
        (q.y - p.y) * (r.x - q.x) -
        (q.x - p.x) * (r.y - q.y);

      if (val == 0) {
        return 0; // colinear
      }

      // clockwise or counterclockwise
      return (val > 0) ? 1 : 2;
    }

    function distSq(p1: Vector3, p2: Vector3) {
      return (p1.x - p2.x) * (p1.x - p2.x) +
        (p1.y - p2.y) * (p1.y - p2.y);
    }

    function compare(p1: Vector3, p2: Vector3) {
      // Find orientation
      const o = orientation(p0, p1, p2);
      if (o == 0)
        return (distSq(p0, p2) >= distSq(p0, p1)) ? - 1 : 1;

      return (o == 2) ? - 1 : 1;
    }

    // find the lowest point in 2d
    let lowestY = Infinity;
    let lowestIndex = - 1;
    for (let i = 0, l = points.length; i < l; i++) {
      const p = points[i];
      if (p.y < lowestY) {
        lowestIndex = i;
        lowestY = p.y;
      }
    }

    // sort the points
    const p0 = points[lowestIndex];
    points[lowestIndex] = points[0];
    points[0] = p0;

    points = points.sort(compare);

    // filter the points
    let m = 1;
    const n = points.length;
    for (let i = 1; i < n; i++) {
      while (i < n - 1 && orientation(p0, points[i], points[i + 1]) == 0) {
        i++;
      }

      points[m] = points[i];
      m++;
    }

    // early out if we don't have enough points for a hull
    if (m < 3) return [];

    // generate the hull
    const hull = [points[0], points[1], points[2]];
    for (let i = 3; i < m; i++) {
      while (orientation(hull[hull.length - 2], hull[hull.length - 1], points[i]) !== 2) {
        hull.pop();
      }
      hull.push(points[i]);
    }
    return hull;
  }

  pointRayCrossesLine(point: any, line: any, prevDirection: any, thisDirection: any) {

    const { start, end } = line;
    const px = point.x;
    const py = point.y;

    const sy = start.y;
    const ey = end.y;

    if (sy === ey) return false;

    if (py > sy && py > ey) return false; // above
    if (py < sy && py < ey) return false; // below

    const sx = start.x;
    const ex = end.x;
    if (px > sx && px > ex) return false; // right
    if (px < sx && px < ex) { // left
      if (py === sy && prevDirection !== thisDirection) {
        return false;
      }
      return true;
    }

    // check the side
    const dx = ex - sx;
    const dy = ey - sy;
    const perpx = dy;
    const perpy = - dx;

    const pdx = px - sx;
    const pdy = py - sy;

    const dot = perpx * pdx + perpy * pdy;

    if (Math.sign(dot) !== Math.sign(perpx)) {
      return true;
    }
    return false;
  }

  pointRayCrossesSegments(point: any, segments: any) {
    let crossings = 0;
    const firstSeg = segments[segments.length - 1];
    let prevDirection = firstSeg.start.y > firstSeg.end.y;
    for (let s = 0, l = segments.length; s < l; s++) {
      const line = segments[s];
      const thisDirection = line.start.y > line.end.y;
      if (this.pointRayCrossesLine(point, line, prevDirection, thisDirection)) {
        crossings++;
      }
      prevDirection = thisDirection;
    }

    return crossings;
  }

  // https://stackoverflow.com/questions/3838329/how-can-i-check-if-two-segments-intersect
  lineCrossesLine(l1: any, l2: any) {
    function ccw(A: Vector3, B: Vector3, C: Vector3) {
      return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    }

    const A = l1.start;
    const B = l1.end;

    const C = l2.start;
    const D = l2.end;

    return ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);
  }
}
