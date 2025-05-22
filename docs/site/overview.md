<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > Overview

SCION Workbench enables the creation of Angular web applications that require a flexible layout to display content side-by-side or stacked, all personalizable by the user via drag & drop. This type of layout is ideal for applications with non-linear workflows, enabling users to work on content in parallel. Examples include business applications, scientific or development tools, and command & control interfaces.

An application can have multiple layouts, called perspectives. A perspective defines an arrangement of parts and views. Parts can be docked to the side or positioned relative to each other. Views are stacked in parts and can be dragged to other parts. Content can be displayed in both parts and views.

Users can personalize the layout of a perspective and switch between perspectives. The workbench remembers the last layout of each perspective, restoring it the next time it is activated.

A perspective typically has a main area part and other parts docked to the side, providing navigation and context-sensitive assistance to support the user's workflow.

[<img src="/docs/site/images/workbench-layout-1.drawio.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-1.drawio.svg)

Initially empty or displaying a welcome page, the main area is where the workbench opens new views by default.

[<img src="/docs/site/images/workbench-layout-2.drawio.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-2.drawio.svg)

Users can split the main area (or any other part) by dragging views side-by-side, vertically and horizontally, even across windows. 

[<img src="/docs/site/images/workbench-layout-3.drawio.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-3.drawio.svg)


> [!NOTE]
> - Unlike any other part, the main area is shared between perspectives, and its layout is not reset when resetting perspectives.
> - Having a main area and multiple perspectives is optional.

#### Developer Experience
The SCION Workbench is built on top of Angular and is designed to have minimal impact on application development. The Workbench API is based on familiar Angular concepts, making development straightforward.

Any component can be opened as a view. A view is a regular Angular component associated with a route. Views are navigated using the Workbench Router. Like the Angular Router, it has a `navigate` method to open views or change the workbench layout. Data is passed to views through navigation. A view can read data from its `ActivatedRoute`.

Because SCION Workbench uses Angular's routing mechanism to navigate and lay out views, the application can harness Angular's extensive routing capabilities, such as lazy component loading, resolvers, browser back/forward navigation, persistent navigation, and more.

#### Integration into Angular
SCION Workbench integrates with the Angular Router to perform layout changes and populate views, enabling persistent and backward/forward navigation.

A view is a named router outlet that is filled based on the current Angular router state. The SCION Workbench registers view-specific auxiliary routes for all routes, enabling routing on a per-view basis.

The browser URL contains the path and arrangement of views in the main area. The arrangement of views outside the main area is passed as state to the navigation and stored in workbench storage (defaults to local storage).
The figure below shows the browser URL when there are 3 views opened in the main area. For each view, Angular adds an auxiliary route to the URL. An auxiliary route consists of the view identifier and the path. Multiple views are separated by two slashes.

 [<img src="/docs/site/images/workbench-url.drawio.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-url.drawio.svg)


[link-features]: /docs/site/features.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
