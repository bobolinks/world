import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, Mesh, SRGBColorSpace, TextureLoader } from "three";
import { PointsNodeMaterial, attribute, mix, pointUV, positionLocal, spritesheetUV, texture, timerLocal, uniform, vec2 } from "three/examples/jsm/nodes/Nodes";
import { Effect, addEffectClass } from "../three/effect";
import { addEffectNode } from "./effectNode";
import worldGlobal from "../three/worldGlobal";

type Props = {
  maxCount: number;
  texture: string;
  lerpPosition: number;
  intensity: number;
  size: number;
};

export class EffectBurning extends Effect<BufferGeometry, PointsNodeMaterial, Props> {
  public readonly isEffectBurning = true;

  constructor() {
    super(undefined, undefined, { maxCount: 1000, texture: '', lerpPosition: 0, intensity: 0.04, size: 4 });

    (this as any).type = 'EffectBurning';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onPropsChanged(fileds: string[], values: any[]): void {
    const parent = this.parent;
    if (!parent || !(parent instanceof Mesh)) {
      return;
    }

    if (fileds.includes('maxCount')) {
      // rebuild geo
      if (this.geometry) {
        this.geometry.dispose();
        this.geometry = undefined;
      }
      this.build();
    }

    let needsRebuildMaterial = false;
    if (fileds.includes('lerpPosition')) {
      if (this.material) {
        // update material

        const targetPosition = attribute('targetPosition', 'vec3');
        const lerpPosition = uniform(this.props.lerpPosition);
        const positionNode = mix(positionLocal, targetPosition, lerpPosition);

        this.material.positionNode = positionNode;
        this.material.uniformsNeedUpdate = true;
      } else {
        needsRebuildMaterial = true;
      }
    }
    if (fileds.includes('texture')) {
      // rebuild texture
      needsRebuildMaterial = true;
    }
    if (needsRebuildMaterial) {
      if (this.material) {
        this.material.dispose();
        this.material = undefined;
      }
      this.build();
    }
  }

  protected async buildMaterial() {
    if (!this.props.texture) {
      return;
    }

    // nodes
    const targetPosition = attribute('targetPosition', 'vec3');
    const particleSize = attribute('particleSize', 'float');
    const lerpPosition = uniform(this.props.lerpPosition);
    const positionNode = mix(positionLocal, targetPosition, lerpPosition);

    // texture
    const fireMap = await (new TextureLoader()).loadAsync(this.props.texture);
    fireMap.colorSpace = SRGBColorSpace;
    const particleSpeed = attribute('particleSpeed', 'float');
    const particleIntensity = attribute('particleIntensity', 'float');
    const time = timerLocal(1);
    const fireUV = spritesheetUV(
      vec2(6, 6), // count
      pointUV, // uv
      (time as any).mul(particleSpeed) // current frame
    );
    const fireSprite = texture(fireMap, fireUV);
    const fire = (fireSprite as any).mul(particleIntensity);

    // material
    const material = new PointsNodeMaterial({
      depthWrite: false,
      transparent: true,
      sizeAttenuation: true,
      blending: AdditiveBlending
    } as any);

    material.colorNode = fire;
    material.sizeNode = particleSize;
    material.positionNode = positionNode;

    if (this.material) {
      this.material.dispose();
    }
    this.material = material;
  }

  protected buildGeometry() {
    const parent = this.parent;
    if (!parent || !(parent instanceof Mesh)) {
      return;
    }

    const geometry = new BufferGeometry();

    // buffers

    const speed = [];
    const intensity = [];
    const size = [];

    const positionAttribute = worldGlobal.combineBuffer(parent, 'position', this.props.maxCount || 1000);
    const particleCount = positionAttribute.count;

    for (let i = 0; i < particleCount; i++) {
      speed.push(20 + Math.random() * 50);
      intensity.push(Math.random() * this.props.intensity);
      size.push(this.props.size + Math.random() * this.props.size);
    }

    geometry.setAttribute('position', positionAttribute);
    geometry.setAttribute('targetPosition', positionAttribute);
    geometry.setAttribute('particleSpeed', new Float32BufferAttribute(speed, 1));
    geometry.setAttribute('particleIntensity', new Float32BufferAttribute(intensity, 1));
    geometry.setAttribute('particleSize', new Float32BufferAttribute(size, 1));

    if (this.geometry) {
      this.geometry.dispose();
    }
    this.geometry = geometry;
  }

  protected async build(): Promise<void> {
    // build geometry
    if (!this.geometry) {
      this.buildGeometry();
    }

    // rebuild material
    if (!this.material) {
      await this.buildMaterial();
    }

    // mark as Points
    if (this.geometry && this.material) {
      (this as any).isPoints = true;
      // yes, tell renderer we are ready
      this.visible = true;
    }
  }

  toJSON(meta?: any) {
    // skip geometry and material
    const isPoints = (this as any).isPoints;
    delete (this as any).isPoints;
    const json = super.toJSON(meta);
    (this as any).isPoints = isPoints;
    return json;
  }
}

addEffectClass('EffectBurning',
  {
    members: {
      'props.maxCount': 'Number',
      'props.texture': 'Url',
      'props.lerpPosition': 'Number',
      'props.intensity': 'Number',
      'props.size': 'Number',
    },
    proto: 'Effect',
    group: 'Effects.Burning Effect',
    icon: 'fireworks',
    create: () => new EffectBurning(),
  }
);

addEffectNode('Burning', 'Burning Body',
  {
    in: {
      texture: 'Url',
      lerpPosition: 'Number',
      time: 'Number',
      maxCount: 'Number',
    },
  },
  `const effect = world.createEffect('EffectBurning');
effect.props.maxCount = params.maxCount || 1000;
effect.props.lerpPosition = params.lerpPosition;
effect.props.texture = params.texture;
this.add(effect);

// waits
if (params.time) {
  await world.wait(params.time);
  effect.removeFromParent();
}
`);
