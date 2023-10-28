import { BufferAttribute, Mesh, Scene, Vector3 } from "three";
import type { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';

export const MaxGPUComputeWidth = 1024;
export const MaxGPUComputeHeight = 1024;
export const MaxGPUComputeCount = MaxGPUComputeWidth * MaxGPUComputeHeight;
const _tmpVec3 = new Vector3();
const _tmpVec31 = new Vector3();

export default {
  /** world time delta */
  delta: 0,
  /** world current time */
  now: 0,
  /** to y axis */
  gravity: new Vector3(0, -9.8, 0),
  windForce: new Vector3(),
  scene: null as any as Scene,
  gpuComputeRender: null as any as GPUComputationRenderer,
  /** wait for x miliseconds */
  wait(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms, true);
    });
  },
  random(start: number, end: number) {
    return start + Math.floor(Math.random() * (end - start + 1));
  },
  randomChoice(obj: any[]): any {
    if (Array.isArray(obj)) {
      const i = Math.floor(Math.random() * obj.length);
      return obj[i];
    } else {
      const list = Object.keys(obj);
      const key = Math.floor(Math.random() * list.length);
      return obj[key];
    }
  },
  calcObjectPosition(position: Vector3, velocity: Vector3, mass: number, airResCoe: number): [Vector3 /** pos */, Vector3 /** vel */] {
    if (mass <= 0) {
      return [position, velocity];
    }
    // cale resForce
    const force = airResCoe ? _tmpVec3.copy(velocity).normalize().multiply(velocity).multiply(velocity).multiplyScalar(-airResCoe) : _tmpVec3.set(0, 0, 0);
    // mix windForce
    force.add(this.windForce);
    // F＝ma
    const acceleration = force.divideScalar(mass);
    // mix grivity
    acceleration.add(this.gravity);
    // v = v0 + (a * t)
    const vel = acceleration.multiplyScalar(this.delta).add(velocity);
    // dist, s = v1t + at^2/2
    // const dist = acceleration.multiplyScalar(this.delta * this.delta).multiplyScalar(0.5).add(_tmpVec31.copy(velocity).multiplyScalar(this.delta));
    const dist = _tmpVec31.copy(vel).add(velocity).multiplyScalar(0.5 * this.delta);
    // add org position
    return [dist.add(position), _tmpVec3];
  },
  combineBuffer(mesh: Mesh, name: string, maxCount?: number) {
    let count = 0;
    let itemSize = 3;

    mesh.traverse(function (child: Mesh) {
      if (child.isMesh) {
        const buffer = child.geometry.attributes[name];
        itemSize = buffer.itemSize;
        count += buffer.array.length;
      }
    } as any);

    const itemCount = count / itemSize;
    const step = maxCount ? (itemCount > maxCount ? Math.ceil(itemCount / maxCount) : 1) : 1;

    const realItemCount = Math.ceil(count / (itemSize * step));

    const combined = new Float32Array(realItemCount * itemSize);

    let valueOffset = 0;
    let itemOffset = 0;
    let itemEaten = 0;
    mesh.traverse(function (child: Mesh) {
      if (child.isMesh) {
        const buffer = child.geometry.attributes[name];
        if (step === 1) {
          combined.set(buffer.array, itemEaten * itemSize);
          valueOffset += buffer.array.length;
          itemEaten += buffer.array.length / itemSize;
          itemOffset = valueOffset / itemSize;
        } else {
          const bufItemCount = buffer.count;
          for (let i = 0; i < bufItemCount; i++) {
            if ((itemOffset % step) === 0) {
              combined[itemEaten * itemSize] = buffer.array[i * itemSize];
              combined[itemEaten * itemSize + 1] = buffer.array[i * itemSize + 1];
              combined[itemEaten * itemSize + 2] = buffer.array[i * itemSize + 2];
              itemEaten++;
            }
            itemOffset++;
          }
          valueOffset += buffer.array.length;
        }
      }
    } as any);

    return new BufferAttribute(combined, itemSize);
  }
};