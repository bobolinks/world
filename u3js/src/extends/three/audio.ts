import { AudioListener, AudioLoader, PositionalAudio, } from 'three';
import type { Meta } from '../../types/types';
import { addThreeClass } from './utils';
import { objectsTransferred } from '../../clone';

export class AudioListener2 extends AudioListener {
  public readonly isAudioListener2 = true;

  constructor() {
    super();

    (this as any).type = 'AudioListener2';
  }

  toJSON(meta: Meta) {
    const json = super.toJSON(meta);
    const cloned = { ...json.object };
    delete cloned.children;
    meta.listeners[cloned.uuid] = cloned;
    return json;
  }
}

export class PositionalAudio2 extends PositionalAudio {
  public readonly isPositionalAudio2 = true;

  private _src: string = '';

  constructor(listener: AudioListener) {
    super(listener);

    (this as any).type = 'PositionalAudio2';
  }

  get src() {
    return this._src;
  }
  set src(value: string) {
    if (this._src === value) {
      return;
    }

    this._src = value;

    if (this.isPlaying) {
      this.stop();
    }

    (new AudioLoader()).load(value, (buffer: AudioBuffer) => {
      this.setBuffer(buffer);
    });
  }

  play(delay?: number | undefined): this {
    if (this.isPlaying) {
      this.stop();
    }
    return super.play(delay);
  }

  clone(recursive?: boolean | undefined): this {
    const listener = objectsTransferred.get(this.listener);
    return new (this as any).constructor(listener).copy(this, recursive);
  }

  serialize(json: any) {
    json.autoplay = this.autoplay;
    json.loop = this.loop;
    json.src = this._src;
    json.listener = this.listener.uuid;
  }

  deserialize(json: any) {
    this.autoplay = json.autoplay || false;
    this.loop = json.loop || false;
    this.src = json.src;
  }
}

addThreeClass('AudioListener2', {
  create: () => new AudioListener2(),
  proto: 'AudioListener',
  members: {},
  group: 'Audio.Audio Listener',
  icon: 'ear',
});

addThreeClass('PositionalAudio2', {
  create: ({ listener }: any) => new PositionalAudio2(listener),
  proto: 'PositionalAudio',
  members: {
    autoplay: 'Boolean',
    loop: 'Boolean',
    src: 'Audio',
  },
  group: 'Audio.Positional Audio',
  icon: 'audio',
});