/* eslint-disable max-len */
// Auto gen by three nodes parser
import * as THREE from 'three';
import * as Nodes from 'three/examples/jsm/nodes/Nodes';
import { BitangentNode, BlendModeNode, CameraNode, ColorAdjustmentNode, ColorSpaceNode, MaterialNode, MathNode, NormalNode, Object3DNode, OscNode, PositionNode, TangentNode, ViewportNode } from 'three/examples/jsm/nodes/Nodes';

export type ClsTypeInfo = {
  cls: () => any;
  members: { [key: string]: string };
  proto: string;
  [key: string]: boolean | string | { [key: string]: string } | (() => any);
};

export const types = {
  BitangentNodeScope: {
    LOCAL: BitangentNode.LOCAL,
    VIEW: BitangentNode.VIEW,
    WORLD: BitangentNode.WORLD,
    GEOMETRY: BitangentNode.GEOMETRY,
  },
  Blending: { AdditiveBlending: THREE.AdditiveBlending, CustomBlending: THREE.CustomBlending, MultiplyBlending: THREE.MultiplyBlending, NoBlending: THREE.NoBlending, NormalBlending: THREE.NormalBlending, SubtractiveBlending: THREE.SubtractiveBlending },
  BlendingDstFactor: { DstAlphaFactor: THREE.DstAlphaFactor, DstColorFactor: THREE.DstColorFactor, OneFactor: THREE.OneFactor, OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor, OneMinusDstColorFactor: THREE.OneMinusDstColorFactor, OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor, OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor, SrcAlphaFactor: THREE.SrcAlphaFactor, SrcColorFactor: THREE.SrcColorFactor, ZeroFactor: THREE.ZeroFactor },
  BlendingSrcFactor: { SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor },
  BlendingEquation: { AddEquation: THREE.AddEquation, MaxEquation: THREE.MaxEquation, MinEquation: THREE.MinEquation, ReverseSubtractEquation: THREE.ReverseSubtractEquation, SubtractEquation: THREE.SubtractEquation },
  BlendMode: {
    BURN: BlendModeNode.BURN,
    DODGE: BlendModeNode.DODGE,
    SCREEN: BlendModeNode.SCREEN,
    OVERLAY: BlendModeNode.OVERLAY,
  },
  CameraNodeScope: {
    VIEW_MATRIX: Object3DNode.VIEW_MATRIX,
    NORMAL_MATRIX: Object3DNode.NORMAL_MATRIX,
    WORLD_MATRIX: Object3DNode.WORLD_MATRIX,
    POSITION: Object3DNode.POSITION,
    VIEW_POSITION: Object3DNode.VIEW_POSITION,
    PROJECTION_MATRIX: CameraNode.PROJECTION_MATRIX,
  },
  ColorAdjustmentMethod: {
    SATURATION: ColorAdjustmentNode.SATURATION,
    VIBRANCE: ColorAdjustmentNode.VIBRANCE,
    HUE: ColorAdjustmentNode.HUE,
  },
  ColorSpace: { DisplayP3ColorSpace: THREE.DisplayP3ColorSpace, LinearDisplayP3ColorSpace: THREE.LinearDisplayP3ColorSpace, LinearSRGBColorSpace: THREE.LinearSRGBColorSpace, NoColorSpace: THREE.NoColorSpace, SRGBColorSpace: THREE.SRGBColorSpace },
  ColorSpaceNodeMethod: {
    LINEAR_TO_LINEAR: ColorSpaceNode.LINEAR_TO_LINEAR,
    LINEAR_TO_sRGB: ColorSpaceNode.LINEAR_TO_sRGB,
    sRGB_TO_LINEAR: ColorSpaceNode.sRGB_TO_LINEAR,
  },
  Combine: { AddOperation: THREE.AddOperation, MixOperation: THREE.MixOperation, MultiplyOperation: THREE.MultiplyOperation },
  CompressedPixelFormat: { RED_GREEN_RGTC2_Format: THREE.RED_GREEN_RGTC2_Format, RED_RGTC1_Format: THREE.RED_RGTC1_Format, RGBA_ASTC_10x10_Format: THREE.RGBA_ASTC_10x10_Format, RGBA_ASTC_10x5_Format: THREE.RGBA_ASTC_10x5_Format, RGBA_ASTC_10x6_Format: THREE.RGBA_ASTC_10x6_Format, RGBA_ASTC_10x8_Format: THREE.RGBA_ASTC_10x8_Format, RGBA_ASTC_12x10_Format: THREE.RGBA_ASTC_12x10_Format, RGBA_ASTC_12x12_Format: THREE.RGBA_ASTC_12x12_Format, RGBA_ASTC_4x4_Format: THREE.RGBA_ASTC_4x4_Format, RGBA_ASTC_5x4_Format: THREE.RGBA_ASTC_5x4_Format, RGBA_ASTC_5x5_Format: THREE.RGBA_ASTC_5x5_Format, RGBA_ASTC_6x5_Format: THREE.RGBA_ASTC_6x5_Format, RGBA_ASTC_6x6_Format: THREE.RGBA_ASTC_6x6_Format, RGBA_ASTC_8x5_Format: THREE.RGBA_ASTC_8x5_Format, RGBA_ASTC_8x6_Format: THREE.RGBA_ASTC_8x6_Format, RGBA_ASTC_8x8_Format: THREE.RGBA_ASTC_8x8_Format, RGBA_BPTC_Format: THREE.RGBA_BPTC_Format, RGBA_ETC2_EAC_Format: THREE.RGBA_ETC2_EAC_Format, RGBA_PVRTC_2BPPV1_Format: THREE.RGBA_PVRTC_2BPPV1_Format, RGBA_PVRTC_4BPPV1_Format: THREE.RGBA_PVRTC_4BPPV1_Format, RGBA_S3TC_DXT1_Format: THREE.RGBA_S3TC_DXT1_Format, RGBA_S3TC_DXT3_Format: THREE.RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT5_Format: THREE.RGBA_S3TC_DXT5_Format, RGB_BPTC_SIGNED_Format: THREE.RGB_BPTC_SIGNED_Format, RGB_BPTC_UNSIGNED_Format: THREE.RGB_BPTC_UNSIGNED_Format, RGB_ETC1_Format: THREE.RGB_ETC1_Format, RGB_ETC2_Format: THREE.RGB_ETC2_Format, RGB_PVRTC_2BPPV1_Format: THREE.RGB_PVRTC_2BPPV1_Format, RGB_PVRTC_4BPPV1_Format: THREE.RGB_PVRTC_4BPPV1_Format, RGB_S3TC_DXT1_Format: THREE.RGB_S3TC_DXT1_Format, SIGNED_RED_GREEN_RGTC2_Format: THREE.SIGNED_RED_GREEN_RGTC2_Format, SIGNED_RED_RGTC1_Format: THREE.SIGNED_RED_RGTC1_Format },
  CoordinateSystem: { WebGLCoordinateSystem: THREE.WebGLCoordinateSystem, WebGPUCoordinateSystem: THREE.WebGPUCoordinateSystem },
  CubeTextureMapping: { CubeReflectionMapping: THREE.CubeReflectionMapping, CubeRefractionMapping: THREE.CubeRefractionMapping, CubeUVReflectionMapping: THREE.CubeUVReflectionMapping },
  DeepTexturePixelFormat: { DepthFormat: THREE.DepthFormat, DepthStencilFormat: THREE.DepthStencilFormat },
  DepthModes: { AlwaysDepth: THREE.AlwaysDepth, EqualDepth: THREE.EqualDepth, GreaterDepth: THREE.GreaterDepth, GreaterEqualDepth: THREE.GreaterEqualDepth, LessDepth: THREE.LessDepth, LessEqualDepth: THREE.LessEqualDepth, NeverDepth: THREE.NeverDepth, NotEqualDepth: THREE.NotEqualDepth },
  DepthPackingStrategies: { BasicDepthPacking: THREE.BasicDepthPacking, RGBADepthPacking: THREE.RGBADepthPacking },
  GLSLVersion: { GLSL1: THREE.GLSL1, GLSL3: THREE.GLSL3 },
  MagnificationTextureFilter: { LinearFilter: THREE.LinearFilter, NearestFilter: THREE.NearestFilter },
  Mapping: { EquirectangularReflectionMapping: THREE.EquirectangularReflectionMapping, EquirectangularRefractionMapping: THREE.EquirectangularRefractionMapping, UVMapping: THREE.UVMapping },
  MaterialNodeScope: {
    ALPHA_TEST: MaterialNode.ALPHA_TEST,
    COLOR: MaterialNode.COLOR,
    OPACITY: MaterialNode.OPACITY,
    ROUGHNESS: MaterialNode.ROUGHNESS,
    METALNESS: MaterialNode.METALNESS,
    EMISSIVE: MaterialNode.EMISSIVE,
    ROTATION: MaterialNode.ROTATION,
  },
  MathNodeMethod1: {
    RADIANS: MathNode.RADIANS,
    DEGREES: MathNode.DEGREES,
    EXP: MathNode.EXP,
    EXP2: MathNode.EXP2,
    LOG: MathNode.LOG,
    LOG2: MathNode.LOG2,
    SQRT: MathNode.SQRT,
    INVERSE_SQRT: MathNode.INVERSE_SQRT,
    FLOOR: MathNode.FLOOR,
    CEIL: MathNode.CEIL,
    NORMALIZE: MathNode.NORMALIZE,
    FRACT: MathNode.FRACT,
    SIN: MathNode.SIN,
    COS: MathNode.COS,
    TAN: MathNode.TAN,
    ASIN: MathNode.ASIN,
    ACOS: MathNode.ACOS,
    ATAN: MathNode.ATAN,
    ABS: MathNode.ABS,
    SIGN: MathNode.SIGN,
    LENGTH: MathNode.LENGTH,
    NEGATE: MathNode.NEGATE,
    ONE_MINUS: MathNode.ONE_MINUS,
    DFDX: MathNode.DFDX,
    DFDY: MathNode.DFDY,
    ROUND: MathNode.ROUND,
  },
  MathNodeMethod2: {
    ATAN2: MathNode.ATAN2,
    MIN: MathNode.MIN,
    MAX: MathNode.MAX,
    MOD: MathNode.MOD,
    STEP: MathNode.STEP,
    REFLECT: MathNode.REFLECT,
    DISTANCE: MathNode.DISTANCE,
    DOT: MathNode.DOT,
    CROSS: MathNode.CROSS,
    POW: MathNode.POW,
    TRANSFORM_DIRECTION: MathNode.TRANSFORM_DIRECTION,
  },
  MathNodeMethod3: {
    MIX: MathNode.MIX,
    CLAMP: MathNode.CLAMP,
    REFRACT: MathNode.REFRACT,
    SMOOTHSTEP: MathNode.SMOOTHSTEP,
    FACEFORWARD: MathNode.FACEFORWARD,
  },
  MinificationTextureFilter: { LinearFilter: THREE.LinearFilter, LinearMipMapLinearFilter: THREE.LinearMipMapLinearFilter, LinearMipMapNearestFilter: THREE.LinearMipMapNearestFilter, LinearMipmapLinearFilter: THREE.LinearMipmapLinearFilter, LinearMipmapNearestFilter: THREE.LinearMipmapNearestFilter, NearestFilter: THREE.NearestFilter, NearestMipMapLinearFilter: THREE.NearestMipMapLinearFilter, NearestMipMapNearestFilter: THREE.NearestMipMapNearestFilter, NearestMipmapLinearFilter: THREE.NearestMipmapLinearFilter, NearestMipmapNearestFilter: THREE.NearestMipmapNearestFilter },
  NodeTypeOption: 'void,bool,int,float,vec2,vec3,vec4,mat3,mat4,code,color,uint,int,property,sampler,texture,cubeTexture,ivec2,uvec2,bvec2,ivec3,uvec3,bvec3,ivec4,uvec4,bvec4,imat3,umat3,bmat3,imat4,umat4,bmat4'.split(','),
  NormalMapTypes: { ObjectSpaceNormalMap: THREE.ObjectSpaceNormalMap, TangentSpaceNormalMap: THREE.TangentSpaceNormalMap },
  NormalNodeScope: {
    GEOMETRY: NormalNode.GEOMETRY,
    LOCAL: NormalNode.LOCAL,
    VIEW: NormalNode.VIEW
  },
  Object3DNodeScope: {
    VIEW_MATRIX: Object3DNode.VIEW_MATRIX,
    NORMAL_MATRIX: Object3DNode.NORMAL_MATRIX,
    WORLD_MATRIX: Object3DNode.WORLD_MATRIX,
    POSITION: Object3DNode.POSITION,
    VIEW_POSITION: Object3DNode.VIEW_POSITION,
  },
  OperatorNodeOp: ['=', '%', '&', '|', '^', '>>', '<<', '==', '&&', '||', '^^', '<', '>', '<=', '>=', '+', '-', '*', '/'],
  OscNodeMethod: {
    SINE: OscNode.SINE,
    SQUARE: OscNode.SQUARE,
    TRIANGLE: OscNode.TRIANGLE,
    SAWTOOTH: OscNode.SAWTOOTH,
  },
  PixelFormatGPU: ['ALPHA', 'DEPTH24_STENCIL8', 'DEPTH32F_STENCIL8', 'DEPTH_COMPONENT16', 'DEPTH_COMPONENT24', 'DEPTH_COMPONENT32F', 'LUMINANCE', 'LUMINANCE_ALPHA', 'R11F_G11F_B10F', 'R16F', 'R16I', 'R16UI', 'R32F', 'R32I', 'R32UI', 'R8', 'R8I', 'R8UI', 'R8_SNORM', 'RED_INTEGER', 'RG16F', 'RG16I', 'RG16UI', 'RG32F', 'RG32I', 'RG32UI', 'RG8', 'RG8I', 'RG8UI', 'RG8_SNORM', 'RGB', 'RGB10_A2', 'RGB10_A2UI', 'RGB16F', 'RGB16I', 'RGB16UI', 'RGB32F', 'RGB32I', 'RGB32UI', 'RGB565', 'RGB5_A1', 'RGB8', 'RGB8I', 'RGB8UI', 'RGB8_SNORM', 'RGB9_E5', 'RGBA', 'RGBA16F', 'RGBA16I', 'RGBA16UI', 'RGBA32F', 'RGBA32I', 'RGBA32UI', 'RGBA4', 'RGBA8', 'RGBA8I', 'RGBA8UI', 'RGBA8_SNORM', 'SRGB8', 'SRGB8_ALPHA8'],
  PositionNodeScope: {
    GEOMETRY: PositionNode.GEOMETRY,
    LOCAL: PositionNode.LOCAL,
    WORLD: PositionNode.WORLD,
    WORLD_DIRECTION: PositionNode.WORLD_DIRECTION,
    VIEW: PositionNode.VIEW,
    VIEW_DIRECTION: PositionNode.VIEW_DIRECTION,
  },
  Precision: ['highp', 'mediump', 'lowp'],
  Side: { BackSide: THREE.BackSide, DoubleSide: THREE.DoubleSide, FrontSide: THREE.FrontSide, TwoPassDoubleSide: THREE.TwoPassDoubleSide },
  StencilFunc: { AlwaysStencilFunc: THREE.AlwaysStencilFunc, EqualStencilFunc: THREE.EqualStencilFunc, GreaterEqualStencilFunc: THREE.GreaterEqualStencilFunc, GreaterStencilFunc: THREE.GreaterStencilFunc, LessEqualStencilFunc: THREE.LessEqualStencilFunc, LessStencilFunc: THREE.LessStencilFunc, NeverStencilFunc: THREE.NeverStencilFunc, NotEqualStencilFunc: THREE.NotEqualStencilFunc },
  StencilOp: { DecrementStencilOp: THREE.DecrementStencilOp, DecrementWrapStencilOp: THREE.DecrementWrapStencilOp, IncrementStencilOp: THREE.IncrementStencilOp, IncrementWrapStencilOp: THREE.IncrementWrapStencilOp, InvertStencilOp: THREE.InvertStencilOp, KeepStencilOp: THREE.KeepStencilOp, ReplaceStencilOp: THREE.ReplaceStencilOp, ZeroStencilOp: THREE.ZeroStencilOp },
  TangentNodeScope: {
    LOCAL: TangentNode.LOCAL,
    VIEW: TangentNode.VIEW,
    WORLD: TangentNode.WORLD,
    GEOMETRY: TangentNode.GEOMETRY,
  },
  TextureComparisonFunction: { AlwaysCompare: THREE.AlwaysCompare, EqualCompare: THREE.EqualCompare, GreaterCompare: THREE.GreaterCompare, GreaterEqualCompare: THREE.GreaterEqualCompare, LessCompare: THREE.LessCompare, LessEqualCompare: THREE.LessEqualCompare, NeverCompare: THREE.NeverCompare, NotEqualCompare: THREE.NotEqualCompare },
  TextureDataType: { ByteType: THREE.ByteType, FloatType: THREE.FloatType, HalfFloatType: THREE.HalfFloatType, IntType: THREE.IntType, ShortType: THREE.ShortType, UnsignedByteType: THREE.UnsignedByteType, UnsignedInt248Type: THREE.UnsignedInt248Type, UnsignedIntType: THREE.UnsignedIntType, UnsignedShort4444Type: THREE.UnsignedShort4444Type, UnsignedShort5551Type: THREE.UnsignedShort5551Type, UnsignedShortType: THREE.UnsignedShortType },
  TextureEncoding: { LinearEncoding: THREE.LinearEncoding, sRGBEncoding: THREE.sRGBEncoding },
  ToneMapping: {
    NoToneMapping: THREE.NoToneMapping,
    LinearToneMapping: THREE.LinearToneMapping,
    ReinhardToneMapping: THREE.ReinhardToneMapping,
    CineonToneMapping: THREE.CineonToneMapping,
    ACESFilmicToneMapping: THREE.ACESFilmicToneMapping,
    CustomToneMapping: THREE.CustomToneMapping,
  },
  ViewportNodeScope: {
    COORDINATE: ViewportNode.COORDINATE,
    RESOLUTION: ViewportNode.RESOLUTION,
    TOP_LEFT: ViewportNode.TOP_LEFT,
    BOTTOM_LEFT: ViewportNode.BOTTOM_LEFT,
    TOP_RIGHT: ViewportNode.TOP_RIGHT,
    BOTTOM_RIGHT: ViewportNode.BOTTOM_RIGHT,
  },
  WebGL1PixelFormat: { AlphaFormat: THREE.AlphaFormat, DepthFormat: THREE.DepthFormat, DepthStencilFormat: THREE.DepthStencilFormat, LuminanceAlphaFormat: THREE.LuminanceAlphaFormat, LuminanceFormat: THREE.LuminanceFormat, RGFormat: THREE.RGFormat, RedFormat: THREE.RedFormat, RedIntegerFormat: THREE.RedIntegerFormat, _SRGBAFormat: THREE._SRGBAFormat },
  WebGL2PixelFormat: { AlphaFormat: THREE.AlphaFormat, DepthFormat: THREE.DepthFormat, DepthStencilFormat: THREE.DepthStencilFormat, LuminanceAlphaFormat: THREE.LuminanceAlphaFormat, LuminanceFormat: THREE.LuminanceFormat, RGBAFormat: THREE.RGBAFormat, RGBAIntegerFormat: THREE.RGBAIntegerFormat, RGFormat: THREE.RGFormat, RGIntegerFormat: THREE.RGIntegerFormat, RedFormat: THREE.RedFormat, RedIntegerFormat: THREE.RedIntegerFormat, _SRGBAFormat: THREE._SRGBAFormat },
  Wrapping: { ClampToEdgeWrapping: THREE.ClampToEdgeWrapping, MirroredRepeatWrapping: THREE.MirroredRepeatWrapping, RepeatWrapping: THREE.RepeatWrapping }
}

