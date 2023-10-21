import { Box3, Color, Vector3, } from 'three';
import { Text, TextProps, GlyphsGeometry } from 'troika-three-text';
import { addThreeClass } from './utils';

export const textMembers: { [key in keyof TextProps]: string; } = {
  text: 'String',
  anchorX: 'number|"left"|"center"|"right"',
  anchorY: 'number|"top"|"top-baseline"|"top-cap"|"top-ex"|"middle"|"bottom-baseline"|"bottom"',
  curveRadius: 'number',
  direction: '"auto"|"ltr"|"rtl"',
  font: 'string',
  fontSize: 'number',
  fontWeight: 'number|"normal" | "bold"',
  fontStyle: '"normal"|"italic"',
  letterSpacing: 'number',
  lineHeight: 'number|"normal"',
  maxWidth: 'number',
  overflowWrap: '"normal" | "break-word"',
  textAlign: '"left" | "right" | "center" | "justify"',
  textIndent: 'number',
  whiteSpace: '"normal"| "nowrap"',
  color: 'Color',
  outlineWidth: 'number',
  outlineColor: 'Color',
  outlineOpacity: 'number',
  outlineBlur: 'number',
  outlineOffsetX: 'number',
  outlineOffsetY: 'number',
  strokeWidth: 'number',
  strokeColor: 'Color',
  strokeOpacity: 'number',
  fillOpacity: 'number',
  depthOffset: 'number',
  clipRect: 'number[]',
  orientation: 'string',
  glyphGeometryDetail: 'number',
  sdfGlyphSize: 'number|null',
  gpuAccelerateSDF: 'boolean',
};

export class TextMesh extends Text {
  public readonly isTextMesh = true;

  constructor() {
    super();

    (this as any).type = 'TextMesh';

    this.text = 'text';
    this.font = '/assets/fonts/STFangsong.ttf';
    this.color = new Color();
    this.outlineColor = new Color();
    this.strokeColor = new Color();
  }

  serialize(json: any) {
    for (const [k, t] of Object.entries(textMembers)) {
      if (t === 'Color') {
        const v: any = (this as any)[k];
        json[k] = ((v instanceof Color) ? v : new Color(v)).toArray();
      } else {
        json[k] = (this as any)[k];
      }
    }

    json.geo = {
      detail: this.geometry.detail,
      curveRadius: this.geometry.curveRadius,
      groups: this.geometry.groups,
      boundingSphere: { center: this.geometry.boundingSphere.center.toArray(), radius: this.geometry.boundingSphere.radius },
      boundingBox: { min: this.geometry.boundingBox.min.toArray(), max: this.geometry.boundingBox.max.toArray() },
    };
  }

  deserialize(json: any) {
    const geo = new GlyphsGeometry();
    geo.copy(this.geometry);
    this.geometry = geo;

    if (json.geo) {
      geo.detail = json.geo.detail;
      geo.curveRadius = json.geo.curveRadius;
      geo.groups = json.geo.groups;
      geo.boundingSphere.set(new Vector3().fromArray(json.geo.boundingSphere.center), json.geo.boundingSphere.radius);
      geo.boundingBox = new Box3(new Vector3().fromArray(json.geo.boundingBox.min), new Vector3().fromArray(json.geo.boundingBox.max));
    }

    for (const [k, t] of Object.entries(textMembers)) {
      const v = json[k];
      if (v === undefined) {
        continue;
      }
      if (t === 'Color') {
        (this as any)[k] = new Color().fromArray(v);
      } else {
        (this as any)[k] = v;
      }
    }
    this.sync();
  }
}

addThreeClass('TextMesh', {
  // cls: TextMesh,
  create: () => new TextMesh(),
  members: textMembers as any,
  proto: 'Mesh',
  group: 'Text.Text',
  icon: 'text',
});
