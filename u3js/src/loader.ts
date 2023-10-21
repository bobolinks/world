/* eslint-disable @typescript-eslint/no-this-alias */
import {
  UVMapping,
  CubeReflectionMapping,
  CubeRefractionMapping,
  EquirectangularReflectionMapping,
  EquirectangularRefractionMapping,
  CubeUVReflectionMapping,

  RepeatWrapping,
  ClampToEdgeWrapping,
  MirroredRepeatWrapping,

  NearestFilter,
  NearestMipmapNearestFilter,
  NearestMipmapLinearFilter,
  LinearFilter,
  LinearMipmapNearestFilter,
  LinearMipmapLinearFilter,

  Color,

  Object3D,
  Skeleton,
  Shape,
  Fog,
  FogExp2,
  CubeTexture,
  Texture,
  Source,
  DataTexture,
  ImageLoader,
  LoadingManager,
  AnimationClip,
  LoaderUtils,
  BufferGeometryLoader,
  Loader,
  FileLoader,
  Material,
  BufferGeometry,
  AudioListener,
} from 'three';
import './clone';
import * as Geometries from 'three/src/geometries/Geometries.js';
import * as Utils from 'three/src/utils.js';
import * as Nodes from "three/examples/jsm/nodes/Nodes";
import './extends/three/index';
import './extends/effects/index';
import { createObjectFromJson, getBaseThreeObjectClass } from './extends/three/utils';
import { NodeLoaderResult } from 'three/examples/jsm/nodes/loaders/NodeLoader';
import { NodeMaterialLoader } from 'three/examples/jsm/nodes/Nodes';
import { createThreeNode } from './extends/helper/clslib';
import { Graph } from './extends/graph/graph';

const { getTypedArray } = Utils as any;
const { createNodeFromType } = Nodes as any;

export class ObjectLoader extends Loader<Object3D, string> {
  private _textures?: { [key: string]: Texture; };
  private _listeners: { [key: string]: AudioListener; } = {};
  private _nodes?: NodeLoaderResult;
  private _nodesJSON: any;

  constructor(manager?: LoadingManager) {
    super(manager);
  }

