export async function jsImport(path: string) {
  if (!(window as any).import) {
    (window as any).import = new Function('path', 'return import(path)');
  }
  try {
    return (await (window as any).import(path));
  } catch (e: any) {
    console.error(e);
  }
}