export const three = {
  AmbientLight: {
    cls: THREE.AmbientLight,
    isAmbientLight: true,
    members: {
      // type: "string | 'AmbientLight'"
    },
    proto: 'Light'
  },
  AmbientLightProbe: {
    cls: THREE.AmbientLightProbe,
    isAmbientLightProbe: true,
    members: {},
    proto: 'LightProbe'
  },
  ArrayCamera: {
    cls: THREE.ArrayCamera,
    isArrayCamera: true,
    members: { cameras: 'PerspectiveCamera[]' },
    proto: 'PerspectiveCamera'
  },
  Audio: {
    cls: THREE.Audio,
    members: {},
    proto: 'Object3D',
  },
  AudioListener: {
    cls: THREE.AudioListener,
    members: {},
    proto: 'Object3D',
  },
  Camera: {
    cls: THREE.Camera,
    isCamera: true,
    members: {
      coordinateSystem: 'types.CoordinateSystem',
      // layers: 'Layers',
      matrixWorldInverse: 'Matrix4',
      projectionMatrix: 'Matrix4',
      projectionMatrixInverse: 'Matrix4',
      // type: "string | 'Camera'"
    },
    proto: 'Object3D'
  },
  CanvasTexture: {
    cls: THREE.CanvasTexture,
    isCanvasTexture: true,
    members: {},
    proto: 'Texture'
  },
  CompressedArrayTexture: {
    cls: THREE.CompressedArrayTexture,
    isCompressedArrayTexture: true,
    members: { wrapR: 'types.Wrapping' },
    proto: 'CompressedTexture'
  },
  CompressedTexture: {
    cls: THREE.CompressedTexture,
    isCompressedTexture: true,
    members: {
      flipY: 'boolean',
      format: 'types.CompressedPixelFormat',
      generateMipmaps: 'boolean',
      // mipmaps: 'ImageData[]'
    },
    proto: 'Texture'
  },
  CubeCamera: {
    cls: THREE.CubeCamera,
    members: {
      coordinateSystem: 'types.CoordinateSystem',
      // renderTarget: 'WebGLCubeRenderTarget',
      // type: "string | 'CubeCamera'"
    },
    proto: 'Object3D'
  },
  CubeTexture: {
    cls: THREE.CubeTexture,
    isCubeTexture: true,
    members: {
      flipY: 'boolean',
      mapping: 'types.CubeTextureMapping'
    },
    proto: 'Texture'
  },
  Data3DTexture: {
    cls: THREE.Data3DTexture,
    isData3DTexture: true,
    members: {
      flipY: 'boolean',
      generateMipmaps: 'boolean',
      magFilter: 'types.MagnificationTextureFilter',
      minFilter: 'types.MinificationTextureFilter',
      unpackAlignment: 'number',
      wrapR: 'types.Wrapping'
    },
    proto: 'Texture'
  },
  DataArrayTexture: {
    cls: THREE.DataArrayTexture,
    isDataArrayTexture: true,
    members: {
      flipY: 'boolean', generateMipmaps: 'boolean',
      magFilter: 'types.MagnificationTextureFilter',
      minFilter: 'types.MinificationTextureFilter',
      unpackAlignment: 'number',
      wrapR: 'boolean'
    },
    proto: 'Texture'
  },
  DataTexture: {
    cls: THREE.DataTexture,
    isDataTexture: true,
    members: {
      flipY: 'boolean', generateMipmaps: 'boolean', magFilter: 'types.MagnificationTextureFilter', minFilter: 'types.MinificationTextureFilter',
      unpackAlignment: 'number'
    },
    proto: 'Texture'
  },
  DepthTexture: {
    cls: THREE.DepthTexture,
    isDepthTexture: true,
    members: {
      compareFunction: 'types.TextureComparisonFunction | null',
      flipY: 'boolean', format: 'types.DeepTexturePixelFormat', generateMipmaps: 'boolean', magFilter: 'types.MagnificationTextureFilter', minFilter: 'types.MinificationTextureFilter',
      type: 'types.TextureDataType'
    },
    proto: 'Texture'
  },
  DirectionalLight: {
    cls: THREE.DirectionalLight,
    isDirectionalLight: true,
    members: {
      castShadow: 'boolean',
      position: 'Vector3',
      // shadow: 'DirectionalLightShadow',
      'shadow.mapSize.x': 'Number',
      'shadow.mapSize.y': 'Number',
      'shadow.bias': 'Number',
      target: 'Object3D',
      // type: "string | 'DirectionalLight'"
    },
    proto: 'Light'
  },
  DirectionalLightShadow: {
    cls: THREE.DirectionalLightShadow,
    isDirectionalLightShadow: true,
    members: {
      camera: 'OrthographicCamera'
    },
    proto: 'LightShadow'
  },
  Fog: {
    cls: THREE.Fog,
    isFog: true,
    members: {
      color: 'Color',
      far: 'number',
      // name: 'string',
      near: 'number'
    },
    proto: 'FogBase'
  },
  FogExp2: {
    cls: THREE.FogExp2,
    isFogExp2: true,
    members: {
      color: 'Color',
      density: 'number',
      // name: 'string'
    },
    proto: 'FogBase'
  },
  FramebufferTexture: {
    cls: THREE.FramebufferTexture,
    isFramebufferTexture: true,
    members: {
      generateMipmaps: 'boolean', magFilter: 'types.MagnificationTextureFilter', minFilter: 'types.MinificationTextureFilter'
    },
    proto: 'Texture'
  },
  HemisphereLight: {
    cls: THREE.HemisphereLight,
    isHemisphereLight: true,
    members: {
      color: 'Color', groundColor: 'Color', position: 'Vector3',
      // type: "string | 'HemisphereLight'"
    },
    proto: 'Light'
  },
  HemisphereLightProbe: {
    cls: THREE.HemisphereLightProbe,
    isHemisphereLightProbe: true,
    members: {},
    proto: 'LightProbe'
  },
  InstancedMesh: {
    cls: THREE.InstancedMesh,
    members: {
      count: 'number',
    },
    proto: 'Mesh'
  },
  Light: {
    cls: THREE.Light,
    isLight: true,
    members: {
      color: 'Color', intensity: 'number',
      shadow: 'LightShadow',
      // type: "string | 'Light'"
    },
    proto: 'Object3D'
  },
  LightProbe: {
    cls: THREE.LightProbe,
    isLightProbe: true,
    members: {
      sh: 'SphericalHarmonics3'
    },
    proto: 'Light'
  },
  LightShadow: {
    cls: THREE.LightShadow,
    members: {
      // autoUpdate: 'boolean',
      bias: 'number',
      blurSamples: 'number',
      camera: 'Camera',
      // map: 'WebGLRenderTarget | null',
      // mapPass: 'WebGLRenderTarget | null',
      mapSize: 'Vector2',
      matrix: 'Matrix4',
      // needsUpdate: 'boolean',
      normalBias: 'number',
      radius: 'number'
    }
  },
  LineBasicMaterial: {
    cls: THREE.LineBasicMaterial,
    members: {
      color: 'Color', fog: 'boolean', linecap: 'string', linejoin: 'string', linewidth: 'number', map: 'Texture | null',
      // type: 'string'
    },
    proto: 'Material'
  },
  LineDashedMaterial: {
    cls: THREE.LineDashedMaterial,
    isLineDashedMaterial: true,
    members: {
      dashSize: 'number', gapSize: 'number', scale: 'number',
      // type: 'string'
    },
    proto: 'LineBasicMaterial'
  },
  Material: {
    cls: THREE.Material,
    isMaterial: true,
    members: {
      alphaHash: 'boolean',
      // alphaTest: 'number',
      // alphaToCoverage: 'boolean',
      // blendDst: 'types.BlendingDstFactor',
      // blendDstAlpha: 'number | null',
      // blendEquation: 'types.BlendingEquation',
      // blendEquationAlpha: 'number | null',
      blendSrc: 'types.BlendingSrcFactor | types.BlendingDstFactor',
      blendSrcAlpha: 'number | null',
      blending: 'types.Blending',
      // clipIntersection: 'boolean',
      // clipShadows: 'boolean',
      // clippingPlanes: 'Plane[]',
      // colorWrite: 'boolean',
      // defines: 'undefined | { [key: string]: any }',
      depthFunc: 'types.DepthModes',
      depthTest: 'boolean',
      depthWrite: 'boolean',
      // dithering: 'boolean',
      // forceSinglePass: 'boolean',
      // id: 'number',
      // name: 'string',
      // needsUpdate: 'boolean',
      opacity: 'number',
      // polygonOffset: 'boolean',
      // polygonOffsetFactor: 'number',
      // polygonOffsetUnits: 'number',
      precision: 'types.Precision | null',
      premultipliedAlpha: 'boolean',
      shadowSide: 'types.Side | null',
      side: 'types.Side',
      stencilFail: 'types.StencilOp',
      stencilFunc: 'types.StencilFunc',
      stencilFuncMask: 'number',
      stencilRef: 'number',
      stencilWrite: 'boolean',
      stencilWriteMask: 'number',
      stencilZFail: 'types.StencilOp',
      stencilZPass: 'types.StencilOp',
      toneMapped: 'boolean',
      transparent: 'boolean',
      // type: 'string',
      // userData: 'any',
      // uuid: 'string',
      // version: 'number',
      // vertexColors: 'boolean',
      visible: 'boolean'
    },
    proto: 'EventDispatcher'
  },
  Mesh: {
    cls: THREE.Mesh,
    members: {
      castShadow: 'boolean',
      receiveShadow: 'boolean',
      material: 'Material',
    },
    proto: 'Object3D'
  },
  MeshBasicMaterial: {
    cls: THREE.MeshBasicMaterial,
    members: {
      alphaMap: 'Texture | null', aoMap: 'Texture | null', aoMapIntensity: 'number', color: 'Color',
      combine: 'types.Combine', envMap: 'Texture | null', fog: 'boolean', lightMap: 'Texture | null',
      lightMapIntensity: 'number', map: 'Texture | null', reflectivity: 'number', refractionRatio: 'number',
      specularMap: 'Texture | null',
      // type: 'string',
      wireframe: 'boolean', wireframeLinecap: 'string',
      wireframeLinejoin: 'string',
      wireframeLinewidth: 'number'
    },
    proto: 'Material'
  },
  MeshDepthMaterial: {
    cls: THREE.MeshDepthMaterial,
    members: {
      alphaMap: 'Texture | null', depthPacking: 'types.DepthPackingStrategies', displacementBias: 'number',
      displacementMap: 'Texture | null', displacementScale: 'number', fog: 'boolean', map: 'Texture | null',
      // type: 'string',
      wireframe: 'boolean', wireframeLinewidth: 'number'
    },
    proto: 'Material'
  },
  MeshDistanceMaterial: {
    cls: THREE.MeshDistanceMaterial,
    members: {
      alphaMap: 'Texture | null',
      displacementBias: 'number',
      displacementMap: 'Texture | null',
      displacementScale: 'number',
      fog: 'boolean',
      map: 'Texture | null',
      // type: 'string'
    },
    proto: 'Material'
  },
  MeshLambertMaterial: {
    cls: THREE.MeshLambertMaterial,
    members: {
      alphaMap: 'Texture | null',
      aoMap: 'Texture | null',
      aoMapIntensity: 'number',
      bumpMap: 'Texture | null',
      bumpScale: 'number',
      color: 'Color',
      combine: 'types.Combine',
      displacementBias: 'number',
      displacementMap: 'Texture | null',
      displacementScale: 'number',
      emissive: 'Color',
      emissiveIntensity: 'number',
      emissiveMap: 'Texture | null',
      envMap: 'Texture | null',
      flatShading: 'boolean',
      fog: 'boolean',
      lightMap: 'Texture | null',
      lightMapIntensity: 'number',
      map: 'Texture | null',
      normalMap: 'Texture | null',
      normalMapType: 'types.NormalMapTypes',
      normalScale: 'Vector2',
      reflectivity: 'number',
      refractionRatio: 'number',
      specularMap: 'Texture | null',
      // type: 'string',
      wireframe: 'boolean',
      wireframeLinecap: 'string',
      wireframeLinejoin: 'string',
      wireframeLinewidth: 'number'
    },
    proto: 'Material'
  },
  MeshMatcapMaterial: {
    cls: THREE.MeshMatcapMaterial,
    members: {
      alphaMap: 'Texture | null',
      bumpMap: 'Texture | null',
      bumpScale: 'number',
      color: 'Color',
      // defines: '{ [key: string]: any }',
      displacementBias: 'number',
      displacementMap: 'Texture | null',
      displacementScale: 'number',
      flatShading: 'boolean',
      fog: 'boolean',
      map: 'Texture | null',
      matcap: 'Texture | null',
      normalMap: 'Texture | null',
      normalMapType: 'types.NormalMapTypes',
      normalScale: 'Vector2',
      // type: 'string'
    },
    proto: 'Material'
  },
  MeshNormalMaterial: {
    cls: THREE.MeshNormalMaterial,
    members: {
      bumpMap: 'Texture | null',
      bumpScale: 'number',
      displacementBias: 'number',
      displacementMap: 'Texture | null',
      displacementScale: 'number',
      flatShading: 'boolean',
      normalMap: 'Texture | null',
      normalMapType: 'types.NormalMapTypes',
      normalScale: 'Vector2',
      // type: 'string',
      wireframe: 'boolean', wireframeLinewidth: 'number'
    },
    proto: 'Material'
  },
  MeshPhongMaterial: {
    cls: THREE.MeshPhongMaterial,
    members: {
      alphaMap: 'Texture | null',
      aoMap: 'Texture | null',
      aoMapIntensity: 'number',
      bumpMap: 'Texture | null',
      bumpScale: 'number',
      color: 'Color',
      combine: 'types.Combine',
      displacementBias: 'number',
      displacementMap: 'Texture | null',
      displacementScale: 'number',
      emissive: 'Color',
      emissiveIntensity: 'number',
      emissiveMap: 'Texture | null',
      envMap: 'Texture | null',
      flatShading: 'boolean',
      fog: 'boolean',
      lightMap: 'Texture | null',
      lightMapIntensity: 'number',
      map: 'Texture | null',
      metal: 'boolean',
      normalMap: 'Texture | null',
      normalMapType: 'types.NormalMapTypes',
      normalScale: 'Vector2',
      reflectivity: 'number',
      refractionRatio: 'number',
      shininess: 'number',
      specular: 'Color',
      specularMap: 'Texture | null',
      // type: 'string',
      wireframe: 'boolean',
      wireframeLinecap: 'string',
      wireframeLinejoin: 'string',
      wireframeLinewidth: 'number'
    },
    proto: 'Material'
  },
  MeshPhysicalMaterial: {
    cls: THREE.MeshPhysicalMaterial,
    members: {
      anisotropy: 'number',
      anisotropyMap: 'Texture | null',
      anisotropyRotation: 'number',
      attenuationColor: 'Color',
      attenuationDistance: 'number',
      clearcoat: 'number',
      clearcoatMap: 'Texture | null',
      clearcoatNormalMap: 'Texture | null',
      clearcoatNormalScale: 'Vector2',
      clearcoatRoughness: 'number',
      clearcoatRoughnessMap: 'Texture | null',
      // defines: '{ [key: string]: any }',
      ior: 'number',
      iridescence: 'number',
      iridescenceIOR: 'number',
      iridescenceMap: 'Texture | null',
      iridescenceThicknessMap: 'Texture | null',
      iridescenceThicknessRange: 'number[]',
      reflectivity: 'number',
      sheen: 'number',
      sheenColor: 'Color',
      sheenColorMap: 'Texture | null',
      sheenRoughness: 'number',
      sheenRoughnessMap: 'Texture | null',
      specularColor: 'Color',
      specularColorMap: 'Texture | null',
      specularIntensity: 'number',
      specularIntensityMap: 'Texture | null',
      thickness: 'number',
      thicknessMap: 'Texture | null',
      transmission: 'number',
      transmissionMap: 'Texture | null',
      // type: 'string'
    },
    proto: 'MeshStandardMaterial'
  },
  MeshStandardMaterial: {
    cls: THREE.MeshStandardMaterial,
    isMeshStandardMaterial: true,
    members: {
      alphaMap: 'Texture | null',
      aoMap: 'Texture | null',
      aoMapIntensity: 'number',
      bumpMap: 'Texture | null',
      bumpScale: 'number',
      color: 'Color',
      // defines: '{ [key: string]: any }', 
      displacementBias: 'number',
      displacementMap: 'Texture | null',
      displacementScale: 'number',
      emissive: 'Color',
      emissiveIntensity: 'number',
      emissiveMap: 'Texture | null',
      envMap: 'Texture | null',
      envMapIntensity: 'number',
      flatShading: 'boolean',
      fog: 'boolean',
      lightMap: 'Texture | null',
      lightMapIntensity: 'number',
      map: 'Texture | null',
      metalness: 'number',
      metalnessMap: 'Texture | null',
      normalMap: 'Texture | null',
      normalMapType: 'types.NormalMapTypes',
      normalScale: 'Vector2',
      roughness: 'number',
      roughnessMap: 'Texture | null',
      // type: 'string',
      wireframe: 'boolean',
      wireframeLinecap: 'string',
      wireframeLinejoin: 'string',
      wireframeLinewidth: 'number'
    },
    proto: 'Material'
  },
  MeshToonMaterial: {
    cls: THREE.MeshToonMaterial,
    members: {
      alphaMap: 'Texture | null',
      aoMap: 'Texture | null',
      aoMapIntensity: 'number',
      bumpMap: 'Texture | null',
      bumpScale: 'number',
      color: 'Color',
      // defines: '{ [key: string]: any }',
      displacementBias: 'number',
      displacementMap: 'Texture | null',
      displacementScale: 'number',
      emissive: 'Color',
      emissiveIntensity: 'number',
      emissiveMap: 'Texture | null',
      fog: 'boolean',
      gradientMap: 'Texture | null',
      lightMap: 'Texture | null',
      lightMapIntensity: 'number',
      map: 'Texture | null',
      normalMap: 'Texture | null',
      normalMapType: 'types.NormalMapTypes',
      normalScale: 'Vector2',
      // type: 'string',
      wireframe: 'boolean',
      wireframeLinecap: 'string',
      wireframeLinejoin: 'string',
      wireframeLinewidth: 'number'
    },
    proto: 'Material'
  },
  Object3D: {
    cls: THREE.Object3D,
    isObject3D: true,
    members: {
      up: 'Vector3',
      position: 'Vector3',
      rotation: 'Euler',
      scale: 'Vector3',
      visible: 'Boolean',
    },
  },
  OrthographicCamera: {
    cls: THREE.OrthographicCamera,
    isOrthographicCamera: true,
    members: {
      bottom: 'number', far: 'number', left: 'number', near: 'number', right: 'number', top: 'number',
      // type: "string | 'OrthographicCamera'",
      //   view: `null | {
      //     enabled: boolean;
      //     fullWidth: number;
      //     fullHeight: number;
      //     offsetX: number;
      //     offsetY: number;
      //     width: number;
      //     height: number;
      // }`,
      zoom: 'number'
    },
    proto: 'Camera'
  },
  PerspectiveCamera: {
    cls: THREE.PerspectiveCamera,
    isPerspectiveCamera: true,
    members: {
      aspect: 'number', far: 'number', filmGauge: 'number', filmOffset: 'number', focus: 'number', fov: 'number', near: 'number',
      //   type: "string | 'PerspectiveCamera'",
      //   view: `null | {
      //     enabled: boolean;
      //     fullWidth: number;
      //     fullHeight: number;
      //     offsetX: number;
      //     offsetY: number;
      //     width: number;
      //     height: number;
      // }`,
      zoom: 'number'
    },
    proto: 'Camera'
  },
  PointLight: {
    cls: THREE.PointLight,
    members: {
      castShadow: 'boolean', decay: 'number', distance: 'number', intensity: 'number', power: 'number',
      // shadow: 'PointLightShadow',
      'shadow.mapSize.x': 'Number',
      'shadow.mapSize.y': 'Number',
      'shadow.bias': 'Number',
      // type: 'string'
    },
    proto: 'Light'
  },
  PointLightShadow: {
    cls: THREE.PointLightShadow,
    isPointLightShadow: true,
    members: {},
    proto: 'LightShadow'
  },
  Points: {
    cls: THREE.Points,
    members: {
      material: 'Material',
    },
    proto: 'Object3D',
  },
  PointsMaterial: {
    cls: THREE.PointsMaterial,
    members: {
      alphaMap: 'Texture | null', color: 'Color', fog: 'boolean', map: 'Texture | null', size: 'number', sizeAttenuation: 'boolean',
      // type: 'string'
    },
    proto: 'Material'
  },
  PositionalAudio: {
    cls: THREE.PositionalAudio,
    members: {},
    proto: 'Audio'
  },
  RawShaderMaterial: {
    cls: THREE.RawShaderMaterial,
    members: {},
    proto: 'ShaderMaterial'
  },
  RectAreaLight: {
    cls: THREE.RectAreaLight,
    isRectAreaLight: true,
    members: {
      height: 'number', intensity: 'number', power: 'number',
      // type: "string | 'RectAreaLight'",
      width: 'number'
    },
    proto: 'Light'
  },
  Scene: {
    cls: THREE.Scene,
    isScene: true,
    members: {
      background: 'Color | Texture | CubeTexture | null',
      backgroundBlurriness: 'number',
      backgroundIntensity: 'number',
      environment: 'Texture | null',
      fog: 'FogBase | null',
      overrideMaterial: 'Material | null',
      // type: "'Scene'"
    },
    proto: 'Object3D'
  },
  ShaderMaterial: {
    cls: THREE.ShaderMaterial,
    isShaderMaterial: true,
    members: {
      // clipping: 'boolean',
      //   defaultAttributeValues: 'any',
      //   defines: '{ [key: string]: any }', derivatives: 'any',
      //   extensions: `{
      //     derivatives: boolean;
      //     fragDepth: boolean;
      //     drawBuffers: boolean;
      //     shaderTextureLOD: boolean;
      // }`,
      fog: 'boolean',
      // fragmentShader: 'string',
      // glslVersion: 'types.GLSLVersion | null',
      // index0AttributeName: 'string | undefined', lights: 'boolean', linewidth: 'number',
      // type: 'string',
      // uniforms: '{ [uniform: string]: IUniform }',
      // uniformsGroups: 'UniformsGroup[]',
      // uniformsNeedUpdate: 'boolean',
      // vertexShader: 'string',
      wireframe: 'boolean',
      wireframeLinewidth: 'number'
    },
    proto: 'Material'
  },
  ShadowMaterial: {
    cls: THREE.ShadowMaterial,
    members: {
      color: 'Color', fog: 'boolean', transparent: 'boolean',
      // type: 'string'
    },
    proto: 'Material'
  },
  Source: {
    cls: THREE.Source,
    isSource: true,
    members: {
      // data: 'any', id: 'number', uuid: 'string', version: 'number'
    }
  },
  SphericalHarmonics3: {
    cls: THREE.SphericalHarmonics3,
    isSphericalHarmonics3: true,
    members: { coefficients: 'Vector3[]' },
  },
  SpotLight: {
    cls: THREE.SpotLight,
    isSpotLight: true,
    members: {
      angle: 'number', castShadow: 'boolean', decay: 'number', distance: 'number', intensity: 'number', map: 'Texture | null', penumbra: 'number', position: 'Vector3', power: 'number',
      // shadow: 'SpotLightShadow',
      'shadow.mapSize.x': 'Number',
      'shadow.mapSize.y': 'Number',
      'shadow.bias': 'Number',
      target: 'Object3D',
      // type: "string | 'SpotLight'"
    },
    proto: 'Light'
  },
  SpotLightShadow: {
    cls: THREE.SpotLightShadow,
    isSpotLightShadow: true,
    members: { camera: 'PerspectiveCamera', focus: 'number' },
    proto: 'LightShadow'
  },
  SpriteMaterial: {
    cls: THREE.SpriteMaterial,
    isSpriteMaterial: true,
    members: {
      alphaMap: 'Texture | null', color: 'Color', fog: 'boolean', map: 'Texture | null', rotation: 'number', sizeAttenuation: 'boolean', transparent: 'boolean',
      // type: 'string'
    },
    proto: 'Material'
  },
  StereoCamera: {
    cls: THREE.StereoCamera,
    members: {
      aspect: 'number', cameraL: 'PerspectiveCamera', cameraR: 'PerspectiveCamera', eyeSep: 'number',
      // type: "'StereoCamera'"
    },
    proto: 'Camera'
  },
  Texture: {
    cls: THREE.Texture,
    isTexture: true,
    members: {
      anisotropy: 'number', center: 'Vector2', channel: 'number', colorSpace: 'types.ColorSpace', encoding: 'types.TextureEncoding', flipY: 'boolean', format: 'types.WebGL1PixelFormat | types.WebGL2PixelFormat | types.DeepTexturePixelFormat | types.CompressedPixelFormat', generateMipmaps: 'boolean',
      // id: 'number',
      image: 'Image',
      internalFormat: 'types.PixelFormatGPU | null',
      // isRenderTargetTexture: 'boolean',
      magFilter: 'types.MagnificationTextureFilter', mapping: 'types.Mapping | types.CubeTextureMapping', matrix: 'Matrix3',
      // matrixAutoUpdate: 'boolean', minFilter: 'types.MinificationTextureFilter', mipmaps: 'any[]',
      // name: 'string',
      // needsPMREMUpdate: 'boolean',
      offset: 'Vector2',
      // onUpdate: '() => void',
      premultiplyAlpha: 'boolean', repeat: 'Vector2', rotation: 'number',
      // source: 'Source',
      type: 'types.TextureDataType',
      unpackAlignment: 'number',
      // userData: 'any',
      // uuid: 'string', version: 'number',
      wrapS: 'types.Wrapping', wrapT: 'types.Wrapping'
    },
    proto: 'EventDispatcher'
  },
  VideoTexture: {
    cls: THREE.VideoTexture,
    isVideoTexture: true,
    members: { generateMipmaps: 'boolean', magFilter: 'types.MagnificationTextureFilter', minFilter: 'types.MinificationTextureFilter' },
    proto: 'Texture'
  }
}

