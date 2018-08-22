<!--- Populate with changes relevant for the next release. -->
<!--- For the next release these are moved to `changelog.md`. -->

<a name="0.0.0-beta.8"></a>
## [0.0.0-beta.8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.7...0.0.0-beta.8) (2018-xx-xx)

### Bug Fixes

* Use native overflow scroll functionality in viewport ([#14](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/14)) ([xxx](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/xxx))

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
