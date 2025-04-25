<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Icons

The SCION Workbench uses built-in icons in various places. Additionally, the application can use its own icons in the layout, such as for icons of docked workbench parts.

### How to Provide Icons
Icons can be provided to the SCION Workbench using an icon provider registered via configuration passed to the `provideWorkbench` function.
An icon provider is a function that returns a component for an icon. The component renders the icon.

```ts
import {provideWorkbench} from '@scion/workbench';
import {Type} from '@angular/core';

provideWorkbench({
  iconProvider: (icon: string): ComponentType<unknown> | undefined => {
    if (icon.startsWith('workbench.')) {
      return undefined; // return `undefined` to not replace built-in workbench icons
    }

    // `CustomIconProvider` is illustrative and not part of the Workbench API.
    return inject(CustomIconProvider).provide(icon);
  },
});
```

> [!TIP]
> The function can call `inject` to get any required dependencies.


Alternatively, the icon provider can return a descriptor, allowing for additional configuration such as inputs.
Inputs are available as input properties in the component.

```ts
import {provideWorkbench, WorkbenchIconDescriptor} from '@scion/workbench';

provideWorkbench({
  iconProvider: (icon: string): WorkbenchIconDescriptor | undefined => {
    if (icon.startsWith('workbench.')) {
      return undefined; // return `undefined` to not replace built-in workbench icons
    }
    return {
      component: CustomIconComponent,
      inputs: {icon},
    };
  },
});
```

The component can use the inputs to render the icon.

```ts
import {Component, input} from '@angular/core';

@Component({
  selector: 'app-icon',
  template: '{{icon()}}',
})
class CustomIconComponent {
  icon = input.required<string>();
}
```

### Built-In Workbench Icons
The SCION Workbench requires the following icons, which can be replaced using an icon provider.

| Icon Key            | Usage                                            |
|---------------------|--------------------------------------------------|
| workbench.clear     | Clear button in input fields                     |
| workbench.close     | Close button in views, dialogs and notifications |
| workbench.dirty     | Visual indicator for view with unsaved content   |
| workbench.menu_down | Menu button of drop down menus                   |
| workbench.search    | Visual indicator in search or filter fields      |

> [!TIP]
> To not replace built-in workbench icons, the icon provider can return `undefined` for icons starting with the `workbench.` prefix.


### Default Icon Provider
The SCION Workbench installs a Material icon provider if no icon provider is configured, enabling the application to reference Material icon ligatures in the layout, such as for icons of docked workbench parts.

The default icon provider requires the application to include the Material icon font, for example in `styles.scss`, as follows:

```scss
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded');
```

The application can then reference icons from the Material Icons Font: https://fonts.google.com/icons

### Installation of the Workbench Icon Font
The SCION Workbench uses built-in icons from an icon font. Download the icon font from [GitHub][icon-font]. After downloading, unzip the font files and place the extracted files in the `/public/fonts` folder.

### Configuration of the Workbench Icon Font
The location of the icon font can be configured via the SCSS module `@scion/workbench`, required if deploying the application in a subdirectory.

```scss
@use '@scion/workbench' with (
  $icon-font: (
    directory: '/path/to/font', // defaults to '/fonts' if omitted
    filename: 'custom-workbench-icons' // defaults to 'scion-workbench-icons' if omitted
  )
);
```

If deploying the application in a subdirectory, use a relative directory path for the browser to load the icon files relative to the document base URL (as specified in the `<base>` HTML tag).
Note that using a relative path requires to exclude the icon files from the application build. Depending on whether building the application with esbuild `@angular-devkit/build-angular:application`
or webpack `@angular-devkit/build-angular:browser`, different steps are required to exclude the icons from the build.

#### Using @angular-devkit/build-angular:application (esbuild)
Configure the `@scion/workbench` SCSS module to load the icon font relative to the document base URL:
```scss
@use '@scion/workbench' with (
  $icon-font: (
    directory: 'path/to/font' // no leading slash, typically `fonts`
  )
);
```

Add the path to the `externalDependencies` build option in the `angular.json` file:
```json
"externalDependencies": [
  "path/to/font/scion-workbench-icons.*"
]
```

#### Using @angular-devkit/build-angular:browser (webpack)
Configure the `@scion/workbench` SCSS module to load the icon font relative to the document base URL:
```scss
@use '@scion/workbench' with (
  $icon-font: (
    directory: '^path/to/font' // no leading slash but with a caret (^), typically `^fonts`
  )
);
```

### Modifying Icons in the Workbench Icon Font
As an alternative to using a custom icon provider, the workbench icon font can be modified. However, using an icon provider is still recommended.

To modify the workbench icon font, open the [IcoMoon][ico-moon] web application and import the icon font definition from [scion-workbench-icons.json][icon-font-definition]. After changing the icons, regenerate the icon font, download it, and place it in the `/public/fonts` directory.

It is recommended to increment the version when modified the icon font, enabling browser cache invalidation when icons have changed.
```scss
@use '@scion/workbench' with (
  $icon-font: (
    version: '1.0.0'
  )
);
```

[icon-font]: https://raw.githubusercontent.com/SchweizerischeBundesbahnen/scion-workbench/master/resources/scion-workbench-icons/fonts/fonts.zip
[icon-font-definition]: https://raw.githubusercontent.com/SchweizerischeBundesbahnen/scion-workbench/master/resources/scion-workbench-icons/scion-workbench-icons.json
[ico-moon]: https://icomoon.io/app


[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
