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
