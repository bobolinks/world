import {
  Camera,
  Color,
  Matrix4,
  PlaneGeometry,
  RepeatWrapping,
  ShaderMaterial,
  Texture,
  UniformsLib,
  UniformsUtils,
  Vector2,
  Vector4
} from 'three';
import { Refractor } from 'three/examples/jsm//objects/Refractor.js';
import type { Water2Options } from 'three/examples/jsm//objects/Water2.js';
import { getProxyRawObject, propsFromJson, propsToJson } from './utils';
import worldGlobal from './worldGlobal';
import { Entity } from './entity';
import { Reflector } from './reflector';

const cycle = 0.15; // a cycle of a flow map phase
const halfCycle = cycle * 0.5;

export class WaterPlane extends Entity<PlaneGeometry, ShaderMaterial> {
  public readonly isWaterPlane = true;

  public readonly props1: Required<Water2Options> = {
    color: new Color(),
    textureWidth: 512,
    textureHeight: 512,
    clipBias: 0,
    flowDirection: new Vector2(1, 0),
    flowSpeed: 0.03,
    reflectivity: 0.02,
    scale: 1,
  } as any;

  private textureMatrix = new Matrix4();
  private reflector: Reflector;
  private refractor: Refractor;
  private refractorClipBias: number;

  constructor(geometry?: PlaneGeometry, material?: ShaderMaterial) {
    super(geometry || new PlaneGeometry(10, 10), material || new ShaderMaterial({
      uniforms: UniformsUtils.merge([
        UniformsLib['fog'],
        WaterPlane.WaterShader.uniforms
      ]),
      vertexShader: WaterPlane.WaterShader.vertexShader,
      fragmentShader: WaterPlane.WaterShader.fragmentShader,
      transparent: true,
      fog: true
    }), 0, 0);

    (this as any).type = 'WaterPlane';

    if (!geometry) {
      this.rotation.x = -Math.PI / 2;
    }

    // internal components

    const reflector = new Reflector(geometry);
    reflector.textureWidth = this.props1.textureWidth;
    reflector.textureHeight = this.props1.textureHeight;
    reflector.clipBias = this.props1.clipBias;

    const refractor = new Refractor(geometry, {
      textureWidth: this.props1.textureWidth,
      textureHeight: this.props1.textureHeight,
      clipBias: 0,
    });
    this.refractorClipBias = refractor.camera.projectionMatrix.elements[10];
    // refractor.camera.projectionMatrix.elements[10] = this.refractorClipBias + this.props1.clipBias;

    reflector.matrixAutoUpdate = false;
    refractor.matrixAutoUpdate = false;

    this.reflector = reflector;
    this.refractor = refractor;

    // material
    if (!material) {
      // keep flowMap and set to undefined
      const flowMap: any = undefined;
      if (flowMap !== undefined) {
        this.material.defines.USE_FLOWMAP = '';
        this.material.uniforms['tFlowMap'] = {
          type: 't',
          value: flowMap,
        } as any;
      } else {
        this.material.uniforms['flowDirection'] = {
          type: 'v2',
          value: this.props1.flowDirection,
        } as any;
      }

      // maps
      const normalMap0 = new Texture();
      const normalMap1 = new Texture();

      normalMap0.wrapS = normalMap0.wrapT = RepeatWrapping;
      normalMap1.wrapS = normalMap1.wrapT = RepeatWrapping;

      this.material.uniforms['tReflectionMap'].value = reflector.getRenderTarget().texture;
      this.material.uniforms['tRefractionMap'].value = refractor.getRenderTarget().texture;
      this.material.uniforms['tNormalMap0'].value = normalMap0;
      this.material.uniforms['tNormalMap1'].value = normalMap1;

      // water

      this.material.uniforms['color'].value = this.props1.color;
      this.material.uniforms['reflectivity'].value = this.props1.reflectivity;
      this.material.uniforms['textureMatrix'].value = this.textureMatrix;

      // inital values

      this.material.uniforms['config'].value.x = 0; // flowMapOffset0
      this.material.uniforms['config'].value.y = halfCycle; // flowMapOffset1
      this.material.uniforms['config'].value.z = halfCycle; // halfCycle
      this.material.uniforms['config'].value.w = this.props1.scale; // scale
    } else {
      this.material.uniforms['tReflectionMap'].value = reflector.getRenderTarget().texture;
      this.material.uniforms['tRefractionMap'].value = refractor.getRenderTarget().texture;

      this.props1.flowDirection = this.material.uniforms['flowDirection'].value;
      this.props1.color = this.material.uniforms['color'].value;
      this.props1.reflectivity = this.material.uniforms['reflectivity'].value;
      this.textureMatrix = this.material.uniforms['textureMatrix'].value;
      this.props1.scale = this.material.uniforms['config'].value.w;
    }

    this.onBeforeRender = function (renderer, scene, camera) {

      this.updateTextureMatrix(camera);
      this.updateFlow();

      this.visible = false;

      reflector.matrixWorld.copy(this.matrixWorld);
      refractor.matrixWorld.copy(this.matrixWorld);

      reflector.onBeforeRender(renderer, scene, camera, null as any, null as any, null as any);
      refractor.onBeforeRender(renderer, scene, camera, null as any, null as any, null as any);

      this.visible = true;
    };
  }

