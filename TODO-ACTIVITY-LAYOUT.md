## TODO Phase 1:
[] Separate model layout and serializer for activity layout
[] Rename workbench-layout-xy (serializer, model, version) => workbench-grid-layout
[] Rename workbench-perspective -> workbench-layout
[] Icon Provider
[] Text Provider
[x] Activate activities in initial layout? -> activatePart
[x] Test pages
[x] View Conflict Resolver with activity grids OR make view ids random
[] Part portal

## TODO Phase 2:
[] Drag and Drop (including restrictions)
[] Hidden
[] Menu to add activities
[] Show Labels
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

