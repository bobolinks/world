import { BackSide, BoxGeometry, DirectionalLight, MathUtils, Mesh, Object3D, PMREMGenerator, Scene, ShaderMaterial, Texture, UniformsUtils, Vector3, WebGLRenderTarget } from "three";
import { addThreeClass } from "./utils";

const shader = {

  uniforms: {
    'turbidity': { value: 2 },
    'rayleigh': { value: 1 },
    'mieCoefficient': { value: 0.005 },
    'mieDirectionalG': { value: 0.8 },
    'sunPosition': { value: new Vector3() },
    'up': { value: new Vector3(0, 1, 0) }
  },

  vertexShader: /* glsl */`
		uniform vec3 sunPosition;
		uniform float rayleigh;
		uniform float turbidity;
		uniform float mieCoefficient;
		uniform vec3 up;

		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying float vSunfade;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying float vSunE;

		// constants for atmospheric scattering
		const float e = 2.71828182845904523536028747135266249775724709369995957;
		const float pi = 3.141592653589793238462643383279502884197169;

		// wavelength of used primaries, according to preetham
		const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
		// this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
		// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
		const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

		// mie stuff
		// K coefficient for the primaries
		const float v = 4.0;
		const vec3 K = vec3( 0.686, 0.678, 0.666 );
		// MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
		const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

		// earth shadow hack
		// cutoffAngle = pi / 1.95;
		const float cutoffAngle = 1.6110731556870734;
		const float steepness = 1.5;
		const float EE = 1000.0;

		float sunIntensity( float zenithAngleCos ) {
			zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
			return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
		}

		vec3 totalMie( float T ) {
			float c = ( 0.2 * T ) * 10E-18;
			return 0.434 * c * MieConst;
		}

		void main() {

			vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
			vWorldPosition = worldPosition.xyz;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			gl_Position.z = gl_Position.w; // set z to camera.far

			vSunDirection = normalize( sunPosition );

			vSunE = sunIntensity( dot( vSunDirection, up ) );

			vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );

			float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );

			// extinction (absorbtion + out scattering)
			// rayleigh coefficients
			vBetaR = totalRayleigh * rayleighCoefficient;

			// mie coefficients
			vBetaM = totalMie( turbidity ) * mieCoefficient;

		}`,

  fragmentShader: /* glsl */`
		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying float vSunfade;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying float vSunE;

		uniform float mieDirectionalG;
		uniform vec3 up;

		// constants for atmospheric scattering
		const float pi = 3.141592653589793238462643383279502884197169;

		const float n = 1.0003; // refractive index of air
		const float N = 2.545E25; // number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)

		// optical length at zenith for molecules
		const float rayleighZenithLength = 8.4E3;
		const float mieZenithLength = 1.25E3;
		// 66 arc seconds -> degrees, and the cosine of that
		const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;

		// 3.0 / ( 16.0 * pi )
		const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
		// 1.0 / ( 4.0 * pi )
		const float ONE_OVER_FOURPI = 0.07957747154594767;

		float rayleighPhase( float cosTheta ) {
			return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
		}

		float hgPhase( float cosTheta, float g ) {
			float g2 = pow( g, 2.0 );
			float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
			return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
		}

		void main() {

			vec3 direction = normalize( vWorldPosition - cameraPosition );

			// optical length
			// cutoff angle at 90 to avoid singularity in next formula.
			float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );
			float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
			float sR = rayleighZenithLength * inverse;
			float sM = mieZenithLength * inverse;

			// combined extinction factor
			vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );

			// in scattering
			float cosTheta = dot( direction, vSunDirection );

			float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
			vec3 betaRTheta = vBetaR * rPhase;

			float mPhase = hgPhase( cosTheta, mieDirectionalG );
			vec3 betaMTheta = vBetaM * mPhase;

			vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
			Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );

			// nightsky
			float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]
			float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]
			vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
			vec3 L0 = vec3( 0.1 ) * Fex;

			// composition + solar disc
			float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
			L0 += ( vSunE * 19000.0 * Fex ) * sundisk;

			vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );

			vec3 retColor = pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );

			gl_FragColor = vec4( retColor, 1.0 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`

};

const _tmpSun = new Object3D();

export class SkyBox extends Mesh<BoxGeometry, ShaderMaterial> {
  public readonly isSkyBox = true;

  private _renderTarget?: WebGLRenderTarget<Texture>;
  private _pmremGenerator?: PMREMGenerator;
  private _sceneTmp = new Scene;
  private _sceneRoot?: Scene;
  private _sun?: DirectionalLight;
  private _sunPosition: Vector3;

