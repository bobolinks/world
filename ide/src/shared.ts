import { Project } from "./core/project";

export default new class extends Project {
  constructor() {
    super('shared');
  }
  createDefault(name: string): Project {
    const prj = new Project(name);
    const scene = prj.scenes.find(e => e.name === 'default') || prj.scene;
    this.scene = scene as any;
    this.scenes.length = 0;
    this.scenes.push(this.scene);
    return prj;
  }
}