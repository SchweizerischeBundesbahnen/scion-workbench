## TODO PHASE 1
[] Migrate Perspective Capability V1 to V2 (e.g., using an interceptor)
[] Perspective validator
[] Validate params and migrate deprecated params (@scion/microfrontend-platform:  IntentParams.validateParams)
[] Tests:
   [] Test that "Not Found" page is displayed instantly when removing capability (also for views

## TODO PHASE 2
[] Host Part
[] Host View

## TODO PHASE 3
[] Provide handler and interceptors via provide function (requires only a single registration in the support, not in initializer anymore)


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
[] Do not disable animations when starting locally and on CI (fix tests: e.g.: host-popup.e2e-spec.ts: should stick to the popup anchor)
[] Sashing right activity panel to the left should not overlap left activity panel (e.g. left panel alignment)
[] Intelligent Merger of activity layout (Consider not to reset the whole layout when adding/removing an activity).
[] Consider changing MPart and MNode class to interface
[] Change expectView to expectView(ViewPO).toBeActive(selector), expectView(ViewPO).toBeInactive(), expectView(ViewPO).not.toBePresent()
[] Open view in activity if reference part not visible anymore
-> workbench should open view in currently active part of that activity


## NOT-RELATED (FUTURE PART ACTIONS)
[] Display actions and minimize button only on hover or when part has focus unless part is in main area (always visible)
