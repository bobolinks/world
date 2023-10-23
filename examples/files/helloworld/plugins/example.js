var l = Object.defineProperty;
var i = (e, t, o) => t in e ? l(e, t, { enumerable: !0, configurable: !0, writable: !0, value: o }) : e[t] = o;
var n = (e, t, o) => (i(e, typeof t != "symbol" ? t + "" : t, o), o);
const { U3JS: a } = window;
class d extends a.Box {
  constructor(o, c, s, r) {
    super(o, c, s, r);
    n(this, "isBoxTest", !0);
    this.type = "BoxTest";
  }
  get color() {
    return this.material.color;
  }
  set color(o) {
    this.material.color.copy(o);
  }
}
function x(e, t, o, c) {
  e("BoxTest", {
    create: ({ geometry: s, material: r } = {}) => new d(s, r),
    members: {
      color: "Color"
    },
    proto: "Box",
    group: "Entities.Custom Box component from plugin",
    icon: "box"
  });
}
export {
  x as pluginInstall
};
