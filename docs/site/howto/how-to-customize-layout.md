<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Layout

The SCION Workbench provides options and settings to allow customization of the layout to suit individual preferences and work styles.

### How to configure panel alignment

The panel alignment controls how the bottom panel is aligned and can be changed as follows:

```ts
// Change panel alignment to center.
inject(WorkbenchService).panelAlignment.set('center');

// Read panel alignment.
const panelAlignment = inject(WorkbenchService).panelAlignment();
```

#### Justify (Default)

```ts
inject(WorkbenchService).panelAlignment.set('justify');
```

```plain
+---+----------------+---+
|   |                |   |
|   |                |   |
|   |                |   |
|   |                |   |
|   |                |   |
+---+----------------+---+
|                        |
+------------------------+
```

[<img src="/docs/site/images/workbench-layout-alignment-justify.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-alignment-justify.svg)

#### Center

```ts
inject(WorkbenchService).panelAlignment.set('center');
```

```plain
+---+----------------+---+
|   |                |   |
|   |                |   |
|   |                |   |
|   |                |   |
|   |                |   |
|   +----------------+   |
|   |                |   |
+------------------------+
```

[<img src="/docs/site/images/workbench-layout-alignment-center.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-alignment-center.svg)


#### Left

```ts
inject(WorkbenchService).panelAlignment.set('left');
```

```plain
+---+----------------+---+
|   |                |   |
|   |                |   |
|   |                |   |
|   |                |   |
|   |                |   |
+---+----------------+   |
|                    |   |
+------------------------+
```

[<img src="/docs/site/images/workbench-layout-alignment-left.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-alignment-left.svg)

#### Right

```ts
inject(WorkbenchService).panelAlignment.set('right');
```

```plain
+---+----------------+---+
|   |                |   |
|   |                |   |
|   |                |   |
|   |                |   |
|   |                |   |
|   +----------------+---+
|   |                    |
+------------------------+
```

[<img src="/docs/site/images/workbench-layout-alignment-right.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-alignment-right.svg)

### How to enable panel animations

Panel slide-in and slide-out animations can be turned on as follows:

```ts
// Enable panel animations.
inject(WorkbenchService).panelAnimation.set(true);

// Check if panel animations are enabled.
const panelAnimationEnabled = inject(WorkbenchService).panelAnimation();
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md

[menu-projects-overview]: /docs/site/projects-overview.md

[menu-changelog]: /docs/site/changelog.md

[menu-contributing]: /CONTRIBUTING.md

[menu-sponsoring]: /docs/site/sponsoring.md
