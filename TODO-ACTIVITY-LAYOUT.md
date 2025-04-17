## TODO Phase 1:
[] Separate model layout and serializer for activity layout
[] Rename workbench-layout-xy (serializer, model, version) => workbench-grid-layout
[] Rename workbench-perspective -> workbench-layout
[x] Icon Provider
[x] Text Provider
[x] Activate activities in initial layout? -> activatePart
[x] Test pages
[x] View Conflict Resolver with activity grids OR make view ids random
[x] Maximize (hide activities)
[x] Prevent view drag to edge of main grid for layouts with activities
[x] Tooltip
[x] Testing App:
  [x] Drop Down for perspectives
  [x] Provide 2 Perspectives with activities
[x] @scion/components: Provide sash sizes as object literal instead of array
[] Documentation (JSDoc)
  [] Requires Material Icon Font if using default icon provider: @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded');
[] HowTo
  [] getting started with docked parts
  [] how to provide workbench layout: docked parts (alternatively fixed parts)
  [] perspective section: describe perspective link to layout
  [] control activity panel alignment
[x] remove activity part
[x] css class on add part
[x] Router navigation if not specifying a part and no target should not navigate peripheral views.
[x] Tests:
  [x] Test: Navigate view with router should activate activity
  [x] Test Panel Alignment: consider property in toEqualWorkbenchLayout matcher
  [x] Test that main grid drop zone is only enabled for layouts without activities or layouts with activities but no main area. (canDropInMainGrid)
  [x] part bar visible different conditions (part.title() || part.viewIds().length || part.actions().length || part.canMinimize())
  [x] activity reload page should restore layout (panel size and splitter ratio)
  [x] Test: Add docked part to test 'should have stable identifiers' when added support to Jasmine `toEqualWorkbenchLayout` matcher
  [x] Test: Workbench renders Material icon by default 
[x] i18n
  [x] minimize part action
[x] add part include activity parts in part list
[x] Minimize Part (-)
[x] Part Title
[x] add keystroke to maximize (ctrl+shift+F12)
[x] Consider moving computed in PartHandle (computeTitle, computeActivity, computeTopLeft) to onLayoutChange
[x] Add activity support to Jasmine `toEqualWorkbenchLayout` matcher
[x] Large spacing when not having left-top activity, only left-bottom
[x] revert isInMainArea
[x] larger padding for title left
[x] close activity when removing last view. add "nothing to show" page
[x] Microfrontend Navigation: do not navigate/close peripheral views
[x] Translation
  [x] allow for parameters in translatabe (matrix notation) we should export text fn or text pipe (custom tabs) [yes, but experimental]
[x] Tab drag restriction

 
## TODO Phase 2:
[] Activity item focus (keyboard navigation)
[] Part Portal (to not lose changes when closing activity)
[] Pin Feature
[] Hide Activities & menu to show activities
[] Show Labels toolbars: {showLabels: boolean};
[] Contribute part actions to specific activity (maybe with a context (key/value map)) -> see thinktank
[] Remove outlets of hidden activities (maybe not for minimized parts to not reload on reopen, crucial for microfrontend preformance)
[] Do not disable animations when starting locally and on CI (fix tests: e.g.: host-popup.e2e-spec.ts: should stick to the popup anchor)
[] Sashing right activity panel to the left should not overlap left activity panel (e.g. left panel alignment)
[] Open view in activity if reference part not visible anymore
-> workbench should open view in currently active part of that activity

## TODO Phase 3:
[] Intelligent Merger of activity layout
[] Display actions and minimize button only on hover or when part has focus unless part is in main area (always visible)

## TODO MICROFRONTEND ACTIVITIES
[] i18n substitute named parameters
   [] microfrontend view component
   [] microfrontend dialog component

## TO CONSIDER:
[] Consider changing MPart class to interface
[] Consider changing MNode class to interface
[] Change expectView to expectView(ViewPO).toBeActive(selector), expectView(ViewPO).toBeInactive(), expectView(ViewPO).not.toBePresent()
-> refactor PageNotFoundPO if changed expectView
[x] Remove null/undefined from WorkbenchLayoutService.layout and WorkbenchService.activePerspective
   Rational: not required anymore because startup blocks until layout is loaded

## BREAKING CHANGES:
[] download new workbench icon font
[] maximize without activities

## THINKTANK

## Angular 20
[] Use string interpolation in layout.component ([size]="panel.width + 'px'")
[] build workbench prod check scss warnings -> scion-toolkit mat-icon-button mixin
