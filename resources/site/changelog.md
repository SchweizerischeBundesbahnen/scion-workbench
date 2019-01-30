![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

# Changelog

# [0.0.0-beta.14](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.13...0.0.0-beta.14) (2019-01-31)


### Bug Fixes

* declare `workbench-application.core` as regular dependency of `workbench-application.angular` ([9855241](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/9855241))


# [0.0.0-beta.13](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.12...0.0.0-beta.13) (2019-01-30)


### Bug Fixes

* compute native scrollbar track size correctly even if not displayed at application startup ([e12718c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e12718c)), closes [#87](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/87)
* do not enter minimize mode when closing views quickly in maximize mode ([375dace](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/375dace)), closes [#24](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/24)
* reduce the number of 'mousemove' events dispatched between application windows ([44c40f4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/44c40f4)), closes [#86](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/86)
* stretch content of `<sci-viewport>` if it overflows horizontally ([31d23d4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/31d23d4)), closes [#77](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/77)
* use an overlay to render view drop regions to not flicker while dragging views ([c738a1a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c738a1a)), closes [#79](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/79)


### Features

* allow giving CSS classes to workbench elements to have stable selectors available in e2e tests ([c985816](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c985816)), closes [#78](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/78)
* allow to display a component in a popup ([eeb2390](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/eeb2390)), closes [#76](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/76)
* contribute 'Workbench Application Platform' to allow integrating content from multiple web applications ([84e1f08](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/84e1f08)), closes [#80](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/80)


### BREAKING CHANGES

* Properties of `Activity` and `WbActivityDirective` to set the activity label and CSS class(es) have changed as follows:
  
  - label => itemText
  - cssClass => itemCssClass
* CSS display property of `<sci-viewport>` flex container has changed from `flex` (column nowrap) to `grid` (one column).
  
  To migrate:
  - if having a single content child which stretches vertically by using `flex: auto`, remove that property
  - if having multiple content children with `flex: none`, wrap them inside a separate flex-container



# [0.0.0-beta.12](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.11...0.0.0-beta.12) (2018-11-23)


### Bug Fixes

* remove static initializers to be compatible with Angular 6 transpiled with TypeScript 2.x ([d5ce02e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d5ce02e)), closes [#26](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/26)


### Code Refactoring

* extract `sci-dimension-module` into a separate NPM library ([eecccb8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/eecccb8)), closes [#44](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/44)
* extract `sci-viewport-module` into a separate NPM library ([a390b54](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a390b54)), closes [#45](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/45)


### Features

* add iframes of remote sites beyond workbench grid to not cover other parts of the workbench like sashes or view dropdown menu ([b0bf93e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b0bf93e)), closes [#30](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/30)
* allow cross-origin communication with remote sites ([f492516](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f492516)), closes [#31](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/31)
* allow programmatic registration of activities ([efc1344](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/efc1344)), closes [#28](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/28)
* continue scrolling in custom scrollbars even when the cursor enters or goes past the boundary of an iframe ([9cb34a5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/9cb34a5)), closes [#41](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/41)
* control if workbench part content is capable of being moved in the DOM ([303d29a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/303d29a)), closes [#30](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/30)
* disable vertical scrolling in workbench viewtab bar ([e59ff5e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e59ff5e)), closes [#33](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/33)
* provide message box action texts when spawning the message box ([f589764](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f589764)), closes [#32](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/32)
* register activity auxiliary routes only in root injector ([0f3c5d4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0f3c5d4)), closes [#28](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/28)
* register view auxiliary routes via `WorkbenchAuxiliaryRoutesRegistrator` and set view active state upon view creation ([e8718d9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e8718d9)), closes [#29](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/29)
* specify view-list dropdown anchor as `ElementRef` instead of native element to be compatible with Angular CDK 6 ([d8b1c87](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d8b1c87)), closes [#42](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/42)
* use a separate routing navigate command when closing multiple views all at once ([688a3b8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/688a3b8)), closes [#34](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/34)
* use CDK overlay for the dropdown showing hidden view tabs ([53763e7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/53763e7)), closes [#42](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/42)


### BREAKING CHANGES

* Workbench requires `@scion/viewport` as its peer-dependency which you can install as following:
`npm install --save @scion/viewport`
* Workbench requires `@scion/dimension` as its peer-dependency which you can install as following:
`npm install --save @scion/dimension`.
Why not use ResizeObserver: Web Performance Working Group is working on a W3C recommendation for natively observing changes to Element’s size. The Web API draft is still work in progress and support limited to Google Chrome and Opera. See https://wicg.github.io/ResizeObserver/
* Removed content projection from `RemoteSiteComponent` and added it to workbench part level. If using a remote site, wrap entire part content in a `<wb-content-as-overlay>` element, which causes it to be added to a top-level workbench DOM element and projected into that component's bounding box.
Removed support to use `RemoteSiteComponent` as a routing component because must be a child of `<wb-content-as-overlay>` element
* Message box action texts are no longer specified when importing the workbench module. Instead, message box texts are provided directly when spawning the message box.
* Removed output property to listen for URL changes because not allowed for cross-origin communication and internally using a timer to detect URL changes (as there is no change event emitted natively and `MutationObserver` is not applicable). Use `message` output property instead.
* Use added `visible` property over `ngIf` directive to show or hide an activity based on a conditional <wb-activity [visible]="conditional"></wb-activity>



# [0.0.0-beta.11](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.10...0.0.0-beta.11) (2018-10-26)


### Bug Fixes

* do not enter maximize mode when closing views quickly ([3959887](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3959887))


### Features

* upgrade workbench to run with Angular 7 ([ce325a8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ce325a8)), closes [#26](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/26)



# [0.0.0-beta.10](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.9...0.0.0-beta.10) (2018-09-10)


### Features

* Allow lazily-loaded views to inject masked injection tokens ([3c212d0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3c212d0))



# [0.0.0-beta.9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.8...0.0.0-beta.9) (2018-08-23)


### Bug Fixes

* upgrade dependencies to fix potential security vulnerability in `url-parse@1.4.1` ([43d70ff](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/43d70ff))


### Features

* use momentum-based scrolling to continue to scroll after finishing the scroll gesture ([4a2f085](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4a2f085))



# [0.0.0-beta.8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.7...0.0.0-beta.8) (2018-08-22)


### Features

* use native overflow scroll functionality in viewport ([8889279](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/8889279))


### BREAKING CHANGES

* Migration if using viewport component and dimension directive
	Manifest a dependency to `SciViewportModule` because packaged as separate module

	Remove custom CSS classes specified with `viewportCssClass` and `viewportClientCssClass` input properties; instead, CSS flexbox layout with flex-flow 'column nowrap' is applied to the viewport with `<ng-content>` as its flex item(s); migrate by styling `<ng-content>` as flex items, or provide your viewport client in a containing block and style it accordingly

	Replace `overflowAuto` input property with `scrollbarStyle` input property; by default, scrollbars are displayed on top of the viewport client

	Change selector from `wb-viewport` to `sci-viewport`

	Use `scrollHeight` and `scrollWidth` to get viewport client dimension

	Rename `ViewportComponent` to `SciViewportComponent` if injecting the viewport component

	Manifest a dependency to `SciDimensionModule` because packaged as separate module

	Change selector from `wbDimension` to `sciDimension`

	Rename `Dimension` to `SciDimension` which is emitted upon host element's dimension change

	Rename `wbDimensionChange` output property to `sciDimensionChange`

	Rename `wbDimensionUseTimer` input property to `sciDimensionUseTimer`



# [0.0.0-beta.7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.6...0.0.0-beta.7) (2018-08-06)


### Bug Fixes

* allow to navigate relative to the current activated route ([#5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/5)) ([27adf69](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/27adf69))
* fix check which ensures that `Workbench.forRoot()` is not used in a lazy context ([ea3a1b0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ea3a1b0)), closes [#5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/5)
* fix wrong typing of injected content children ([5a446fd](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5a446fd))
* Render correct actions in the activity part header ([86b77f1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/86b77f1)), closes [#9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/9)


### Features

* Allow initial navigation to a conditionally registered activity ([065f7ce](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/065f7ce)), closes [#8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/8)
* Display component of currently activated activity ([f59a74d](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f59a74d)), closes [angular/angular#25313](https://github.com/angular/angular/issues/25313) [#10](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/10)
* use `Router` instead of `DefaultUrlSerializer` to parse URL ([eedc5dc](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/eedc5dc)), closes [#5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/5)



# [0.0.0-beta.6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.5...0.0.0-beta.6) (2018-07-24)


### Bug Fixes

* make parameter 'extras' of method 'WorkbenchRouter.navigate(any[], WbNavigationExtras)' optional ([b971447](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b971447))



# [0.0.0-beta.5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.4...0.0.0-beta.5) (2018-07-24)


### Features

* allow to navigate to view/activity routes of lazy loaded modules ([e6054b6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e6054b6)), closes [#23459](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/23459) [#13869](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/13869) [#20114](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/20114) [#5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/5)



# [0.0.0-beta.4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.3...0.0.0-beta.4) (2018-07-19)


### Features

* update project dependencies due to potential security vulnerability in one of the dependencies ([1fd83a4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/1fd83a4))



# [0.0.0-beta.3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.2...0.0.0-beta.3) (2018-07-19)


### Bug Fixes

* add missing exports to 'public_api' ([1266e85](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/1266e85))


### Features

* rename CSS class for workbench icon font from 'wb-font' to 'wb-icons' ([94d3b2b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/94d3b2b))



# [0.0.0-beta.2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.1...0.0.0-beta.2) (2018-07-17)


### Features

* specify workbench icon font top-level in 'index.scss' ([6d3884b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6d3884b))



# [0.0.0-beta.1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.0...0.0.0-beta.1) (2018-07-17)


### Bug Fixes

* load workbench icon font relative to base href ([f538223](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f538223))



# [0.0.0-beta.0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/5e57ac9...0.0.0-beta.0) (2018-07-17)


### Features

* contribute [@scion](https://github.com/scion)/workbench source ([a4c81bc](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a4c81bc))
* generate library skeleton for [@scion](https://github.com/scion)/workbench library ([39eaa35](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/39eaa35))
* generate project skeleton for scion libraries ([5e57ac9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5e57ac9))



[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md
