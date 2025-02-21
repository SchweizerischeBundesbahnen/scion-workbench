## TODO Phase 1:
[] Separate model layout and serializer for activity layout
[] Rename workbench-layout-xy (serializer, model, version) => workbench-grid-layout
[] Rename workbench-perspective -> workbench-layout
[] Icon Provider
[] Text Provider
[x] Activate activities in initial layout? -> activatePart
[x] Test pages
[x] View Conflict Resolver with activity grids OR make view ids random
[] Maximize (hide activities)
[] Prevent view drag to edge of main grid for layouts with activities
[] Icon & Tooltip
[] Testing App:
  [] Drop Down for perspectives
  [] Provide 2 Perspectives with activities
[] @scion/components: Provide sash sizes as object literal instead of array
[] Tests
[] Documentation (JSDoc)
[] HowTo


## TODO Phase 2:
[] Drag and Drop (including restrictions)
[] Part Portal (to not lose changes when closing activity)
[] Part Title
[] Hide Activities & menu to show activities
[] Show Labels
[] Minimize Part (-)

## TODO Phase 3:
[] Merger

## TO DISCUSS:

## TO CONSIDER:
[] Consider changing MPart class to interface
[] Consider changing MNode class to interface
[] Change expectView to expectView(ViewPO).toBeActive(selector), expectView(ViewPO).toBeInactive(), expectView(ViewPO).not.toBePresent()
-> refactor PageNotFoundPO if changed expectView

## IDEAS:
[] Activity icon in form of a component (instead ligature, SVG, or SVG Symbol) => full flexiblity
[] Add `WorkbenchService.getActivity` by any part contained in the activity to set component, title and tooltip


## TESTS:


## BREAKING CHANGES:

## THINKTANK
[] How to open part in specific activity? User may have moved views to other (dynamic) part in that activity,
   so the initial activity part is not visible anymore (still present because structural). However, the view should
   then open in the currently active part of that activty.
  -> Variante: addView('view.id', {partId: 'project'})
     Falls Project Part nicht mehr sichtbar (weil keine View mehr drin), dann automatiscsher
     Fallback auf active View dieses Grids.
[] Part Actions: How to contribute a part action to a specific activity. (see RegisterPartActionPageComponent)