  load(url: string,
    onLoad?: (data: Object3D) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,) {

    const scope = this;

    const path = (this.path === '') ? LoaderUtils.extractUrlBase(url) : this.path;
    this.resourcePath = this.resourcePath || path;

    const loader = new FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);
    loader.load(url, function (text: string) {
      let json = null;

      try {
        json = JSON.parse(text);
      } catch (error: any) {
        if (onError !== undefined) onError(error);
        console.error('THREE:ObjectLoader: Can\'t parse ' + url + '.', error.message);
        return;
      }

      const metadata = json.metadata;

      if (metadata === undefined || metadata.type === undefined || metadata.type.toLowerCase() === 'geometry') {
        if (onError !== undefined) onError(new Error('THREE.ObjectLoader: Can\'t load ' + url));
        console.error('THREE.ObjectLoader: Can\'t load ' + url);
        return;
      }

      scope.parse(json, onLoad);
    } as any, onProgress, onError);
  }

  async loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<Object3D> {

    const scope = this;

    const path = (this.path === '') ? LoaderUtils.extractUrlBase(url) : this.path;
    this.resourcePath = this.resourcePath || path;

    const loader = new FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);

    const text: string = await loader.loadAsync(url, onProgress) as any;

    const json = JSON.parse(text);

    const metadata = json.metadata;

    if (metadata === undefined || metadata.type === undefined || metadata.type.toLowerCase() === 'geometry') {

      throw new Error('THREE.ObjectLoader: Can\'t load ' + url);

    }

    return await scope.parseAsync(json);
  }

  parse(json: any, onLoad?: (data: Object3D) => void) {
    this._nodesJSON = json.nodes;

    const animations = this.parseAnimations(json.animations);
    const shapes = this.parseShapes(json.shapes);
    const geometries = this.parseGeometries(json.geometries, shapes);

    const images: any = this.parseImages(json.images, function () {
      if (onLoad !== undefined) onLoad(object);
    });

    const textures = this.parseTextures(json.textures, images);
    const materials = this.parseMaterials(json.materials, textures);

    // parse audio listeners
    if (json.listeners) {
      for (const it of json.listeners) {
        const lis = this.parseObject(it, geometries, materials, textures, animations);
        this._listeners[lis.uuid] = lis;
      }
    }

    const object = this.parseObject(json.object, geometries, materials, textures, animations);
    const skeletons = this.parseSkeletons(json.skeletons, object);

    this.bindSkeletons(object, skeletons);

    //
    if (onLoad !== undefined) {
      let hasImages = false;
      for (const uuid in images) {
        if (images[uuid].data instanceof HTMLImageElement) {
          hasImages = true;
          break;
        }
      }
      if (hasImages === false) onLoad(object);
    }

    this._nodesJSON = null; // dispose

    object.traverse((o: Object3D) => {
      if (o.userData.graph) {
        const graph = new Graph(o);
        graph.deserialize(o.userData.graph, this._nodes || {}, this._textures || {});
      }
    });

    for (const node of Object.values(this._nodes || {})) {
      if ((node as any).fill) {
        (node as any).fill(object, this._nodes || {}, this._textures || {});
      }
    }

    return object;
  }

  async parseAsync(json: any) {
    this._nodesJSON = json.nodes;

    const animations = this.parseAnimations(json.animations);
    const shapes = this.parseShapes(json.shapes);
    const geometries = this.parseGeometries(json.geometries, shapes);

    const images = await this.parseImagesAsync(json.images);

    const textures = this.parseTextures(json.textures, images);
    const materials = this.parseMaterials(json.materials, textures);

    // parse audio listeners
    if (json.listeners) {
      for (const it of json.listeners) {
        const lis = this.parseObject(it, geometries, materials, textures, animations);
        this._listeners[lis.uuid] = lis;
      }
    }

    const object = this.parseObject(json.object, geometries, materials, textures, animations);
    const skeletons = this.parseSkeletons(json.skeletons, object);

    this.bindSkeletons(object, skeletons);

    this._nodesJSON = null; // dispose

    object.traverse((o: Object3D) => {
      if (o.userData.graph) {
        const graph = new Graph(o);
        graph.deserialize(o.userData.graph, this._nodes || {}, this._textures || {});
      }
    });

    for (const node of Object.values(this._nodes || {})) {
      if ((node as any).fill) {
        (node as any).fill(object, this._nodes || {}, this._textures || {});
      }
    }

    return object;
  }

  parseShapes(json: any) {
    const shapes: any = {};

    if (json !== undefined) {
      for (let i = 0, l = json.length; i < l; i++) {
        const shape = new Shape().fromJSON(json[i]);
        shapes[shape.uuid] = shape;
      }
    }
    return shapes;
  }

  parseSkeletons(json: any, object: Object3D) {
    const skeletons: any = {};
    const bones: any = {};

    // generate bone lookup table
    object.traverse(function (child: Object3D) {
      if ((child as any).isBone) bones[child.uuid] = child;
    });

    // create skeletons
    if (json !== undefined) {
      for (let i = 0, l = json.length; i < l; i++) {
        const skeleton = new Skeleton();
        skeleton.fromJSON(json[i], bones);
        skeletons[skeleton.uuid] = skeleton;
      }
    }
    return skeletons;
  }

  parseGeometries(json: any, shapes: { [key: string]: Shape }) {
    const geometries: { [key: string]: BufferGeometry } = {};

    if (json !== undefined) {
      const bufferGeometryLoader = new BufferGeometryLoader();
      for (let i = 0, l = json.length; i < l; i++) {
        let geometry;
        const data = json[i];

        switch (data.type) {
          case 'BufferGeometry':
          case 'InstancedBufferGeometry':
            geometry = bufferGeometryLoader.parse(data);
            break;

          default:
            if (data.type in Geometries) {
              geometry = (Geometries as any)[data.type].fromJSON(data, shapes);
            } else {
              console.warn(`THREE.ObjectLoader: Unsupported geometry type "${data.type}"`);
            }
        }

        geometry.uuid = data.uuid;

        if (data.name !== undefined) geometry.name = data.name;
        if (data.userData !== undefined) geometry.userData = data.userData;

        geometries[data.uuid] = geometry;

      }

    }

    return geometries;

  }

  parseMaterials(json: any, textures: { [key: string]: Texture }): { [key: string]: Material } {
    const materials: { [key: string]: Material } = {};

    this._textures = textures;

    if (json !== undefined) {
      const nodes = this.parseNodes(this._nodesJSON, textures);

      this._nodes = nodes;

      const loader = new NodeMaterialLoader();
      loader.setTextures(textures);
      loader.setNodes(nodes);

      for (let i = 0, l = json.length; i < l; i++) {
        const data = json[i];
        const node = nodes[data.uuid];
        if (node) {
          materials[data.uuid] = node as any;
        } else {
          materials[data.uuid] = loader.parse(data);
        }
      }
    } else if (this._nodesJSON) {
      this._nodes = this.parseNodes(this._nodesJSON, textures);
    }

    return materials;
  }

  parseAnimations(json: any) {
    const animations: any = {};

    if (json !== undefined) {
      for (let i = 0; i < json.length; i++) {
        const data = json[i];
        const clip = AnimationClip.parse(data);
        animations[clip.uuid] = clip;
      }
    }
    return animations;
  }

  parseImages(json: any, onLoad?: (data: Object3D) => void) {
    const scope = this;
    const images: any = {};
    let loader: any;

    function loadImage(url: string) {
      scope.manager.itemStart(url);
      return loader.load(url, function () {
        scope.manager.itemEnd(url);
      }, undefined, function () {
        scope.manager.itemError(url);
        scope.manager.itemEnd(url);
      });
    }

    function deserializeImage(image: any) {
      if (typeof image === 'string') {
        const url = image;
        const path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test(url) ? url : scope.resourcePath + url;
        return loadImage(path);
      } else {
        if (image.data) {
          return {
            data: getTypedArray(image.type, image.data),
            width: image.width,
            height: image.height
          };
        } else {
          return null;
        }
      }
    }

    if (json !== undefined && json.length > 0) {
      const manager = new LoadingManager(onLoad as any);

      loader = new ImageLoader(manager);
      loader.setCrossOrigin(this.crossOrigin);

      for (let i = 0, il = json.length; i < il; i++) {
        const image = json[i];
        const url = image.url;

        if (Array.isArray(url)) {
          // load array of images e.g CubeTexture

          const imageArray = [];
          for (let j = 0, jl = url.length; j < jl; j++) {
            const currentUrl = url[j];
            const deserializedImage = deserializeImage(currentUrl);

            if (deserializedImage !== null) {
              if (deserializedImage instanceof HTMLImageElement) {
                imageArray.push(deserializedImage);
              } else {
                // special case: handle array of data textures for cube textures
                imageArray.push(new DataTexture(deserializedImage.data, deserializedImage.width, deserializedImage.height));
              }
            }
          }
          images[image.uuid] = new Source(imageArray);
        } else {

          // load single image

          const deserializedImage = deserializeImage(image.url);
          images[image.uuid] = new Source(deserializedImage);


        }

      }

    }

    return images;

  }

  async parseImagesAsync(json: any) {
    const scope = this;
    const images: any = {};

    let loader: any;

    async function deserializeImage(image: any) {
      if (typeof image === 'string' && image) {
        const url = image;
        const path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test(url) ? url : scope.resourcePath + url;
        return await loader.loadAsync(path);
      } else {
        if (image.data) {
          return {
            data: getTypedArray(image.type, image.data),
            width: image.width,
            height: image.height
          };
        } else {
          return null;
        }
      }
    }

    if (json !== undefined && json.length > 0) {
      loader = new ImageLoader(this.manager);
      loader.setCrossOrigin(this.crossOrigin);

      for (let i = 0, il = json.length; i < il; i++) {
        const image = json[i];
        const url = image.url;

        if (Array.isArray(url)) {
          // load array of images e.g CubeTexture
          const imageArray = [];
          for (let j = 0, jl = url.length; j < jl; j++) {
            const currentUrl = url[j];
            const deserializedImage = await deserializeImage(currentUrl);

            if (deserializedImage !== null) {
              if (deserializedImage instanceof HTMLImageElement) {
                imageArray.push(deserializedImage);
              } else {
                // special case: handle array of data textures for cube textures
                imageArray.push(new DataTexture(deserializedImage.data, deserializedImage.width, deserializedImage.height));
              }
            }
          }
          images[image.uuid] = new Source(imageArray);
        } else {
          // load single image
          const deserializedImage = await deserializeImage(image.url);
          images[image.uuid] = new Source(deserializedImage);
        }
      }
    }

    return images;
  }

  parseTextures(json: any, images: { [key: string]: any }) {
    function parseConstant(value: any, type: any) {
      if (typeof value === 'number') return value;
      console.warn('THREE.ObjectLoader.parseTexture: Constant should be in numeric form.', value);
      return type[value];
    }

    const textures: any = {};

    if (json !== undefined) {
      for (let i = 0, l = json.length; i < l; i++) {
        const data = json[i];

        if (data.image === undefined) {
          console.warn('THREE.ObjectLoader: No "image" specified for', data.uuid);
        }

        if (images[data.image] === undefined) {
          console.warn('THREE.ObjectLoader: Undefined image', data.image);
        }

        const source = images[data.image];
        const image = source.data;

        let texture;

        if (Array.isArray(image)) {
          texture = new CubeTexture();
          if (image.length === 6) texture.needsUpdate = true;
        } else {
          if (image && image.data) {
            texture = new DataTexture();
          } else {
            texture = new Texture();
          }

          if (image) texture.needsUpdate = true; // textures can have undefined image data
        }

        texture.source = source;

        texture.uuid = data.uuid;

        if (data.name !== undefined) texture.name = data.name;

        if (data.mapping !== undefined) texture.mapping = parseConstant(data.mapping, TEXTURE_MAPPING);
        if (data.channel !== undefined) texture.channel = data.channel;

        if (data.offset !== undefined) texture.offset.fromArray(data.offset);
        if (data.repeat !== undefined) texture.repeat.fromArray(data.repeat);
        if (data.center !== undefined) texture.center.fromArray(data.center);
        if (data.rotation !== undefined) texture.rotation = data.rotation;

        if (data.wrap !== undefined) {

          texture.wrapS = parseConstant(data.wrap[0], TEXTURE_WRAPPING);
          texture.wrapT = parseConstant(data.wrap[1], TEXTURE_WRAPPING);

        }

        if (data.format !== undefined) texture.format = data.format;
        if (data.internalFormat !== undefined) texture.internalFormat = data.internalFormat;
        if (data.type !== undefined) texture.type = data.type;
        if (data.colorSpace !== undefined) texture.colorSpace = data.colorSpace;
        if (data.encoding !== undefined) texture.encoding = data.encoding; // @deprecated, r152

        if (data.minFilter !== undefined) texture.minFilter = parseConstant(data.minFilter, TEXTURE_FILTER);
        if (data.magFilter !== undefined) texture.magFilter = parseConstant(data.magFilter, TEXTURE_FILTER);
        if (data.anisotropy !== undefined) texture.anisotropy = data.anisotropy;

        if (data.flipY !== undefined) texture.flipY = data.flipY;

        if (data.generateMipmaps !== undefined) texture.generateMipmaps = data.generateMipmaps;
        if (data.premultiplyAlpha !== undefined) texture.premultiplyAlpha = data.premultiplyAlpha;
        if (data.unpackAlignment !== undefined) texture.unpackAlignment = data.unpackAlignment;
        if (data.compareFunction !== undefined) (texture as any).compareFunction = data.compareFunction;

        if (data.userData !== undefined) texture.userData = data.userData;

        textures[data.uuid] = texture;
      }
    }

    return textures;
  }

  parseObject(data: any, geometries: { [key: string]: BufferGeometry }, materials: { [key: string]: Material }, textures: { [key: string]: Texture }, animations: { [key: string]: AnimationClip }) {
    function getGeometry(name: string) {
      if (geometries[name] === undefined) {
        console.warn('THREE.ObjectLoader: Undefined geometry', name);
      }
      return geometries[name];
    }

    function getMaterial(name: string) {
      if (name === undefined) return undefined;
      if (Array.isArray(name)) {
        const array = [];
        for (let i = 0, l = name.length; i < l; i++) {
          const uuid = name[i];
          if (materials[uuid] === undefined) {
            console.warn('THREE.ObjectLoader: Undefined material', uuid);
          }
          array.push(materials[uuid]);
        }
        return array;
      }
      if (materials[name] === undefined) {
        console.warn('THREE.ObjectLoader: Undefined material', name);
      }
      return materials[name];
    }

    function getTexture(uuid: string) {
      if (textures[uuid] === undefined) {
        console.warn('THREE.ObjectLoader: Undefined texture', uuid);
      }
      return textures[uuid];
    }

    if (this._listeners[data.uuid]) {
      const listener = this._listeners[data.uuid];
      if (data.children !== undefined) {
        const children = data.children;
        for (let i = 0; i < children.length; i++) {
          listener.add(this.parseObject(children[i], geometries, materials, textures, animations));
        }
      }
      return listener;
    }

    const geometry = data.geometry ? getGeometry(data.geometry) : undefined;
    const material = data.material ? getMaterial(data.material) : undefined;

    if (geometry || material) {
      data = { ...data, geometry, material };
    }

    const clsName = data.userData?.extend || data.type;

    if (clsName === 'PositionalAudio2' && data.listener) {
      const listener = this._listeners[data.listener];
      data = { ...data, listener };
    }

    const object: any = createObjectFromJson(clsName, data);
    const baseType = getBaseThreeObjectClass(clsName);

    switch (baseType) {
      case 'Scene':
        if (data.background !== undefined) {
          if (Number.isInteger(data.background)) {
            object.background = new Color(data.background);
          } else {
            object.background = getTexture(data.background);
          }
        }

        if (data.environment !== undefined) {
          object.environment = getTexture(data.environment);
        }

        if (data.fog !== undefined) {
          if (data.fog.type === 'Fog') {
            object.fog = new Fog(data.fog.color, data.fog.near, data.fog.far);
          } else if (data.fog.type === 'FogExp2') {
            object.fog = new FogExp2(data.fog.color, data.fog.density);
          }
          if (data.fog.name !== '') {
            object.fog.name = data.fog.name;
          }
        }

        if (data.backgroundBlurriness !== undefined) object.backgroundBlurriness = data.backgroundBlurriness;
        if (data.backgroundIntensity !== undefined) object.backgroundIntensity = data.backgroundIntensity;

        break;

      case 'PerspectiveCamera':
        if (data.focus !== undefined) object.focus = data.focus;
        if (data.zoom !== undefined) object.zoom = data.zoom;
        if (data.filmGauge !== undefined) object.filmGauge = data.filmGauge;
        if (data.filmOffset !== undefined) object.filmOffset = data.filmOffset;
        if (data.view !== undefined) object.view = Object.assign({}, data.view);
        break;

      case 'OrthographicCamera':
        if (data.zoom !== undefined) object.zoom = data.zoom;
        if (data.view !== undefined) object.view = Object.assign({}, data.view);
        break;

      case 'SkinnedMesh':
        if (data.bindMode !== undefined) object.bindMode = data.bindMode;
        if (data.bindMatrix !== undefined) object.bindMatrix.fromArray(data.bindMatrix);
        if (data.skeleton !== undefined) object.skeleton = data.skeleton;

        break;

      default:
      // do nothing
    }

    object.uuid = data.uuid;

    if (data.name !== undefined) object.name = data.name;

    if (data.matrix !== undefined) {
      object.matrix.fromArray(data.matrix);
      if (data.matrixAutoUpdate !== undefined) object.matrixAutoUpdate = data.matrixAutoUpdate;
      if (object.matrixAutoUpdate) object.matrix.decompose(object.position, object.quaternion, object.scale);
    } else {
      if (data.position !== undefined) object.position.fromArray(data.position);
      if (data.rotation !== undefined) object.rotation.fromArray(data.rotation);
      if (data.quaternion !== undefined) object.quaternion.fromArray(data.quaternion);
      if (data.scale !== undefined) object.scale.fromArray(data.scale);
    }

    if (data.up !== undefined) object.up.fromArray(data.up);

    if (data.castShadow !== undefined) object.castShadow = data.castShadow;
    if (data.receiveShadow !== undefined) object.receiveShadow = data.receiveShadow;

    if (data.shadow) {
      if (data.shadow.bias !== undefined) object.shadow.bias = data.shadow.bias;
      if (data.shadow.normalBias !== undefined) object.shadow.normalBias = data.shadow.normalBias;
      if (data.shadow.radius !== undefined) object.shadow.radius = data.shadow.radius;
      if (data.shadow.mapSize !== undefined) object.shadow.mapSize.fromArray(data.shadow.mapSize);
      if (data.shadow.camera !== undefined) object.shadow.camera = this.parseObject(data.shadow.camera, geometries, materials, textures, animations);
    }

    if (data.visible !== undefined) object.visible = data.visible;
    if (data.frustumCulled !== undefined) object.frustumCulled = data.frustumCulled;
    if (data.renderOrder !== undefined) object.renderOrder = data.renderOrder;
    if (data.userData !== undefined) object.userData = data.userData;
    if (data.layers !== undefined) object.layers.mask = data.layers;

    if (data.children !== undefined) {
      const children = data.children;
      for (let i = 0; i < children.length; i++) {
        object.add(this.parseObject(children[i], geometries, materials, textures, animations));
      }
    }

    if (data.animations !== undefined) {
      const objectAnimations = data.animations;
      for (let i = 0; i < objectAnimations.length; i++) {
        const uuid = objectAnimations[i];
        object.animations.push(animations[uuid]);
      }
    }

    if (data.type === 'LOD') {
      if (data.autoUpdate !== undefined) object.autoUpdate = data.autoUpdate;
      const levels = data.levels;
      for (let l = 0; l < levels.length; l++) {
        const level = levels[l];
        const child = object.getObjectByProperty('uuid', level.object);
        if (child !== undefined) {
          object.addLevel(child, level.distance, level.hysteresis);
        }
      }
    }

    if (object.deserialize) {
      object.deserialize(data);
    }

    return object;
  }

  bindSkeletons(object: Object3D, skeletons: { [key: string]: Skeleton }) {
    if (Object.keys(skeletons).length === 0) return;

    object.traverse(function (child: any) {
      if (child.isSkinnedMesh === true && child.skeleton !== undefined) {
        const skeleton = skeletons[child.skeleton];
        if (skeleton === undefined) {
          console.warn('THREE.ObjectLoader: No skeleton found with UUID:', child.skeleton);
        } else {
          child.bind(skeleton, child.bindMatrix);
        }
      }
    });
  }

  parseNodes(json: any, textures: { [key: string]: Texture }): NodeLoaderResult {
    if (json !== undefined) {
      const nodes: NodeLoaderResult = {};
      const loader = new NodeMaterialLoader();

      for (const nodeJSON of json) {
        const { uuid, type, _inst } = nodeJSON;
        const isMaterial = /Material$/.test(type);
        if (isMaterial) {
          const node = loader.parse(nodeJSON);
          node.uuid = uuid;
          nodes[uuid] = node as any;
          continue;
        }
        const node = _inst ? createThreeNode(_inst) : createNodeFromType(type);
        nodes[uuid] = node;
        nodes[uuid].uuid = uuid;
      }

      const meta = { nodes, textures };
      for (const nodeJSON of json) {
        nodeJSON.meta = meta;
        const node: any = nodes[nodeJSON.uuid];
        if (node.isMaterial) {
          continue;
        }
        node.deserialize(nodeJSON);
        delete nodeJSON.meta;
      }
      return nodes;
    }
    return {};
  }
}

const TEXTURE_MAPPING = {
  UVMapping: UVMapping,
  CubeReflectionMapping: CubeReflectionMapping,
  CubeRefractionMapping: CubeRefractionMapping,
  EquirectangularReflectionMapping: EquirectangularReflectionMapping,
  EquirectangularRefractionMapping: EquirectangularRefractionMapping,
  CubeUVReflectionMapping: CubeUVReflectionMapping
};

const TEXTURE_WRAPPING = {
  RepeatWrapping: RepeatWrapping,
  ClampToEdgeWrapping: ClampToEdgeWrapping,
  MirroredRepeatWrapping: MirroredRepeatWrapping
};

const TEXTURE_FILTER = {
  NearestFilter: NearestFilter,
  NearestMipmapNearestFilter: NearestMipmapNearestFilter,
  NearestMipmapLinearFilter: NearestMipmapLinearFilter,
  LinearFilter: LinearFilter,
  LinearMipmapNearestFilter: LinearMipmapNearestFilter,
  LinearMipmapLinearFilter: LinearMipmapLinearFilter
};

