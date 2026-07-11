<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Icons

Learn how to provide application-specific icons to the SCION Workbench.

***
**Content:**
- [Icon Provider](#icon-provider)
- [Material Icons](#material-icons)
- [Built-In Icons](#built-in-icons)
- [Related Information](#related-information)
***


### Icon Provider
Icon providers are used to provide icons to the SCION Workbench. An icon provider is a function that returns a component for an icon. The component renders the icon.

An icon provider can be registered via configuration passed to the `provideWorkbench` function.

```ts
import {provideWorkbench} from '@scion/workbench';
import {SciComponentDescriptor} from '@scion/components/common';
import {inputBinding} from '@angular/core';

provideWorkbench({
  iconProvider: (icon: string): SciComponentDescriptor | undefined => {
    if (icon.startsWith('scion.')) {
      return undefined; // return `undefined` to not replace built-in workbench icons
    }
    return {
      component: YourIconComponent, // `YourIconComponent` is illustrative
      bindings: [inputBinding('icon', () => icon)], // pass inputs to the icon component
    };
  },
});
```

> [!TIP]
> - The function can call `inject` to get any required dependencies.
> - The function can return `undefined` to not provide a requested icon, e.g., to use the default icon for built-in icons. 
> - Built-in icons start with the `scion.` prefix.

Inputs are available as input properties in the component.

```ts
public readonly icon = input.required<string>();
```

### Material Icons
If the icon provider does not provide an icon, SCION interprets the icon as a Material icon font ligature.

Refer to https://fonts.google.com/icons for available Material icons and https://developers.google.com/fonts/docs/material_symbols#use_in_web for instructions on including the Material icon font.

Example of including the Material icon font in the global `styles.scss`:
```scss
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL@20..24,400,0&display=block');
```

### Built-In Icons
The SCION Workbench uses built-in icons that are loaded from the CDN https://cdn.jsdelivr.net/npm/@scion/components/resources/scion-icons.
The application can register an icon provider to replace built-in SCION icons. 

Applications enforcing a Content Security Policy must whitelist the CDN using the `font-src` directive.

```
Content-Security-Policy: font-src 'self' https://cdn.jsdelivr.net/npm/@scion/components/;
```

### Related Information
The SCION Workbench uses the icon mechanism from `@scion/components`. See the [@scion/components documentation][link-scion-components-icons] for available icon APIs, instructions on self-hosting built-in icons, and a list of the built-in icons.

[icon-font]: https://raw.githubusercontent.com/SchweizerischeBundesbahnen/scion-workbench/master/resources/scion-workbench-icons/fonts/fonts.zip
[icon-font-definition]: https://raw.githubusercontent.com/SchweizerischeBundesbahnen/scion-workbench/master/resources/scion-workbench-icons/scion-workbench-icons.json
[ico-moon]: https://icomoon.io/app


[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md

[link-scion-components-icons]: https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/docs/site/scion-icons.md