  get normalMap0() {
    return this.material.uniforms['tNormalMap0'].value;
  }
  set normalMap0(val: Texture) {
    const old = this.material.uniforms['tNormalMap0'].value;
    if (old === val) {
      return;
    }
    this.material.uniforms['tNormalMap0'].value = val;
    old.dispose();
  }

  get normalMap1() {
    return this.material.uniforms['tNormalMap1'].value;
  }
  set normalMap1(val: Texture) {
    const old = this.material.uniforms['tNormalMap1'].value;
    if (old === val) {
      return;
    }
    this.material.uniforms['tNormalMap1'].value = val;
    old.dispose();
  }

  get color(): Color {
    return this.props1.color as any;
  }
  set color(val: Color) {
    this.props1.color = val;
    this.material.uniforms['color'].value = val;
  }

  get textureWidth() {
    return this.props1.textureWidth;
  }
  set textureWidth(val: number) {
    if (this.props1.textureWidth === val) {
      return;
    }
    this.props1.textureWidth = val;
    this.reflector.getRenderTarget().setSize(this.props1.textureWidth, this.props1.textureHeight);
    this.refractor.getRenderTarget().setSize(this.props1.textureWidth, this.props1.textureHeight);
  }

  get textureHeight() {
    return this.props1.textureHeight;
  }
  set textureHeight(val: number) {
    if (this.props1.textureHeight === val) {
      return;
    }
    this.props1.textureHeight = val;
    this.reflector.getRenderTarget().setSize(this.props1.textureWidth, this.props1.textureHeight);
    this.refractor.getRenderTarget().setSize(this.props1.textureWidth, this.props1.textureHeight);
  }

  get clipBias() {
    return this.props1.clipBias;
  }
  set clipBias(val: number) {
    if (this.props1.clipBias === val) {
      return;
    }
    this.props1.clipBias = val;
    this.reflector.clipBias = val;
  }

  get flowDirection() {
    return this.props1.flowDirection;
  }
  set flowDirection(val: Vector2) {
    if (this.props1.flowDirection === val) {
      return;
    }
    this.props1.flowDirection = val;
    this.material.uniforms['flowDirection'].value = val;
  }

  get flowSpeed() {
    return this.props1.flowSpeed;
  }
  set flowSpeed(val: number) {
    if (this.props1.flowSpeed === val) {
      return;
    }
    this.props1.flowSpeed = val;
  }

