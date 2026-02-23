export function parseMenuLocation(location: `menu:${string}` | `toolbar:${string}` | `menubar:${string}`): {location: `menu:${string}` | `toolbar:${string}` | `menubar:${string}`; scope: 'menu' | 'toolbar' | 'menubar'} {
  const regex = /^(?<scope>(menu|toolbar|menubar)):(?<name>.+)$/;
  const {scope} = regex.exec(location)!.groups as {scope: 'menu' | 'toolbar' | 'menubar'; name: string};
  return {scope, location};
}
