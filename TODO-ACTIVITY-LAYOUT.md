## TODO PHASE 1
[] Consider switching to initial perspective if perspective cannot be loaded. (WorkbenchPerspectiveService)
[] Tests:
   [] Test that "Not Found" page is displayed instantly when removing capability (also for views)
   [] Test that workbench startup does not fail if initial perspective errors
   [] Part Tests Focus and Translatable

## TODO PHASE 2
[] Host Part
[] Host View

## TODO PHASE 3
[] Provide handler and interceptors via provide function (requires only a single registration in the support, not in initializer anymore)
[] Parameterized icons to create icons with a badge
   -> standalone: no addition required? Example: notificationIcon -> Custom icon component for `notificationIcon` which accesses the NotificatonService
   -> mfp: analog texts with matrix params and resolvers. How?

## Bugs
Microfrontend overlaps right activity bar when shrinking page viewport

################################################################################################################################

## NOT-RELATED (FUTURE)
[] When to migrate to hint-based view navigation?
[] Consider passing navigation data via UrlMatcher so that data can be read via input or activated route
[] Remove outlets of hidden activities (maybe not for minimized parts to not reload on reopen, crucial for microfrontend preformance)
[] When to deprecate transient params
[] Consider compat mode for show splash where showSplash is true by default (similar to lazy compat mode)
[] Hide Activities & menu to show activities
[] Show Labels toolbars: {showLabels: boolean};
[] Contribute part actions to specific activity (maybe with a context (key/value map)) -> see thinktank
[] How to open a view in an activity (or in any part)?
   - Idea: Part Capability can define key-value pairs (context-map, metadata), that can be queried to locate the part (associate custom data with a part -> also standalone) 
[] Do not disable animations when starting locally and on CI (fix tests: e.g.: host-popup.e2e-spec.ts: should stick to the popup anchor)
[] Sashing right activity panel to the left should not overlap left activity panel (e.g. left panel alignment)
[] Intelligent Merger of activity layout (Consider not to reset the whole layout when adding/removing an activity).
[] Consider changing MPart and MNode class to interface
[] Change expectView to expectView(ViewPO).toBeActive(selector), expectView(ViewPO).toBeInactive(), expectView(ViewPO).not.toBePresent()
[] Open view in active part of activity if reference part not visible anymore
   -> workbench should open view in currently active part of that activity
[] Display actions and minimize button only on hover or when part has focus unless part is in main area (always visible)

## Thinktank Part Actions
- Part actions belong to a part and should be modeled on the part capability -> no need to contribute parts via API
- (View) Part actions belong to a view and should be modeled on the view capability -> no need to contribute parts via API

## Thinktank Adding View to Part
- you have to know the part id (alternative part id) as assigned by the perspective provider (as-is)
- Idea: part capability can define its own "alternative id" in the capability definition. This id will also be added to the part as alternative part id.
       Then, the part contributor does not have to know the assigned id of the perspective provider.
       -> prerequisite: workbench parts can have multiple alternative part ids (also views for symmetry) 