  get reflectivity() {
    return this.props1.reflectivity;
  }
  set reflectivity(val: number) {
    if (this.props1.reflectivity === val) {
      return;
    }
    this.props1.reflectivity = val;
    this.material.uniforms['reflectivity'].value = this.props1.reflectivity;
  }

  get waterScale() {
    return this.props1.scale;
  }
  set waterScale(val: number) {
    if (this.props1.scale === val) {
      return;
    }
    this.props1.scale = val;
    this.material.uniforms['config'].value.w = this.props1.scale;
  }

  appleProps() {
    this.material.uniforms['color'].value = this.props1.color;
    this.material.uniforms['reflectivity'].value = this.props1.reflectivity;
    this.material.uniforms['flowDirection'].value = this.props1.flowDirection;
    this.material.uniforms['config'].value.w = this.props1.scale;

    this.reflector.textureWidth = this.props1.textureWidth;
    this.reflector.textureHeight = this.props1.textureHeight;
    this.reflector.clipBias = this.props1.clipBias;
    this.refractor.getRenderTarget().setSize(this.props1.textureWidth, this.props1.textureHeight);
  }

  clone(recursive?: boolean | undefined): this {
    const cloned = super.clone(recursive);

    const props = (this.props1 as any)[getProxyRawObject];
    const json = propsToJson(props);
    const propsClone = (cloned.props as any)[getProxyRawObject];
    propsFromJson(propsClone, json);
    propsClone.appleProps();

    return cloned;
  }

  serialize(json: any) {
    super.serialize(json);

    json.props = propsToJson(this.props1 as any);
  }

  deserialize(json: any) {
    super.deserialize(json);

    if (json.props) {
      propsFromJson(this.props1 as any, json.props);
      this.appleProps();
    }
  }

  dispose(): void {
    this.reflector.dispose();
    this.refractor.dispose();
  }

  protected rebuildGeometry() {
    super.rebuildGeometry();
    this.reflector.geometry = this.geometry;
    this.refractor.geometry = this.geometry;
  }

  private updateTextureMatrix(camera: Camera) {
    this.textureMatrix.set(
      0.5, 0.0, 0.0, 0.5,
      0.0, 0.5, 0.0, 0.5,
      0.0, 0.0, 0.5, 0.5,
      0.0, 0.0, 0.0, 1.0
    );

    this.textureMatrix.multiply(camera.projectionMatrix);
    this.textureMatrix.multiply(camera.matrixWorldInverse);
    this.textureMatrix.multiply(this.matrixWorld);
  }

  private updateFlow() {
    const config = this.material.uniforms['config'];

    config.value.x += this.props1.flowSpeed * worldGlobal.delta; // flowMapOffset0
    config.value.y = config.value.x + halfCycle; // flowMapOffset1

    // Important: The distance between offsets should be always the value of "halfCycle".
    // Moreover, both offsets should be in the range of [ 0, cycle ].
    // This approach ensures a smooth water flow and avoids "reset" effects.

    if (config.value.x >= cycle) {
      config.value.x = 0;
      config.value.y = halfCycle;
    } else if (config.value.y >= cycle) {
      config.value.y = config.value.y - cycle;
    }
  }

