## TODO Phase 1:
[] Separate model layout and serializer for activity layout
[] Rename workbench-layout-xy (serializer, model, version) => workbench-grid-layout
[] Rename workbench-perspective -> workbench-layout
[] Icon Provider
[] Text Provider
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
[] Do not disable animations when starting locally and on CI (fix tests: e.g.: host-popup.e2e-spec.ts: should stick to the popup anchor)
[x] remove activity part
[x] css class on add part
[x] Router navigation if not specifying a part and no target should not navigate peripheral views.
[x] Tests:
  [x] Test: Navigate view with router should activate activity
  [x] Test Panel Alignment: consider property in toEqualWorkbenchLayout matcher
  [x] Test that main grid drop zone is only enabled for layouts without activities or layouts with activities but no main area. (canDropInMainGrid)
  [] part bar visible different conditions (part.title() || part.viewIds().length || part.actions().length || part.canMinimize())
  [] activity reload page should restore layout (panel size and splitter ratio)
[] i18n
  [] minimize part action
[x] add part include activity parts in part list
[x] Minimize Part (-)
[x] Part Title
[] add keystroke to maximize (ctrl+shift+F12)
[] Sashing right activity panel to the left should not overlap left activity panel (e.g. left panel alignment)

## TODO Phase 2:
[] Drag and Drop (including restrictions)
[] Part Portal (to not lose changes when closing activity)
[] Hide Activities & menu to show activities
[] Show Labels toolbars: {showLabels: boolean};
[] Contribute part actions to specific activity (maybe with a context (key/value map))
[] Remove outlets of hidden activities (maybe not for minimized parts to not reload on reopen, crucial for microfrontend preformance)
[] activity item focus (keyboard navigation)

## TODO Phase 3:
[] Merger
[] Display actions and minimize button only on hover or when part has focus unless part is in main area (always visible)

## TO DISCUSS:

## TO CONSIDER:
[] part.isInMainArea still needed? use case check if views explicitly in main area
[] Consider changing MPart class to interface
[] Consider changing MNode class to interface
[] Change expectView to expectView(ViewPO).toBeActive(selector), expectView(ViewPO).toBeInactive(), expectView(ViewPO).not.toBePresent()
-> refactor PageNotFoundPO if changed expectView
[] Remove null/undefined from WorkbenchLayoutService.layout and WorkbenchService.activePerspective
   Rational: not required anymore because startup blocks until layout is loaded
[] Log warning if activities + maingrid + mainarea

## IDEAS:
[] Activity icon in form of a component (instead ligature, SVG, or SVG Symbol) => full flexiblity
[] Add `WorkbenchService.getActivity` by any part contained in the activity to set component, title and tooltip


## BREAKING CHANGES:
[] part.isInMainArea -> part.isPeripheral
[] download new workbench icon font

## THINKTANK
[] How to open part in specific activity? User may have moved views to other (dynamic) part in that activity,
   so the initial activity part is not visible anymore (still present because structural). However, the view should
   then open in the currently active part of that activty.
  -> Variante: addView('view.id', {partId: 'project'})
     Falls Project Part nicht mehr sichtbar (weil keine View mehr drin), dann automatiscsher
     Fallback auf active View dieses Grids.
