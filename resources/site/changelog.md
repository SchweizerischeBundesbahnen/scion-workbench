![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Demo][menu-demo] | [Getting&nbsp;Started][menu-getting-started] | [How&nbsp;To][menu-how-to] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|---|

# Changelog

<a name="0.0.0-beta.12"></a>
## [0.0.0-beta.12](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.11...0.0.0-beta.12) (2018-11-23)

* Allow programmatic registration of activities ([#28](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/28)) ([6b1eddb](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6b1eddb))
* Register view auxiliary routes via `WorkbenchAuxiliaryRoutesRegistrator` and set view active state upon view creation ([#29](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/29)) ([0c794f1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0c794f1))
* Add iframes of remote sites beyond workbench grid to not cover other parts of the workbench like sashes or view dropdown menu ([#30](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/30)) ([c359064](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c359064))
* Allow cross-origin communication with remote sites ([#31](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/31)) ([7282a80](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/7282a80))
* Provide message box action texts when spawning the message box ([#32](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/32)) ([6fd32c3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6fd32c3))
* Control if workbench part content is capable of being moved in the DOM ([#30](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/30)) ([56d2df1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/56d2df1))
* Disable vertical scrolling in workbench viewtab bar ([#33](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/33)) ([293115c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/293115c))
* Use CDK overlay for the dropdown showing hidden view tabs ([#42](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/42)) ([3e91321](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3e91321))
* Continue scrolling in custom scrollbars even when the cursor enters or goes past the boundary of an iframe ([#41](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/41)) ([6f8fd5f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6f8fd5f))
* Use a separate routing navigate command when closing multiple views all at once ([#34](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/34)) ([9b6a5fe](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/9b6a5fe))
* Remove static initializers to be compatible with Angular 6 transpiled with TypeScript 2.x ([#26](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/26)) ([dad912d](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/dad912d))
* Move 'Workbench.forRoot guard' spec into spec directory and simplify spec ([#43](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/43)) ([dc3c2e9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/dc3c2e9))
* Extract `sci-dimension-module` into a separate NPM library ([#44](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/44)) ([006a19e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/006a19e))
* Extract `sci-viewport-module` into a separate NPM library ([#45](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/45)) ([0174cb0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0174cb0))
* Use puppeteer to run automated tests ([#59](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/59)) ([d6125cc](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d6125cc))
* Specify view-list dropdown anchor as `ElementRef` instead of native element to be compatible with Angular CDK 6 ([#42](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/42)) ([d6125cc](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d6125cc))
  

### BREAKING CHANGES
- [6b1eddb](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6b1eddb): Use added `visible` property over `ngIf` directive to show or hide an activity based on a conditional <wb-activity [visible]="conditional"></wb-activity>
- [7282a80](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/7282a80): Removed output property to listen for URL changes because not allowed for cross-origin communication and internally using a timer to detect URL changes (as there is no change event emitted natively and `MutationObserver` is not applicable). Use `message` output property instead.
- [6fd32c3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6fd32c3): Message box action texts are no longer specified when importing the workbench module. Instead, message box texts are provided directly when spawning the message box.
- [56d2df1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/56d2df1): removed content projection from `RemoteSiteComponent` and added it to workbench part level\
  If using a remote site, wrap entire part content in a `<wb-content-as-overlay>` element, which causes it to be added to a top-level workbench DOM element and projected into that component's bounding box.
- [56d2df1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/56d2df1): removed support to use `RemoteSiteComponent` as a routing component because must be a child of `<wb-content-as-overlay>` element
- [006a19e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/006a19e): Workbench requires `@scion/dimension` as its peer-dependency which you can install as following: `npm install --save @scion/dimension`
- [0174cb0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0174cb0): Workbench requires `@scion/viewport` as its peer-dependency which you can install as following: `npm install --save @scion/viewport`

<a name="0.0.0-beta.11"></a>
## [0.0.0-beta.11](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.10...0.0.0-beta.11) (2018-10-26)

### Bug Fixes

* Do not enter maximize mode when closing views quickly ([#24](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/24)) ([a54fb6f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a54fb6f))
* Upgrade workbench to run with Angular 7 ([#26](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/26)) ([af3c6e7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/af3c6e7))

<a name="0.0.0-beta.10"></a>
## [0.0.0-beta.10](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.9...0.0.0-beta.10) (2018-09-10)

### Bug Fixes

* Allow lazily-loaded views to inject masked injection tokens ([#21](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/21)) ([fe9b530](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/fe9b530))

<a name="0.0.0-beta.9"></a>
## [0.0.0-beta.9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.8...0.0.0-beta.9) (2018-08-23)

### Bug Fixes

* Use momentum-based scrolling to continue to scroll after finishing the scroll gesture ([#14](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/14)) ([71c81a5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/71c81a5))

<a name="0.0.0-beta.8"></a>
## [0.0.0-beta.8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.7...0.0.0-beta.8) (2018-08-22)

### Bug Fixes

* Use native overflow scroll functionality in viewport ([#14](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/14)) ([33ebe0f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/33ebe0f))

### BREAKING CHANGES

Migration if using viewport component:
- manifest a dependency to `SciViewportModule` because packaged as separate module
- remove custom CSS classes specified with `viewportCssClass` and `viewportClientCssClass` input properties; instead, CSS flexbox layout with flex-flow 'column nowrap' is applied to the viewport with `<ng-content>` as its flex item(s); migrate by styling `<ng-content>` as flex items, or provide your viewport client in a containing block and style it accordingly
- replace `overflowAuto` input property with `scrollbarStyle` input property; by default, scrollbars are displayed on top of the viewport client
- change selector from `wb-viewport` to `sci-viewport`
- use `scrollHeight` and `scrollWidth` to get viewport client dimension
- rename `ViewportComponent` to `SciViewportComponent` if injecting the viewport component

Migration if using dimension directive:
- manifest a dependency to `SciDimensionModule` because packaged as separate module
- change selector from `wbDimension` to `sciDimension`
- rename `Dimension` to `SciDimension` which is emitted upon host element's dimension change
- rename `wbDimensionChange` output property to `sciDimensionChange`
- rename `wbDimensionUseTimer` input property to `sciDimensionUseTimer`

<a name="0.0.0-beta.7"></a>
## [0.0.0-beta.7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.6...0.0.0-beta.7) (2018-08-06)

### Bug Fixes

* Fix check which ensures that `Workbench.forRoot()` is not used in a lazy context ([#5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/5)) ([6f345fc](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6f345fc))
* Allow to navigate relative to the current activated route ([#5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/5)) ([d0e8211](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d0e8211))
* Allow initial navigation to a conditionally registered activity ([#8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/8)) ([260a4be](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/260a4be))
* Render correct actions in the activity part header ([#9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/9)) ([589d742](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/589d742))
* Display component of currently activated activity ([#10](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/10)) ([8a7df7c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/8a7df7c))

<a name="0.0.0-beta.6"></a>
## [0.0.0-beta.6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.5...0.0.0-beta.6) (2018-07-24)

### Bug Fixes

* Make parameter 'extras' of method 'WorkbenchRouter.navigate(any[], WbNavigationExtras)' optional ([#5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/5)) ([76544aa](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/76544aa))

<a name="0.0.0-beta.5"></a>
## [0.0.0-beta.5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.4...0.0.0-beta.5) (2018-07-24)

### Bug Fixes

* Allow to navigate to view/activity routes of lazy loaded modules ([#5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/5)) ([051891c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/051891c))

[menu-overview]: /README.md
[menu-demo]: https://blog.sbb.technology/scion-workbench-demo/#/(view.6:heatmap//view.5:person/79//view.4:person/39//view.3:person/15//view.2:person/38//view.1:person/66//activity:person-list)?viewgrid=eyJpZCI6MSwic2FzaDEiOlsidmlld3BhcnQuMSIsInZpZXcuMSIsInZpZXcuMiIsInZpZXcuMSJdLCJzYXNoMiI6eyJpZCI6Miwic2FzaDEiOlsidmlld3BhcnQuMiIsInZpZXcuMyIsInZpZXcuMyJdLCJzYXNoMiI6eyJpZCI6Mywic2FzaDEiOlsidmlld3BhcnQuNCIsInZpZXcuNiIsInZpZXcuNiJdLCJzYXNoMiI6WyJ2aWV3cGFydC4zIiwidmlldy40Iiwidmlldy40Iiwidmlldy41Il0sInNwbGl0dGVyIjowLjQ4NTk2MTEyMzExMDE1MTEsImhzcGxpdCI6ZmFsc2V9LCJzcGxpdHRlciI6MC41NTk0MjQzMjY4MzM3OTc1LCJoc3BsaXQiOnRydWV9LCJzcGxpdHRlciI6MC4zMjI2Mjc3MzcyMjYyNzczLCJoc3BsaXQiOmZhbHNlfQ%3D%3D
[menu-getting-started]: /resources/site/getting-started.md
[menu-how-to]: /resources/site/how-to.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md