  constructor(geometry?: BoxGeometry, material?: ShaderMaterial) {
    super(geometry || new BoxGeometry(1, 1, 1), material || new ShaderMaterial({
      name: 'SkyShader',
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: UniformsUtils.clone(shader.uniforms),
      side: BackSide,
      depthWrite: false
    }));

    (this as any).type = 'SkyBox';

    // default
    if (!geometry) {
      this.scale.multiplyScalar(1000);
    }
    if (!material) {
      this.material.uniforms['turbidity'].value = 10;
      this.material.uniforms['rayleigh'].value = 2;
      this.material.uniforms['mieCoefficient'].value = 0.005;
      this.material.uniforms['mieDirectionalG'].value = 0.8;
      this.material.uniforms['sunPosition'].value.copy(this.calSunPosition(2, 180));
    }
    this._sunPosition = this.material.uniforms['sunPosition'].value;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.onBeforeRender = async (renderer, scene, camera) => {
      this._sceneRoot = scene;
      if (this._sun && typeof this._sun === 'string') {
        this._sun = scene.getObjectByProperty('uuid', this._sun) as any;
      }
      if (!this._renderTarget) {
        // mark as pending
        this._renderTarget = 1 as any;
        this._pmremGenerator = new PMREMGenerator(renderer);
        this.updateRenderTarget();
      }
      if (this._sun && !this._sun.position.equals(this._sunPosition)) {
        this.updateSunPotision();
      }
    };
  }

  get turbidity() {
    return this.material.uniforms['turbidity'].value;
  }
  set turbidity(val: number) {
    this.material.uniforms['turbidity'].value = val;
  }

  get rayleigh() {
    return this.material.uniforms['rayleigh'].value;
  }
  set rayleigh(val: number) {
    this.material.uniforms['rayleigh'].value = val;
  }

  get mieCoefficient() {
    return this.material.uniforms['mieCoefficient'].value;
  }
  set mieCoefficient(val: number) {
    this.material.uniforms['mieCoefficient'].value = val;
  }

  get mieDirectionalG() {
    return this.material.uniforms['mieDirectionalG'].value;
  }
  set mieDirectionalG(val: number) {
    this.material.uniforms['mieDirectionalG'].value = val;
  }

  get sunPosition() {
    return this.material.uniforms['sunPosition'].value;
  }
  set sunPosition(val: Vector3) {
    this.material.uniforms['sunPosition'].value.copy(val);
  }

  get sun() {
    return _tmpSun;
  }
  set sun(obj: Object3D) {
    if (!(obj instanceof DirectionalLight)) {
      return;
    }
    this._sun = obj;
    this.updateSunPotision();
  }

  calSunPosition(elevation: number, azimuth: number) {
    const phi = MathUtils.degToRad(90 - elevation);
    const theta = MathUtils.degToRad(azimuth);

    const sun = new Vector3();
    sun.setFromSphericalCoords(1, phi, theta);

    return sun;
  }

  updateSunPotision() {
    if (typeof this._sun !== 'object') {
      return;
    }
    this.material.uniforms['sunPosition'].value.copy(this._sun.position);
    this.updateRenderTarget();
  }

  updateRenderTarget() {
    if (this._renderTarget !== undefined && typeof this._renderTarget === 'object') this._renderTarget.dispose();

    if (!this._pmremGenerator) {
      return;
    }

    const parent = this.parent;
    const index = parent ? parent.children.indexOf(this) : -1;
    if (parent) {
      parent.children.splice(index, 1);
    }
    this._sceneTmp.children.push(this);
    this._renderTarget = this._pmremGenerator.fromScene(this._sceneTmp);
    if (parent) {
      if (index !== -1) {
        parent.children.splice(index, 0, this);
      } else {
        parent.children.push(this);
      }
    }

    if (this._sceneRoot) {
      this._sceneRoot.background = this._renderTarget.texture;
      this._sceneRoot.environment = this._renderTarget.texture;
    }
  }

  serialize(json: any): void {
    json.scale = this.scale.toArray();
    json.turbidity = this.turbidity;
    json.rayleigh = this.rayleigh;
    json.mieCoefficient = this.mieCoefficient;
    json.mieDirectionalG = this.mieDirectionalG;
    json.sunPosition = this.sunPosition.toArray();
    if (this._sun) {
      json.sun = this._sun.uuid || this._sun;
    }
  }

  deserialize(json: any): void {
    this.scale.fromArray(json.scale);
    this.turbidity = json.turbidity;
    this.rayleigh = json.rayleigh;
    this.mieCoefficient = json.mieCoefficient;
    this.mieDirectionalG = json.mieDirectionalG;
    this.sunPosition.fromArray(json.sunPosition);
    if (json.sun) {
      this._sun = json.sun;
    }
    this.updateRenderTarget();
  }
}

addThreeClass('SkyBox',
  {
    members: {
      scale: 'Vector3',
      turbidity: 'Number',
      rayleigh: 'Number',
      mieCoefficient: 'Number',
      mieDirectionalG: 'Number',
      sun: 'Object3D',
    },
    proto: 'Object3D',
    group: 'Objects.Sky Box',
    icon: 'box',
    create: ({ geometry, material }: any = {}) => new SkyBox(geometry, material),
  }
);
