/* eslint-disable no-restricted-syntax */

export default {
  format(date: Date | number, fmt: string) {
    if (typeof date !== 'object') {
      date = new Date(date);
    }
    const o = {
      'M+': date.getMonth() + 1, // 月份
      'd+': date.getDate(), // 日
      'h+': date.getUTCHours(), // 小时
      'm+': date.getMinutes(), // 分
      's+': date.getSeconds(), // 秒
      'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
      S: date.getMilliseconds(), // 毫秒
    } as any;
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (`${date.getFullYear()}`).substr(4 - RegExp.$1.length));
    for (const k in o) {
      if (new RegExp(`(${k})`).test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length)));
      }
    }
    return fmt;
  },
  dayDiff(from: Date | number | string, to: Date | number | string) {
    if (typeof from !== 'number') {
      if (typeof from === 'string') {
        from = new Date(from);
      }
      from = from.getTime();
    }
    if (typeof to !== 'number') {
      if (typeof to === 'string') {
        to = new Date(to);
      }
      to = to.getTime();
    }
    return Math.ceil((to - from) / (1000 * 3600 * 24));
  },
  fmtDiff(diff: number) {
    const secs = diff / 1000;
    const mins = secs / 60;
    const hours = mins / 60;
    const days = hours / 24;
    return `${days ? `${days}-` : ''}${this.format(new Date(diff), 'MM-dd hh:mm:ss')}`;
  },
  mod(value: number, date?: Date): Date {
    const d = date ? new Date(date) : new Date();
    const m = d.getMonth();
    d.setMonth(m - m % value);
    d.setDate(1);
    return d;
  },
  add(month: number, date: Date) {
    const d = date ? new Date(date) : new Date();
    const m = d.getMonth() + month;
    const c = Math.floor(m / 12);
    d.setFullYear(d.getFullYear() + c);
    if (m < 0) {
      d.setMonth(12 + (m % 12));
    } else {
      d.setMonth(m % 12);
    }
    return d;
  }
};