export const nodes = {
  AONode: {
    cls: Nodes.AONode,
    group: 'lighting',
    members: { aoNode: 'Node | null' },
    proto: 'LightingNode'
  },
  AnalyticLightNode: {
    cls: Nodes.AnalyticLightNode,
    group: 'lighting',
    members: { colorNode: 'Node', light: 'Light | null' },
    proto: 'LightingNode'
  },
  ArrayElementNode: {
    cls: Nodes.ArrayElementNode,
    group: 'utils',
    members: { indexNode: 'Node', node: 'Node' },
    proto: 'TempNode'
  },
  ArrayUniformNode: {
    cls: Nodes.ArrayUniformNode,
    group: 'core',
    isArrayUniformNode: true,
    members: { nodes: 'Node[]' },
    proto: 'UniformNode'
  },
  AttributeNode: {
    cls: Nodes.AttributeNode,
    group: 'core',
    members: {},
    proto: 'Node'
  },
  BitangentNode: {
    cls: Nodes.BitangentNode,
    group: 'accessors',
    members: { scope: 'types.BitangentNodeScope' },
    proto: 'Node'
  },
  BlendModeNode: {
    cls: Nodes.BlendModeNode,
    group: 'display',
    members: { baseNode: 'Node', blendMode: 'types.BlendMode', blendNode: 'Node' },
    proto: 'TempNode'
  },
  BufferNode: {
    cls: Nodes.BufferNode,
    group: 'accessors',
    isBufferNode: true,
    members: { bufferCount: 'number', bufferType: 'string' },
    proto: 'UniformNode'
  },
  BypassNode: {
    cls: Nodes.BypassNode,
    group: 'core',
    isBypassNode: true,
    members: { callNode: 'Node', outputNode: 'Node' },
    proto: 'Node'
  },
  CacheNode: {
    cls: Nodes.CacheNode,
    group: 'core',
    isCacheNode: true,
    members: { cache: 'NodeCache', node: 'Node' },
    proto: 'Node'
  },
  CameraNode: {
    cls: Nodes.CameraNode,
    group: 'accessors',
    members: { scope: 'types.CameraNodeScope' },
    proto: 'Object3DNode'
  },
  CheckerNode: {
    cls: Nodes.CheckerNode,
    group: 'procedural',
    members: { uvNode: 'Node' },
    proto: 'TempNode'
  },
  CodeNode: {
    cls: Nodes.CodeNode,
    group: 'code',
    isCodeNode: true,
    members: { code: 'string' },
    proto: 'Node'
  },
  ColorAdjustmentNode: {
    cls: Nodes.ColorAdjustmentNode,
    group: 'display',
    members: { adjustmentNode: 'Node', colorNode: 'Node', method: 'types.ColorAdjustmentMethod' },
    proto: 'TempNode'
  },
  ColorSpaceNode: {
    cls: Nodes.ColorSpaceNode,
    group: 'display',
    members: { method: 'types.ColorSpaceNodeMethod', node: 'Node' },
    proto: 'TempNode'
  },
  ComputeNode: {
    cls: Nodes.ComputeNode,
    group: 'gpgpu',
    isComputeNode: true,
    members: { count: 'number', dispatchCount: 'number', workgroupSize: 'number[]' },
    proto: 'Node'
  },
  CondNode: {
    cls: Nodes.CondNode,
    group: 'math',
    members: { condNode: 'Node', elseNode: 'Node', ifNode: 'Node' },
    proto: 'Node'
  },
  ConstNode: {
    cls: Nodes.ConstNode,
    group: 'core',
    isConstNode: true,
    members: {},
    proto: 'InputNode'
  },
  ContextNode: {
    cls: Nodes.ContextNode,
    group: 'core',
    isContextNode: true,
    members: { context: 'Object', node: 'Node' },
    proto: 'Node'
  },
  ConvertNode: {
    cls: Nodes.ConvertNode,
    group: 'utils',
    members: { convertTo: 'types.NodeTypeOption', node: 'Node' },
    proto: 'Node'
  },
  CubeTextureNode: {
    cls: Nodes.CubeTextureNode,
    group: 'accessors',
    isCubeTextureNode: true,
    members: { levelNode: 'Node | null', uvNode: 'Node | null', value: 'CubeTexture' },
    proto: 'TextureNode'
  },
  EnvironmentNode: {
    cls: Nodes.EnvironmentNode,
    group: 'lighting',
    members: { envNode: 'Node | null' },
    proto: 'LightingNode'
  },
  EquirectUVNode: {
    cls: Nodes.EquirectUVNode,
    group: 'utils',
    members: {},
    proto: 'TempNode'
  },
  ExpressionNode: {
    cls: Nodes.ExpressionNode,
    group: 'code',
    members: { snipped: 'string' },
    proto: 'TempNode'
  },
  FogExp2Node: {
    cls: Nodes.FogExp2Node,
    group: 'fog',
    isFogExp2Node: true,
    members: { densityNode: 'Node' },
    proto: 'FogNode'
  },
  FogNode: {
    cls: Nodes.FogNode,
    group: 'fog',
    isFogNode: true,
    members: { colorNode: 'Node', factorNode: 'Node' },
    proto: 'Node'
  },
  FogRangeNode: {
    cls: Nodes.FogRangeNode,
    group: 'fog',
    isFogRangeNode: true,
    members: { farNode: 'Node', nearNode: 'Node' },
    proto: 'FogNode'
  },
  FrontFacingNode: {
    cls: Nodes.FrontFacingNode,
    group: 'display',
    isFrontFacingNode: true,
    members: {},
    proto: 'Node'
  },
  // FunctionCallNode: {
  //   cls: Nodes.FunctionCallNode,
  //   group: 'code',
  //   members: {
  //     functionNode: 'FunctionNode<P>',
  //     parameters: '{ [name: string]: Node }'
  //   },
  //   proto: 'TempNode'
  // },
  FunctionNode: {
    cls: Nodes.FunctionNode,
    group: 'code',
    members: { keywords: '{ [key: string]: Node }' },
    proto: 'CodeNode'
  },
  HemisphereLightNode: {
    cls: Nodes.HemisphereLightNode,
    group: 'lighting',
    members: { groundColorNode: 'Node', lightDirectionNode: 'Node', lightPositionNode: 'Object3DNode' },
    proto: 'AnalyticLightNode'
  },
  InputNode: {
    // cls: Nodes.InputNode,
    group: 'core',
    isInputNode: true,
    members: { precision: 'types.Precision | null', value: 'Color | Vector2 | Vector3 | Vector4 | Matrix3 | Matrix4 | boolean | number' },
    proto: 'Node'
  },
  // InstanceNode: {
  //   cls: Nodes.InstanceNode,
  //   group: 'accessors',
  //   members: { instanceMatrixNode: 'Node', instanceMesh: 'InstancedMesh' },
  //   proto: 'Node'
  // },
  // LightingContextNode: {
  //   cls: Nodes.LightingContextNode,
  //   group: 'lighting',
  //   members: { lightingModelNode: 'LightingModelNode | null' },
  //   proto: 'ContextNode'
  // },
  LightingNode: {
    cls: Nodes.LightingNode,
    group: 'lighting',
    members: {},
    proto: 'Node'
  },
  LightsNode: {
    cls: Nodes.LightsNode,
    group: 'lighting',
    members: { lightNodes: 'LightingNode[]' },
    proto: 'Node'
  },
  LineBasicNodeMaterial: {
    cls: Nodes.LineBasicNodeMaterial,
    group: 'materials',
    isLineBasicNodeMaterial: true,
    members: {},
    proto: ['LineBasicMaterial', 'NodeMaterial'],
  },
  MatcapUVNode: {
    cls: Nodes.MatcapUVNode,
    group: 'utils',
    members: {},
    proto: 'TempNode'
  },
  MaterialNode: {
    cls: Nodes.MaterialNode,
    group: 'accessors',
    members: { scope: 'types.MaterialNodeScope' },
    proto: 'Node'
  },
  MaterialReferenceNode: {
    cls: Nodes.MaterialReferenceNode,
    group: 'accessors',
    members: {},
    proto: 'ReferenceNode'
  },
  MathNode: {
    cls: Nodes.MathNode,
    group: 'math',
    members: { aNode: 'Node', bNode: 'Node | null', cNode: 'Node | null', method: 'types.MathNodeMethod1 | types.MathNodeMethod2 | types.MathNodeMethod3' },
    proto: 'TempNode'
  },
  MaxMipLevelNode: {
    cls: Nodes.MaxMipLevelNode,
    group: 'utils',
    members: { textureNode: 'TextureNode' },
    proto: 'UniformNode'
  },
  MeshBasicNodeMaterial: {
    cls: Nodes.MeshBasicNodeMaterial,
    group: 'materials',
    isMeshBasicNodeMaterial: true,
    members: { lights: 'true' },
    proto: ['MeshBasicMaterial', 'NodeMaterial'],
  },
  MeshPhysicalNodeMaterial: {
    cls: Nodes.MeshPhysicalNodeMaterial,
    group: 'materials',
    members: { attenuationColorNode: 'Node | null', attenuationDistanceNode: 'Node | null', iridescenceIORNode: 'null | Node', iridescenceNode: 'null | CheckerNode', iridescenceThicknessNode: 'null | Node', specularColorNode: 'Node | null', specularIntensityNode: 'Node | null', thicknessNode: 'Node | null', transmissionNode: 'Node | null' },
    proto: ['MeshPhysicalMaterial', 'MeshStandardNodeMaterial'],
  },
  MeshStandardNodeMaterial: {
    cls: Nodes.MeshStandardNodeMaterial,
    group: 'materials',
    isMeshStandardNodeMaterial: true,
    members: { clearcoatNode: 'Node | null', clearcoatRoughnessNode: 'Node | null', emissiveNode: 'Node | null', metalnessNode: 'Node | null', roughnessNode: 'Node | null' },
    proto: ['MeshStandardMaterial', 'NodeMaterial'],
  },
  ModelViewProjectionNode: {
    cls: Nodes.ModelViewProjectionNode,
    group: 'accessors',
    members: {},
    proto: 'Node'
  },
  Node: {
    cls: Nodes.Node,
    group: 'core',
    isNode: true,
    members: {
      // id: 'number',
      // nodeType: 'NodeTypeOption | null',
      // type: 'string',
      // updateType: 'NodeUpdateTypeOption',
      // uuid: 'string'
    }
  },
  NodeAttribute: {
    cls: Nodes.NodeAttribute,
    group: 'core',
    isNodeAttribute: true,
    members: { name: 'string', type: 'string' }
  },
  // NodeBuilder: {
  //   cls: Nodes.NodeBuilder,
  //   group: 'core',
  //   members: { buildStage: 'BuildStageOption | null', cache: 'NodeCache', computeShader: 'string', flowsData: 'any', fogNode: 'FogNode', fragmentShader: 'string', geometry: 'BufferGeometry', globalCache: 'NodeCache', hashNodes: '{ [hash: string]: Node }', lightsNode: 'LightsNode', material: 'Material', nodes: 'Node[]', object: 'Object3D', parser: 'NodeParser', renderer: 'Renderer', shaderStage: 'NodeShaderStageOption | null', stack: 'Node[]', updateNodes: 'Node[]', vertexShader: 'string' }
  // },
  NodeCache: {
    cls: Nodes.NodeCache,
    group: 'core',
    members: {
      // id: 'number', nodesData: 'WeakMap<Node, NodeData>' 
    }
  },
  NodeCode: {
    cls: Nodes.NodeCode,
    group: 'core',
    isNodeCode: true,
    members: {}
  },
  // NodeFrame: {
  //   cls: Nodes.NodeFrame,
  //   group: 'core',
  //   members: { camera: 'null | Camera', deltaTime: 'number', frameId: 'number', material: 'null | Material', object: 'null | Object3D', renderer: 'null | Renderer', startTime: 'null | number', time: 'number' }
  // },
  NodeFunction: {
    // cls: Nodes.NodeFunction,
    group: 'core',
    isNodeFunction: true,
    members: { inputs: 'NodeFunctionInput[]', name: 'string', presicion: 'string', type: 'string' }
  },
  NodeFunctionInput: {
    cls: Nodes.NodeFunctionInput,
    group: 'core',
    isNodeFunctionInput: true,
    members: { count: 'null | number', isConst: 'boolean', qualifier: 'string' }
  },
  NodeKeywords: {
    cls: Nodes.NodeKeywords,
    group: 'core',
    members: {
      keywords: 'string[]',
      // keywordsCallback: '{ [name: string]: (name: string) => Node }',
      nodes: 'Node[]'
    }
  },
  // NodeLoader: {
  //   cls: Nodes.NodeLoader,
  //   group: 'loaders',
  //   members: {},
  //   proto: 'Loader<NodeLoaderResult>'
  // },
  NodeMaterial: {
    cls: Nodes.NodeMaterial,
    group: 'materials',
    isNodeMaterial: true,
    members: {
      alphaTestNode: 'Node | null', backdropAlphaNode: 'Node | null', backdropNode: 'Node | null', colorNode: 'Node | null', envNode: 'Node | null', lights: 'true', lightsNode: 'Node | null', normalNode: 'Node | null', normals: 'true', opacityNode: 'Node | null', positionNode: 'Node | null',
      // type: 'string'
    },
    proto: 'ShaderMaterial'
  },
  // NodeMaterialLoader: {
  //   cls: Nodes.NodeMaterialLoader,
  //   group: 'loaders',
  //   members: { nodes: 'NodeLoaderResult' },
  //   proto: 'MaterialLoader'
  // },
  // NodeObjectLoader: {
  //   cls: Nodes.NodeObjectLoader,
  //   group: 'loaders',
  //   members: {},
  //   proto: 'ObjectLoader'
  // },
  // NodeParser: {
  //   // cls: Nodes.NodeParser,
  //   group: 'core',
  //   members: {}
  // },
  NodeUniform: {
    cls: Nodes.NodeUniform,
    group: 'core',
    isNodeUniform: true,
    members: { name: 'string', needsUpdate: 'boolean', node: 'InputNode', type: 'string', value: 'NodeValueOption' }
  },
  NodeVar: {
    cls: Nodes.NodeVar,
    group: 'core',
    isNodeVar: true,
    members: { name: 'string', type: 'string' }
  },
  NodeVarying: {
    cls: Nodes.NodeVarying,
    group: 'core',
    isNodeVarying: true,
    members: { needsInterpolation: 'false' },
    proto: 'NodeVar'
  },
  NormalMapNode: {
    cls: Nodes.NormalMapNode,
    group: 'display',
    members: { node: 'Node', normalMapType: 'types.NormalMapTypes', scaleNode: 'Node | null' },
    proto: 'TempNode'
  },
  NormalNode: {
    cls: Nodes.NormalNode,
    group: 'accessors',
    members: { scope: 'types.NormalNodeScope' },
    proto: 'Node'
  },
  Object3DNode: {
    cls: Nodes.Object3DNode,
    group: 'accessors',
    members: { object3d: 'Object3D | null', scope: 'types.Object3DNodeScope' },
    proto: 'Node'
  },
  OperatorNode: {
    cls: Nodes.OperatorNode,
    group: 'math',
    members: { aNode: 'Node', bNode: 'Node', op: 'types.OperatorNodeOp' },
    proto: 'TempNode'
  },
  OscNode: {
    cls: Nodes.OscNode,
    group: 'utils',
    members: { method: 'types.OscNodeMethod', timeNode: 'Node' },
    proto: 'Node'
  },
  PointLightNode: {
    cls: Nodes.PointLightNode,
    group: 'lighting',
    members: { coneCosNode: 'Node', cutoffDistanceNode: 'Node', decayExponentNode: 'Node', directionNode: 'Node', penumbraCosNode: 'Node' },
    proto: 'AnalyticLightNode'
  },
  PointUVNode: {
    cls: Nodes.PointUVNode,
    group: 'accessors',
    isPointUVNode: true,
    members: {},
    proto: 'Node'
  },
  PointsNodeMaterial: {
    cls: Nodes.PointsNodeMaterial,
    group: 'materials',
    members: { alphaTestNode: 'Node | null', colorNode: 'Node | null', isPointsNodeMateria: 'true', lightNode: 'Node | null', opacityNode: 'Node | null', positionNode: 'Node | null', sizeNode: 'Node | null' },
    proto: ['PointsMaterial', 'NodeMaterial']
  },
  PositionNode: {
    cls: Nodes.PositionNode,
    group: 'accessors',
    members: { scope: 'types.PositionNodeScope' },
    proto: 'Node'
  },
  PosterizeNode: {
    cls: Nodes.PosterizeNode,
    group: 'display',
    members: { sourceNode: 'Node', stepsNode: 'Node' },
    proto: 'Node'
  },
  PropertyNode: {
    cls: Nodes.PropertyNode,
    group: 'core',
    members: {},
    proto: 'Node'
  },
  RangeNode: {
    cls: Nodes.RangeNode,
    group: 'geometry',
    members: { max: 'number | Color | Vector2 | Vector3 | Vector4', min: 'number | Color | Vector2 | Vector3 | Vector4' },
    proto: 'Node'
  },
  ReferenceNode: {
    cls: Nodes.ReferenceNode,
    group: 'accessors',
    members: { node: 'Node | null', object: 'Object', property: 'string', uniformType: 'string' },
    proto: 'Node'
  },
  ReflectVectorNode: {
    cls: Nodes.ReflectVectorNode,
    group: 'accessors',
    members: {},
    proto: 'Node'
  },
  RemapNode: {
    cls: Nodes.RemapNode,
    group: 'utils',
    members: { doClamp: 'boolean', inHighNode: 'Node', inLowNode: 'Node', node: 'Node', outHighNode: 'Node', outLowNode: 'Node' },
    proto: 'Node'
  },
  RotateUVNode: {
    cls: Nodes.RotateUVNode,
    group: 'utils',
    members: { centerNode: 'Node', rotationNode: 'Node', uvNode: 'Node' },
    proto: 'TempNode'
  },
  SkinningNode: {
    cls: Nodes.SkinningNode,
    group: 'accessors',
    members: { bindMatrixInverseNode: 'Node', bindMatrixNode: 'Node', boneMatricesNode: 'Node', skinIndexNode: 'Node', skinWeightNode: 'Node' },
    proto: 'Node'
  },
  SpecularMIPLevelNode: {
    cls: Nodes.SpecularMIPLevelNode,
    group: 'utils',
    members: { roughnessNode: 'Node | null', textureNode: 'TextureNode' },
    proto: 'Node'
  },
  SpriteNodeMaterial: {
    cls: Nodes.SpriteNodeMaterial,
    group: 'materials',
    isSpriteNodeMaterial: true,
    members: { alphaTestNode: 'Node | null', colorNode: 'Node | null', lightNode: 'Node | null', opacityNode: 'Node | null', positionNode: 'Node | null', rotationNode: 'Node | null', scaleNode: 'Node | null' },
    proto: ['SpriteMaterial', 'NodeMaterial']
  },
  SpriteSheetUVNode: {
    cls: Nodes.SpriteSheetUVNode,
    group: 'utils',
    members: { countNode: 'Node', frameNode: 'Node', uvNode: 'Node' },
    proto: 'Node'
  },
  // StackNode: {
  //   cls: Nodes.StackNode,
  //   group: 'core',
  //   isStackNode: true,
  //   members: { nodes: 'Node[]', outputNode: 'Node | null' },
  //   proto: 'Node'
  // },
  // StorageBufferNode: {
  //   // cls: Nodes.StorageBufferNode,
  //   group: 'accessors',
  //   members: {},
  //   proto: 'BufferNode'
  // },
  TangentNode: {
    cls: Nodes.TangentNode,
    group: 'accessors',
    members: { scope: 'types.TangentNodeScope' },
    proto: 'Node'
  },
  TempNode: {
    cls: Nodes.TempNode,
    group: 'core',
    isTempNode: true,
    members: {},
    proto: 'Node'
  },
  TextureNode: {
    cls: Nodes.TextureNode,
    group: 'accessors',
    isTextureNode: true,
    members: { levelNode: 'Node | null', uvNode: 'Node | null', value: 'Texture' },
    proto: 'UniformNode'
  },
  TimerNode: {
    cls: Nodes.TimerNode,
    group: 'utils',
    members: {
      scale: 'number',
      // scope: 'TimerNodeScope'
    },
    proto: 'UniformNode'
  },
  ToneMappingNode: {
    cls: Nodes.ToneMappingNode,
    group: 'display',
    members: { colorNode: 'Node | null', exposureNode: 'Node', toneMapping: 'types.ToneMapping' },
    proto: 'TempNode'
  },
  TriplanarTexturesNode: {
    cls: Nodes.TriplanarTexturesNode,
    group: 'utils',
    members: {
      normalNode: 'PositionNode',
      positionNode: 'PositionNode',
      scaleNode: 'Node',
      textureXNode: 'TextureNode',
      textureYNode: 'TextureNode | null',
      textureZNode: 'TextureNode | null'
    },
    proto: 'Node'
  },
  UVNode: {
    cls: Nodes.UVNode,
    group: 'accessors',
    isUVNode: true,
    members: { index: 'number' },
    proto: 'AttributeNode'
  },
  UniformNode: {
    cls: Nodes.UniformNode,
    group: 'core',
    isUniformNode: true,
    members: {},
    proto: 'InputNode'
  },
  // UserDataNode: {
  //   cls: Nodes.UserDataNode,
  //   group: 'accessors',
  //   members: { userData: 'NodeUserData | null' },
  //   proto: 'ReferenceNode<NodeUserData>'
  // },
  VarNode: {
    cls: Nodes.VarNode,
    group: 'core',
    members: { name: 'string | null', node: 'Node' },
    proto: 'Node'
  },
  VaryingNode: {
    cls: Nodes.VaryingNode,
    group: 'core',
    members: { name: 'string | null', node: 'Node' },
    proto: 'Node'
  },
  ViewportNode: {
    cls: Nodes.ViewportNode,
    group: 'display',
    isViewportNode: true,
    members: { scope: 'types.ViewportNodeScope' },
    proto: 'Node'
  }
}
