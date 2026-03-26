export function parseMenuLocation(location: `menu:${string}` | `toolbar:${string}` | `group(menu):${string}` | `group(toolbar):${string}`): {location: `menu:${string}` | `toolbar:${string}` | `group:${string}`; scope: 'menu' | 'toolbar'} {
  const regex = /^(?<scope>(menu|toolbar|group\(menu\)|group\(toolbar\))):(?<name>.+)$/;
  const {scope, name} = regex.exec(location)!.groups as {scope: 'menu' | 'toolbar' | 'group(menu)' | 'group(toolbar)'; name: string};

  switch (scope) {
    case 'menu':
    case 'toolbar':
      return {location: `${scope}:${name}`, scope};
    case 'group(menu)':
      return {location: `group:${name}`, scope: 'menu'};
    case 'group(toolbar)':
      return {location: `group:${name}`, scope: 'toolbar'};
  }
}
