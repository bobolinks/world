/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Color, ExtrudeGeometry, Material, Object3DEventMap, ShapePath, Shape as ThreeShape } from "three";
import type { TextProps } from "troika-three-text";
// @ts-ignore
import { defineWorkerModule } from 'troika-worker-utils';
// @ts-ignore
import * as TextBuilder from 'troika-three-text/src/TextBuilder.js';
import { addThreeClass } from "./utils";
import { textMembers } from "./text";
import { Shape } from "./shape";

const typesetterWorkerModule: any = TextBuilder.typesetterWorkerModule;
const typesetInWorker = /*#__PURE__*/defineWorkerModule({
  name: 'Typesetter',
  dependencies: [
    typesetterWorkerModule,
  ],
  init(typesetter: any) {
    return function (args: any) {
      return new Promise(resolve => {
        typesetter.typeset(args, resolve)
      });
    }
  },
  getTransferables(result: any) {
    // Mark array buffers as transferable to avoid cloning during postMessage
    const transferables = [];
    for (const p in result) {
      if (result[p] && result[p].buffer) {
        transferables.push(result[p].buffer);
      }
    }
    return transferables;
  }
});

const tempColor = new Color()

// code from troika-three-text
let linkEl: any;
function toAbsoluteURL(path: string) {
  if (!linkEl) {
    linkEl = typeof document === 'undefined' ? {} : document.createElement('a');
  }
  linkEl.href = path;
  return linkEl.href;
}

type TextPropsEx = TextProps & { lang: string; font: any; colorRanges: any; includeCaretPositions: boolean };
const defaultFontProps: TextPropsEx = {
  font: '/assets/fonts/STFangsong.ttf',
  lang: 'en',
  fontSize: 0.1,
  fontWeight: 'normal',
  fontStyle: 'normal',
  letterSpacing: 0,
  lineHeight: 'normal',
  maxWidth: 1,
  direction: 'auto',
  textAlign: 'left',
  textIndent: 0,
  whiteSpace: 'normal',
  overflowWrap: 'normal',
  anchorX: 0,
  anchorY: 0,
  colorRanges: null,
  includeCaretPositions: true,
  sdfGlyphSize: 64,
  gpuAccelerateSDF: false,
} as any;

async function getTextShapes(args: Partial<TextPropsEx>): Promise<ThreeShape[]> {
  args = { ...defaultFontProps, ...args };
  const fonts = [];
  if (args.font) {
    fonts.push({ label: 'user', src: toAbsoluteURL(args.font) })
  }
  args.font = fonts

  // Normalize text to a string
  args.text = '' + args.text

  args.sdfGlyphSize = args.sdfGlyphSize || 64

  // Normalize colors
  if (args.colorRanges != null) {
    const colors: any = {}
    for (const key in args.colorRanges) {
      if (Object.hasOwn(args.colorRanges, key)) {
        let val = args.colorRanges[key]
        if (typeof val !== 'number') {
          val = tempColor.set(val).getHex()
        }
        colors[key] = val
      }
    }
    args.colorRanges = colors
  }

  Object.freeze(args)

  // Issue request to the typesetting engine in the worker
  const rs = await typesetInWorker(args);

  const { glyphIds, glyphFontIndices, fontData, glyphData, glyphPositions, fontSize, } = rs;
  const shapePath = new ShapePath();
  let positionsIdx = 0;

  glyphIds.forEach((glyphId: number, i: number) => {
    const fontIndex = glyphFontIndices[i];
    const { src: fontSrc, unitsPerEm } = fontData[fontIndex];
    const { path, } = glyphData[fontSrc][glyphId];

    const posX = glyphPositions[positionsIdx++];
    const posY = glyphPositions[positionsIdx++];
    const fontSizeScale = fontSize / unitsPerEm;

    const commands: string[] = path.replace(/([A-Z])/mg, (s: any, v: string) => `$${v}`).split('$').filter((e: any) => e);
    for (const command of commands) {
      const type = command[0];
      if (type === 'Z') {
        continue;
      }
      const values = command.substring(1).split(',').map((e, i) => (i % 2 ? posY : posX) + (Number.parseFloat(e) * fontSizeScale));
      if (type === 'M') {
        shapePath.moveTo(...values as [number, number]);
      } else if (type === 'L') {
        shapePath.lineTo(...values as [number, number]);
      } else if (type === 'Q') {
        shapePath.quadraticCurveTo(...values as [number, number, number, number]);
      } else if (type === 'C') {
        shapePath.bezierCurveTo(...values as [number, number, number, number, number, number]);
      }
    }
  });

  return shapePath.toShapes(false);
}

const artTextMembers = Object.fromEntries(Object.entries(textMembers).map(e => [`props.${e[0]}`, e[1]]));

export class Text3D<
  TMaterial extends Material = Material,
  TEventMap extends Object3DEventMap = Object3DEventMap
> extends Shape<ExtrudeGeometry, TMaterial, TEventMap, Omit<TextProps, ''>> {
  public readonly isText3D = true;

  constructor(geometry?: ExtrudeGeometry, material?: TMaterial) {
    super(geometry, material, {
      ...defaultFontProps,
      color: new Color(),
      strokeColor: new Color(),
      outlineColor: new Color(),
    }, 0, 0);

    (this as any).type = 'Text3D';
  }

  protected async rebuildShapes() {
    this.shapes = await getTextShapes(this.props);
    this.rebuildGeometry();
  }
}

addThreeClass('Text3D', {
  members: artTextMembers as any,
  proto: 'Shape',
  group: 'Text.3D Text',
  icon: 'text',
  create: ({ material, geometry }: any = {}) => new Text3D(geometry || new ExtrudeGeometry(), material),
});
