var n = Object.defineProperty;
var i = (e, t, o) => t in e ? n(e, t, { enumerable: !0, configurable: !0, writable: !0, value: o }) : e[t] = o;
var l = (e, t, o) => (i(e, typeof t != "symbol" ? t + "" : t, o), o);
import { Box as a } from "u3js";
class u extends a {
  constructor(o, c, r, s) {
    super(o, c, r, s);
    l(this, "isBoxTest", !0);
    this.type = "BoxTest";
  }
  get color() {
    return this.material.color;
  }
  set color(o) {
    this.material.color.copy(o);
  }
}
function p(e, t, o, c) {
  e("BoxTest", {
    create: ({ geometry: r, material: s } = {}) => new u(r, s),
    members: {
      color: "Color"
    },
    group: "Entities.Custom Box component from plugin",
    icon: ""
  });
}
export {
  p as pluginInstall
};
