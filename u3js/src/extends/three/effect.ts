/* eslint-disable @typescript-eslint/no-unused-vars */
import { BufferGeometry, Material, Object3D, Object3DEventMap } from "three";
import { ClsInfo, PropSet, addThreeClass, getProxyRawObject, objectPathAccessible, propsFromJson, propsToJson } from "./utils";
import { logger } from "../helper/logger";
import worldGlobal from "./worldGlobal";

export class Effect<
  TGeometry extends BufferGeometry = BufferGeometry,
  TMaterial extends Material = Material,
  TGeoParams extends PropSet = PropSet,
  TEventMap extends Object3DEventMap = Object3DEventMap,
> extends Object3D<TEventMap> {
  public readonly isEffect = true;

  public readonly props: TGeoParams;

  constructor(public geometry?: TGeometry, public material?: TMaterial, props?: TGeoParams) {
    super();

    (this as any).type = 'Effect';

    this.props = objectPathAccessible({ ...props }, (p: string, v: any) => {
      this.onPropsChanged([p], [v]);
    });

    this.addEventListener('added', async () => {
      await this.onAttached();
    });
    this.addEventListener('removed', async () => {
      await this.onDetached();
    });
  }

  protected async onAttached() {
    await this.build();
  }

  protected onPropsChanged(fileds: string[], values: any[]) {
    // do nothings
  }

  protected onDetached() {
    if (this.geometry) {
      this.geometry.dispose();
      this.geometry = undefined;
    }
    if (this.material) {
      this.material.dispose();
      this.geometry = undefined;
    }
  }

  protected async build() {
    // do nothings
  }

  dispose() {
    if (this.geometry) {
      this.geometry.dispose();
      this.geometry = undefined;
    }
    if (this.material) {
      this.material.dispose();
      this.geometry = undefined;
    }
  }

  clone(recursive?: boolean | undefined): this {
    const cloned = super.clone(recursive);

    const json = propsToJson(this.props as any);
    const props = (cloned.props as any)[getProxyRawObject];
    propsFromJson(props as any, json);

    return cloned;
  }

  serialize(json: any) {
    json.props = propsToJson(this.props as any);
  }

  deserialize(json: any) {
    if (json.props) {
      const props = (this.props as any)[getProxyRawObject];
      propsFromJson(props as any, json.props);
      this.build();
    }
  }
}

addThreeClass('Effect',
  {
    members: {},
    proto: 'Object3D',
    group: '',
    icon: '',
    create: () => new Effect(),
  }
);

//-------------

export const clsEffects: { [key: string]: ClsInfo } = {};

export function addEffectClass(name: string, info: ClsInfo) {
  if (clsEffects[name]) {
    throw logger.panic(`Class[${name}] aready exists`);
  }
  clsEffects[name] = info;
  return addThreeClass(name, info);
}

export function createEffect(name: string, props?: any[]) {
  const info = clsEffects[name as keyof typeof clsEffects];

  if (!info) {
    throw logger.panic(`Class[${name}] not found!`);
  }

  return info.create(props) as any;
}

(worldGlobal as any).createEffect = createEffect;
