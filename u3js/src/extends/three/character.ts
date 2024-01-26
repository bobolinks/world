import { AnimationAction, AnimationClip, AnimationMixer, CapsuleGeometry, LoopOnce, LoopRepeat, MeshBasicMaterial, Object3DEventMap, Vector3 } from "three";
import { logger } from "../helper/logger";
import { addThreeClass } from "./utils";
import worldGlobal from "./worldGlobal";
import { Model3D } from "./model";

type AnimationActionState = {
  isPending: boolean;
  action: AnimationAction;
  resolve: any;
};

export class Character<
  TGeometry extends CapsuleGeometry = CapsuleGeometry,
  TEventMap extends Object3DEventMap = Object3DEventMap,
> extends Model3D<TGeometry, TEventMap> {
  public isCharacter = true;

  public readonly actions: Record<string, AnimationActionState> = {};

  protected _mixer?: AnimationMixer;
  protected _clips: Array<AnimationClip> = [];
  protected _objectOrgSize = new Vector3();

  constructor(geometry?: TGeometry, material?: MeshBasicMaterial, bodyType = 0, mass = 0) {
    super(geometry || new CapsuleGeometry() as any, material || new MeshBasicMaterial({ wireframe: true, transparent: true }) as any, bodyType, mass);

    (this as any).type = 'Character';
  }

  protected async loadModel() {
    await super.loadModel();

    if (!this._object || !this._modelRoot) {
      return;
    }

    const mesh = this._object.getObjectByProperty('isMesh', true);
    if (mesh) {
      mesh.onBeforeRender = () => {
        if (this._mixer) {
          this._mixer.update(worldGlobal.delta);
        }
      };
    }

    // animations
    this._mixer = new AnimationMixer(this._object);
    this._mixer.addEventListener('finished', ({ action }: { action: AnimationAction }) => {
      const state = Object.entries(this.actions).find(e => e[1].action === action);
      if (state) {
        logger.notice(`action ${state[0]} finished!`);
        state[1].isPending = false;
        if (state[1].resolve) {
          state[1].resolve(true);
          state[1].resolve = undefined;
        }
      }
    });
    this._clips = this._modelRoot.animations || [];
    for (const clip of this._clips) {
      this.actions[clip.name] = { isPending: false, action: this._mixer.clipAction(clip), resolve: undefined };
    }
  }

  async act(name: string, loop?: boolean): Promise<boolean> {
    const state = this.actions[name];
    if (!state) {
      return false;
    } else if (state.isPending) {
      return true;
    }
    state.isPending = true;

    const action = state.action;

    action.clampWhenFinished = true;
    action.reset()
      .setLoop(loop ? LoopRepeat : LoopOnce, loop ? Infinity : 1)
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(1)
      .fadeIn(1.0)
      .play();

    return new Promise((resolve) => {
      state.resolve = resolve;
    });
  }

  stop(name?: string) {
    const names = name ? [name] : Object.keys(this.actions);
    for (const key of names) {
      const state = this.actions[key];
      if (!state) {
        continue;
      } else if (!state.isPending) {
        continue;
      }
      state.isPending = false;
      if (state.resolve) {
        state.resolve(false);
        state.resolve = undefined;
      }
      state.action.stop();
    }
  }
}

addThreeClass('Character', {
  create: ({ material, geometry }: any = {}) => new Character(geometry, material),
  members: {
    'props.radius': 'Number',
    'props.length': 'Number',
    'props.capSegments': 'Number',
    'props.radialSegments': 'Number',
  },
  proto: 'Model3D',
  group: 'Objects.Character',
  icon: 'human',
});
