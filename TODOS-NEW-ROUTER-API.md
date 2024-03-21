- [] Navigate via router and only specify outlet (empty path)
    - Current Behavior:
      All outlets having no path are navigated
    - Expected Behavior:
      target auto: match views based on path and outlet
      target view2.x: match exactly that view
      target alternativeId: match all views with that alternative id
      ???
- [] Add following tests:
    - [] reload with views having a path in the initial layout; expect no error even if views are loaded asynchronously
    - [] navigate view with different outlets (e.g., outline, navigator)
- [] Test if deactivate guard still works
- [] Test that routing works with and without specifying PRIMARY as outlet in route config
- [] toEqualWorkbenchLayout assert view outlets
- [] Test navigate in peripheral area to open view in main area. Either inject Router or use RouterLink with target=auto.
- [] Check tests if we really need to create a layout.
- [] Tests for css classes on view. Including microfrontends (navigate to new microfrontend)
- [] WorkbenchLayout consider changing signature of activateView & activatePart to only 'true' (not boolean) 
- [] viewId: string -> viewId: ViewId
- [] Consider passing CSS classes when dragging view to other window (spec: should allow moving a view to another window)
- [] Migrate getting started to new angular style
- [] change getting started to path-based views
- [] add CSS class tests
     - expect layout css classes not to be replaced when setting css classes via handle
     - expect layout css classes not to be replaced when navigating to other route in same view
- [] retain main area when activating perspective without main area
- [] search and replace 'non-static views', 'static', 'named', 'unnamed', 'dynamic' views
- [] clear cache when layout cannot be deserialized
- [] add test to store perspective only upon switching perspective, not initally when loading the app
- [] add test to pass CSS classes set on microfrontend view navigation
     -> see should set static CSS class(es) via layout.addView
     -> see should associate CSS class(es) with a navigation
- [] Consider removing state as not working properly. Alternatively, keep state api on navigate and navigateView, but remove magic with the resolver, i.e., state data must be
     read from history.state. This has the advantage, that we still provide the datastructe of having different state per view in the state object.  
-    Why remove resolver? is not working propertly for nested routes because resolver is installed on first route only -> requires route to be configured 'runGuardsAndResolvers: 'always' 

Other Topics
- [] Microfrontend Support: Consider removing CSS class from handle


Bug: Drag view to start page of workbench in other browser window
- test: drag view to startpage with workbench layout but no part is visible (strucutral parts with no views) -> drop target is node id
- test: drag view to startpage with initial part

