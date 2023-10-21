import { Mesh, MeshBasicMaterial, OrthographicCamera, SphereGeometry } from "three";
import { PhysicalScene, TextMesh } from "./extends/three";

export class LoadingScene extends PhysicalScene {
  constructor() {
    super();

    this.name === 'loading';

    const camera = new OrthographicCamera(-5, 5, 5, -5);
    camera.near = 0.0001;
    camera.far = 1000;
    camera.position.set(0, 0, 4);
    this.add(camera);

    const sphere = new Mesh(new SphereGeometry(0.5), new MeshBasicMaterial({ color: 0x8888ff, wireframe: true }));
    sphere.onBeforeRender = () => {
      sphere.rotation.y -= 0.004;
    };
    this.add(sphere);

    const text = new TextMesh();
    text.text = 'Loading...';
    text.color = 0x888899;
    text.anchorX = 'center';
    text.fontSize = 0.16;
    text.position.set(0, -0.6, 0);
    this.add(text);
  }
}