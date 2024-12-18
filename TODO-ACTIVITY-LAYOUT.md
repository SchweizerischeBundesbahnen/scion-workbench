## TO DO:
[] Replace part id by formatted PartId (like ViewId)
  -> otherwise we have to prefix part outlets in many places
  -> but, no 1:n relation (alternativeId => PartId); same view cannot be displayed in multiple places at the same time; same view handle, same portal
[] Ensure view and part ids to be unique
[] Duplicate part ids, already a problem today when switching perspective, having a part with the same name in the main area and the perspective
[] Conflict Resolver for part ids
[] Should also be possible to navigate MAIN_AREA, like any other part
   -> do we still need MainAreaPartComponent or integrate the special handling with sub grid in PartComponent?
   -> for the moment, we still require the primary router outlet in main area component to not be breaking
[] Layout change detector does not work with dynamic part ids
   -> partId -> excluded [check]
   -> activePartId -> excluded [check]
   -> outlets (part id) -> [??]

## TO DISCUSS:
[] Should it be possible to add a view to multiple parts? 
   I.e., to parts with the same alternative id? For example, navigating via router (by path) without specifying a target,
   only specifying the part by alternative id which is contained at multiple times in the layout?

## TO CONSIDER:
[] Consider replacing MPart class by interface
[] Consider replacing MNode class by interface

## IDEAS:
[] Activity icon in form of a component (instead ligature, SVG, or SVG Symbol) => full flexiblity
[] Log warning if using start page in main area


## TESTS:
- add layout migration test (v7), required? why only for version 4
- navigate multiple parts (workbench-layout.spec.ts)
- remove multiple parts (workbench-layout.spec.ts)
- add router test (simple navigation), adding view to part referenced by alternative id 
- add router test (simple navigation), adding view to multiple parts referenced by alternative id (expect error)
- extend test where we reload the app to test that the layout is not reset (this test must also include a navigated part!) (F5)
