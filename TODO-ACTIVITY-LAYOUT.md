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

## TO CONSIDER:
[] Consider replacing MPart class by interface
[] Consider replacing MNode class by interface

## IDEAS:
[] Activity icon in form of a component (instead ligature, SVG, or SVG Symbol) => full flexiblity
[] Log warning if using start page in main area


## TESTS:
- should not remove navigated part if removing last view (ɵworkbench-layout.ts:709) //__removeView
- should not null main area if part is navigated (ɵworkbench-layout.ts:430) // serialize
    1. Open two parts in main area with one view each
    2. Navigate right part and close view of right part
    3. Close view in left part
    4 expect right part to be displayed (not start page)
    
