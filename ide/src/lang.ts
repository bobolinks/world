const zh = {
  Math: {
    '': 'Math',
    Numbers: {
      '': '数理',

      Symbols: {
        '': '符号',
      },
      Numbers: {
        '': '数字',
        Units: ['个', '十', '百', '千', '万', '十万', '千万', '亿',],
      },
      SequencesAndPatterns: { '': '序列' },
      SequencesAndShapes: { '': '序列和形状' },

      PositiveAndNegative: { '': '正数和负数' },
      ComparingNumbers: { '': '数值比较' },
      OrderingNumbers: { '': '数值排序' },
      Estimating: { '': '估算' },

      Rounding: { '': '四舍五入' },
      Factors: { '': '因子' },
      Multiples: { '': '倍数' },
      PrimeNumbers: { '': '素数' },

      PrimeFactors: { '': '素因子' },
      SquareNumbers: { '': '平方' },
      SquareRoots: { '': '平方根' },
      CubeNumbers: { '': '立方' },

      Fractions: { '': '分数' },
      ImproperFractionsAndMixed: { '': '假分数及繁分数' },
      EquivalentFractions: { '': '等值分数' },
      SimplifyingFractions: { '': '分数简化' },

      FindingAFractionOfAndAmount: { '': '分数求值' },
      ComparingFractions: { '': '分数比较' },
      ComparingUnitFractions: { '': '单位分数比较' },
      ComparingNonUnitFractions: { '': '非单位分数比较' },

      UsingTheLowestCommonDenominator: { '': '最小公分母' },
      AddingFractions: { '': '分数相加' },
      SubtractingFractions: { '': '分数相减' },
      MultiplyingFractions: { '': '分数相乘' },

      DividingFractions: { '': '分数相除' },
      DecimalNumbers: { '': '十进制' },
      ComparingAndOrderingDecimals: { '': '十进制比较和排序' },
      RoundingDecimals: { '': '十进制四舍五入' },

      AddingDecimals: { '': '十进制相加' },
      SubtractingDecimals: { '': '十进制相减' },
      Percentages: { '': '百分比' },
      CalculatingPercentages: { '': '百分比计算' },

      PercentagesChanges: { '': '百分比变换' },
      Ratio: { '': '比率' },
      Proportion: { '': '比例' },
      Scaling: { '': '缩放' },

      DifferentWaysToDescribeFractions: { '': '分数的不同表示法' },
    },
    Calculating: {
      '': '计算',
      Addition: { '': '加法' },
      Subtraction: { '': '减法' },
      Multiplication: { '': '乘法' },
      Division: { '': '除法' },
      TheOrderOfOperation: { '': '运算优先级' }
    },
    Measurement: {
      '': '测量',
      Length: { '': '长度' },
    },
    Geometry: {
      '': '几何学',
      Line: { '': '直线' },
    },
    Statistics: {
      '': '统计学',
      DataHanding: { '': '数据处理' },
    },
    Algebra: {
      '': '代数',
      Equations: { '': '方程式' },
    },
  },
  tips: {
    inpjname: 'Please input project name',
    ok: 'OK',
    cancel: 'Cancel',
    new: 'New'
  },
  to(path: string) {
    const names = path.split('.');

    let node = zh;
    for (const name of names) {
      node = (node as any)[name];
      if (!node) {
        console.error('not found');
        throw 'not found';
      }
    }

    if (typeof node === 'object') {
      return (node as any)[''];
    }

    return node;
  }
};

export default zh;
export const current: any = zh;

export {
  zh
};

export function local(key: string, optional?: string): string {
  if (!key || typeof key !== 'string') {
    return key ?? '';
  }
  const names = key.split('.');
  let node: any = current;
  for (const name of names) {
    if (typeof node !== 'object') {
      return optional || key;
    }
    node = node[name];
  }
  if (typeof node === 'object') {
    return (node as any)[''];
  }
  return node || optional || key;
}