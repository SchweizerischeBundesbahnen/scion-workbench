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
[] Prevent view drag to edge of main grid for layouts with activities
[] Icon & Tooltip
[x] Testing App:
  [x] Drop Down for perspectives
  [x] Provide 2 Perspectives with activities
[x] @scion/components: Provide sash sizes as object literal instead of array
[] Tests
[] Documentation (JSDoc)
[] HowTo
[] Add test if to have drop zone in main grid (Enabled for layouts without activities or layouts with activities but no main area.)
[] Do not disable animations when starting locally and on CI (fix tests: e.g.: host-popup.e2e-spec.ts: should stick to the popup anchor)
[x] remove activity part
[] css class on add part?
[x] Test: Navigate view with router should activate activity
[] Test: Panel Alignment: consider property in workbenchlayoutmatcher
[] Router navigate view if no part specified, only navigate not in peripheral area

## TODO Phase 2:
[] Drag and Drop (including restrictions)
[] Part Portal (to not lose changes when closing activity)
[] Part Title (consider implementing in phase 1 if choosing microfrontend integration instead of phase 2)
[] Hide Activities & menu to show activities
[] Show Labels toolbars: {showLabels: boolean};
[] Minimize Part (-)
[] Contribute part actions to specific activity (maybe with a context (key/value map))
[] Remove outlets of hidden activities (maybe not for minimized parts to not reload on reopen, crucial for microfrontend preformance)
[] activity item focus (keyboard navigation)

## TODO Phase 3:
[] Merger

## TO DISCUSS:

## TO CONSIDER:
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


## TESTS:


## BREAKING CHANGES:
[] part.isInMainArea -> part.isPeripheral

## THINKTANK
[] How to open part in specific activity? User may have moved views to other (dynamic) part in that activity,
   so the initial activity part is not visible anymore (still present because structural). However, the view should
   then open in the currently active part of that activty.
  -> Variante: addView('view.id', {partId: 'project'})
     Falls Project Part nicht mehr sichtbar (weil keine View mehr drin), dann automatiscsher
     Fallback auf active View dieses Grids.
[] Part Actions: How to contribute a part action to a specific activity. (see RegisterPartActionPageComponent)