  private static WaterShader = {
    uniforms: {
      'color': {
        type: 'c',
        value: null
      },
      'reflectivity': {
        type: 'f',
        value: 0
      },
      'tReflectionMap': {
        type: 't',
        value: null
      },
      'tRefractionMap': {
        type: 't',
        value: null
      },
      'tNormalMap0': {
        type: 't',
        value: null
      },
      'tNormalMap1': {
        type: 't',
        value: null
      },
      'textureMatrix': {
        type: 'm4',
        value: null
      },
      'config': {
        type: 'v4',
        value: new Vector4()
      }
    },

    vertexShader: /* glsl */`
  
      #include <common>
      #include <fog_pars_vertex>
      #include <logdepthbuf_pars_vertex>
  
      uniform mat4 textureMatrix;
  
      varying vec4 vCoord;
      varying vec2 vUv;
      varying vec3 vToEye;
  
      void main() {
  
        vUv = uv;
        vCoord = textureMatrix * vec4( position, 1.0 );
  
        vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
        vToEye = cameraPosition - worldPosition.xyz;
  
        vec4 mvPosition =  viewMatrix * worldPosition; // used in fog_vertex
        gl_Position = projectionMatrix * mvPosition;
  
        #include <logdepthbuf_vertex>
        #include <fog_vertex>
  
      }`,

    fragmentShader: /* glsl */`
  
      #include <common>
      #include <fog_pars_fragment>
      #include <logdepthbuf_pars_fragment>
  
      uniform sampler2D tReflectionMap;
      uniform sampler2D tRefractionMap;
      uniform sampler2D tNormalMap0;
      uniform sampler2D tNormalMap1;
  
      #ifdef USE_FLOWMAP
        uniform sampler2D tFlowMap;
      #else
        uniform vec2 flowDirection;
      #endif
  
      uniform vec3 color;
      uniform float reflectivity;
      uniform vec4 config;
  
      varying vec4 vCoord;
      varying vec2 vUv;
      varying vec3 vToEye;
  
      void main() {
  
        #include <logdepthbuf_fragment>
  
        float flowMapOffset0 = config.x;
        float flowMapOffset1 = config.y;
        float halfCycle = config.z;
        float scale = config.w;
  
        vec3 toEye = normalize( vToEye );
  
        // determine flow direction
        vec2 flow;
        #ifdef USE_FLOWMAP
          flow = texture2D( tFlowMap, vUv ).rg * 2.0 - 1.0;
        #else
          flow = flowDirection;
        #endif
        flow.x *= - 1.0;
  
        // sample normal maps (distort uvs with flowdata)
        vec4 normalColor0 = texture2D( tNormalMap0, ( vUv * scale ) + flow * flowMapOffset0 );
        vec4 normalColor1 = texture2D( tNormalMap1, ( vUv * scale ) + flow * flowMapOffset1 );
  
        // linear interpolate to get the final normal color
        float flowLerp = abs( halfCycle - flowMapOffset0 ) / halfCycle;
        vec4 normalColor = mix( normalColor0, normalColor1, flowLerp );
  
        // calculate normal vector
        vec3 normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );
  
        // calculate the fresnel term to blend reflection and refraction maps
        float theta = max( dot( toEye, normal ), 0.0 );
        float reflectance = reflectivity + ( 1.0 - reflectivity ) * pow( ( 1.0 - theta ), 5.0 );
  
        // calculate final uv coords
        vec3 coord = vCoord.xyz / vCoord.w;
        vec2 uv = coord.xy + coord.z * normal.xz * 0.05;
  
        vec4 reflectColor = texture2D( tReflectionMap, vec2( 1.0 - uv.x, uv.y ) );
        vec4 refractColor = texture2D( tRefractionMap, uv );
  
        // multiply water color with the mix of both textures
        gl_FragColor = vec4( color, 1.0 ) * mix( refractColor, reflectColor, reflectance );
  
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
  
      }`
  };
}

// fuck, water component do not work well
/* 
addThreeClass('WaterPlane', {
  members: {
    'props.width': 'Number',
    'props.height': 'Number',
    'props.widthSegments': 'Number',
    'props.heightSegments': 'Number',

    castShadow: 'Boolean',
    receiveShadow: 'Boolean',

    normalMap0: 'Texture',
    normalMap1: 'Texture',
    color: 'Color',
    textureWidth: 'Number',
    textureHeight: 'Number',
    clipBias: 'Number',
    flowDirection: 'Vector2',
    flowSpeed: 'Number',
    reflectivity: 'Number',
    waterScale: 'Number',
  },
  proto: 'Object3D',
  group: 'Objects.Water plane',
  icon: 'water',
  create: ({ geometry }: any = {}) => new WaterPlane(geometry),
});
*/
