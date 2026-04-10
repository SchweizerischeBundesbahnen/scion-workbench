export function parseMenuLocation(location: `menu:${string}` | `toolbar:${string}`): {location: `menu:${string}` | `toolbar:${string}`; scope: 'menu' | 'toolbar'} {
  const regex = /^(?<scope>(menu|toolbar)):(?<name>.+)$/;
  const {scope} = regex.exec(location)!.groups as {scope: 'menu' | 'toolbar'; name: string};
  return {scope, location};
}
