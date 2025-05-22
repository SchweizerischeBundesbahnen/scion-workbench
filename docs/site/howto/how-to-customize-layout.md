<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Layout

SCION Workbench provides a set of settings to adapt the workbench to individual preferences and working styles.

The application can define defaults through design tokens and may provide a user interface for the user to change settings. User preferences are stored in workbench storage (defaults to local storage).
The SCION Workbench has no built-in user interface for changing settings; the application must implement it.

<details>
    <summary><strong>Panel Alignment</strong></summary>
    <br>

Controls the alignment of the bottom panel of docked parts. Avalable alignments are `justify`, `center`, `left` and `right`. Defaults to `justify`.

Set the default panel alignment via `--sci-workbench-layout-panel-align` design token.
```scss
:root {
  --sci-workbench-layout-panel-align: center;
}
```

Set user's preference via `WorkbenchService.settings.panelAlignment` property.
```ts
inject(WorkbenchService).settings.panelAlignment.set('center')
```

**Justify (Default)**\
[<img src="/docs/site/images/workbench-layout-alignment-justify.drawio.svg" height="300" alt="Panel Alignment Justify">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-alignment-justify.drawio.svg)

**Center**\
[<img src="/docs/site/images/workbench-layout-alignment-center.drawio.svg" height="300" alt="Panel Alignment Center">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-alignment-center.drawio.svg)

**Left**\
[<img src="/docs/site/images/workbench-layout-alignment-left.drawio.svg" height="300" alt="Panel Alignment Left">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-alignment-left.drawio.svg)

**Right**\
[<img src="/docs/site/images/workbench-layout-alignment-right.drawio.svg" height="300" alt="Panel Alignment Right">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-alignment-right.drawio.svg)
</details>

<details>
    <summary><strong>Panel Animation</strong></summary>
    <br>

Enables slide-in and slide-out animations of panels. Defaults to `true`.

Set the default animation behavior via `--sci-workbench-layout-panel-animate` design token.
```scss
:root {
  --sci-workbench-layout-panel-animate: false;
}
``` 

Set user's preference via `WorkbenchService.settings.panelAnimation` property.
```ts
inject(WorkbenchService).settings.panelAnimation.set(false);
```

</details>

<details>
    <summary><strong>Theme</strong></summary>
    <br>

Specifies the workbench theme. Built-in themes are `scion-light` and `scion-dark`. Refer to [How to Theme the SCION Workbench][link-how-to-theme-workbench] for custom themes.

A theme is selected based on the user's OS color scheme preference or can be explicitly set using the `sci-theme` attribute on the HTML root element.
```html
<html sci-theme="scion-light">
   ...
</html>
```

Set user's preference via `WorkbenchService.settings.theme` property.
```ts
inject(WorkbenchService).settings.theme.set('scion-light');
```
</details>

[link-how-to-theme-workbench]: ./how-to-theme-workbench.md

[menu-how-to]: /docs/site/howto/how-to.md
[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
