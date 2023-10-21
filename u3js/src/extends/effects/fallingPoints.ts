import { addEffectNode } from "./effectNode";

addEffectNode('FallingPoints', 'Falling Points',
  {
    in: {
      speed: 'Number',
      size: 'Number',
      maxCount: 'Number',
    },
  },
  `const worldPosition = this.getWorldPosition(new THREE.Vector3());
const initialPosition = world.combineBuffer(this, 'position', params.maxCount || 1000);
const geometry = new THREE.BufferGeometry();

this.traverse(function (child) {
  if (child.isMesh) {
    child.material.visible = false;
  }
} );

geometry.setAttribute( 'position', initialPosition.clone() );
geometry.attributes.position.setUsage( THREE.DynamicDrawUsage );

const size = params.size || 0.02;
const mesh = new THREE.Points( geometry, new THREE.PointsMaterial( { size, color: 0xffffff } ) );
const positions = geometry.attributes.position;
const count = positions.count;
const speed = params.speed || 5;
const minY = -worldPosition.y;
let resolve;
const promise = new Promise((rslv) => resolve = rslv);

mesh.onBeforeRender = () => {
  const delta = world.delta;
  let verticesDown = 0;

  for ( let i = 0; i < count; i ++ ) {
    const px = positions.getX( i );
    const py = positions.getY( i );
    const pz = positions.getZ( i );

    if ( py > minY ) {
      positions.setXYZ(
        i,
        px + 1.5 * ( 0.50 - Math.random() ) * speed * delta,
        py + 3.0 * ( 0.25 - Math.random() ) * speed * delta,
        pz + 1.5 * ( 0.50 - Math.random() ) * speed * delta
      );
    } else {
      verticesDown += 1;
    }
  }

  // all vertices down
  if ( verticesDown >= count ) {
    resolve();
  }
  positions.needsUpdate = true;
};
this.add(mesh);
await promise;
this.removeFromParent();
`);
