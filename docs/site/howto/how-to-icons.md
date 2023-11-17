<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Icons

The SCION Workbench requires some icons packed as icon font.

### Installation
The icon font can be downloaded from [GitHub][icon-font]. Unzip the icon font and place the extracted font files in the `/assets/fonts` folder.

### Workbench icons
The workbench requires the following icons with the following ligatures:

| Ligature     | Usage                                                      |
|--------------|------------------------------------------------------------|
| chevron-down | Indicator for opening the views drop down menu             |
| search       | Decorator for the search field in the views drop down menu |
| close        | Button to close a view tab                                 |
| edit         | Marker if a view contains dirty content                    |


### Configuration
The location of the icon font can be configured via the SCSS module `@scion/workbench`, required if deploying the application in a subdirectory, or to configure a custom icon font.

```scss
@use '@scion/workbench' with (
  $icon-font: (
    directory: '/path/to/font', // defaults to '/assets/fonts' if omitted
    filename: 'custom-workbench-icons' // defaults to 'scion-workbench-icons' if omitted
  )
);
```

### How to change icons
The icons can be replaced using the [IcoMoon][ico-moon] web application. Open [IcoMoon][ico-moon] in your browser and import the icon font definition from [scion-workbench-icons.json][icon-font-definition]. After changing the icons, regenerate the icon font, download it and place it in the `/assets/fonts` directory.

We recommend incrementing the version when modifying the icon font, enabling browser cache invalidation when icons change.
```scss
@use '@scion/workbench' with (
  $icon-font: (
    version: '1.0.0'
  )
);
```

### Deploying the app in a subdirectory
If deploying the application in a subdirectory, use a relative directory path for the browser to load the icon files relative to the document base URL (as specified in the `<base>` HTML tag).
Note that using a relative path requires to exclude the icon files from the application build. Depending on building the application with esbuild `@angular-devkit/build-angular:application`
or webpack `@angular-devkit/build-angular:browser`, different steps are required to exclude the icons from the build.

#### Using @angular-devkit/build-angular:application (esbuild)
Configure the `@scion/workbench` SCSS module to load the icon font relative to the document base URL:
```scss
use '@scion/workbench' with (
  $icon-font: (
    directory: 'path/to/font' // no leading slash, typically `assets/fonts`
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
use '@scion/workbench' with (
  $icon-font: (
    directory: '^path/to/font' // no leading slash but with a caret (^), typically `^assets/fonts`
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
