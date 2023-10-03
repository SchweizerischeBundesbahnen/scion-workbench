<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Theming

SCION Workbench provides a set of design tokens to enable consistent design of the workbench. Design tokens are provided by the `@scion/workbench` SCSS module.

An application can define a custom theme to change the default look of the SCION Workbench. Multiple themes are supported. A theme is a collection of design tokens, defining specific design aspects such as colors, spacings, etc. A design token can have a different value per theme.

An application typically loads the SCSS module `@scion/workbench` in the `styles.scss` file.

```scss
@use '@scion/workbench';
```

### Themes
SCION provides a light and a dark theme, `scion-light` and `scion-dark`. Custom themes can be passed to the module under the `$themes` map entry, replacing the built-in themes. A custom theme can define only a subset of the available design tokens, with unspecified tokens inherited from the built-in theme of the same color scheme. The color scheme of a theme is determined by the `color-scheme` token.

```scss
@use '@scion/workbench' with (
  $themes: (
    dark: (
      color-scheme: dark,
      --sci-color-gray-50: #1D1D1D,
      --sci-color-gray-75: #262626,
      --sci-color-gray-100: #323232,
      --sci-color-gray-200: #3F3F3F,
      --sci-color-gray-300: #545454,
      --sci-color-gray-400: #707070,
      --sci-color-gray-500: #909090,
      --sci-color-gray-600: #B2B2B2,
      --sci-color-gray-700: #D1D1D1,
      --sci-color-gray-800: #EBEBEB,
      --sci-color-gray-900: #FFFFFF,
      --sci-color-accent: blueviolet,
      --sci-workbench-tab-height: 3.5rem,
      --sci-workbench-view-background-color: var(--sci-color-gray-100),
      --sci-workbench-part-bar-background-color: var(--sci-color-gray-300),
    ),
    light: (
      color-scheme: light,
      --sci-color-gray-50: #FFFFFF,
      --sci-color-gray-75: #FDFDFD,
      --sci-color-gray-100: #F8F8F8,
      --sci-color-gray-200: #E6E6E6,
      --sci-color-gray-300: #D5D5D5,
      --sci-color-gray-400: #B1B1B1,
      --sci-color-gray-500: #909090,
      --sci-color-gray-600: #6D6D6D,
      --sci-color-gray-700: #464646,
      --sci-color-gray-800: #222222,
      --sci-color-gray-900: #000000,
      --sci-color-accent: blueviolet,
    ),
  )
);
```

### Theme Selection
A theme is selected based on the user's OS color scheme preference, or selected manually using the `WorkbenchService`.

```ts
inject(WorkbenchService).switchTheme('dark');

```
The selected theme is stored in workbench storage and will be selected when loading the application the next time.

### Design Tokens
SCION Workbench supports the following design tokens:

<details>
  <summary><strong>Static Color Tokens</strong></summary>
  <br>

Colors that have a fixed color value across all themes.

[Static Color Tokens](https://raw.githubusercontent.com/SchweizerischeBundesbahnen/scion-toolkit/master/projects/scion/components/design/colors/_scion-static-colors.scss)

</details>

<details>
  <summary><strong>Named Color Tokens</strong></summary>
  <br>

Predefined set of named colors as palette of tints and shades.

[Named Color Tokens (light theme)](https://raw.githubusercontent.com/SchweizerischeBundesbahnen/scion-toolkit/master/projects/scion/components/design/colors/_scion-light-colors.scss), [Named Color Tokens (dark theme)](https://raw.githubusercontent.com/SchweizerischeBundesbahnen/scion-toolkit/master/projects/scion/components/design/colors/_scion-dark-colors.scss)

</details>

<details>
  <summary><strong>Semantic Tokens</strong></summary>
  <br>

Tokens for a particular usage.

[Semantic Tokens (light theme)](https://raw.githubusercontent.com/SchweizerischeBundesbahnen/scion-toolkit/master/projects/scion/components/design/themes/_scion-light-theme.scss), [Semantic Tokens (dark theme)](https://raw.githubusercontent.com/SchweizerischeBundesbahnen/scion-toolkit/master/projects/scion/components/design/themes/_scion-dark-theme.scss)

</details>

<details>
  <summary><strong>Workbench-specific Tokens</strong></summary>
  <br>

Tokens specific to the SCION Workbench.

[Workbench-specific Tokens (light theme)](https://raw.githubusercontent.com/SchweizerischeBundesbahnen/scion-workbench/master/projects/scion/workbench/design/_workbench-light-theme-design-tokens.scss), [Workbench-specific Tokens (dark theme)](https://raw.githubusercontent.com/SchweizerischeBundesbahnen/scion-workbench/master/projects/scion/workbench/design/_workbench-dark-theme-design-tokens.scss)

</details>

### Examples

The following listings illustrate how to customize the look of the SCION Workbench.


<details>
  <summary><strong>Change of Background Color</strong></summary>
  <br>

```scss
@use '@scion/workbench' with (
  $themes: (
    scion-dark: (
      --sci-workbench-view-background-color: var(--sci-color-background-primary),
      --sci-workbench-view-peripheral-background-color: var(--sci-color-gray-75),
      --sci-workbench-part-bar-background-color: rgb(144, 144, 144),
      --sci-workbench-part-peripheral-bar-background-color: var(--sci-color-gray-100),
    ),
    scion-light: (
      --sci-workbench-view-background-color: var(--sci-color-background-primary),
      --sci-workbench-view-peripheral-background-color: var(--sci-color-gray-100),
      --sci-workbench-part-bar-background-color: var(--sci-color-gray-500),
      --sci-workbench-part-peripheral-bar-background-color: var(--sci-color-gray-100),
    ),
  )
);
```
</details>

<details>
  <summary><strong>Change of Tab Size</strong></summary>
  <br>

```scss
@use '@scion/workbench' with (
  $themes: (
    scion-dark: (
      --sci-workbench-tab-height: 3.5rem,
      --sci-workbench-tab-max-width: 15rem,
    ),
    scion-light: (
      --sci-workbench-tab-height: 3.5rem,
      --sci-workbench-tab-max-width: 15rem,
    ),
  )
);
```
</details>

<details>
  <summary><strong>Change of Accent Color</strong></summary>
  <br>

```scss
@use '@scion/workbench' with (
  $themes: (
    scion-dark: (
      --sci-color-accent: blueviolet,
    ),
    scion-light: (
      --sci-color-accent: blueviolet,
    ),
  )
);
```
</details>

<details>
  <summary><strong>Change of Tab Corner Radius</strong></summary>
  <br>

```scss
@use '@scion/workbench' with (
  $themes: (
    scion-dark: (
      --sci-workbench-tab-border-radius: 0,
    ),
    scion-light: (
      --sci-workbench-tab-border-radius: 0,
    ),
  )
);
```
</details>

<details>
  <summary><strong>Change of Overall Corner Radius</strong></summary>
  <br>

```scss
@use '@scion/workbench' with (
  $themes: (
    scion-dark: (
      --sci-corner: 3px,
      --sci-corner-small: 2px,
    ),
    scion-light: (
      --sci-corner: 3px,
      --sci-corner-small: 2px,
    ),
  )
);
```
</details>


[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
