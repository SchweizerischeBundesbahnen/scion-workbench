<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > Overview

SCION Workbench enables the creation of Angular web applications that require a flexible layout to arrange content side-by-side or stacked, all personalizable by the user via drag & drop. This type of layout is ideal for applications with non-linear workflows, enabling users to work on content in parallel.

The workbench layout is a grid of parts. Parts are aligned relative to each other. A part is a stack of views. Content is displayed in views.

The layout can be divided into a main and a peripheral area, with the main area as the primary place for opening views. The peripheral area arranges parts around the main area to provide navigation or context-sensitive assistance to support the user's workflow. Defining a main area is optional and recommended for applications requiring a dedicated and maximizable area for user interaction.

Multiple layouts, called perspectives, are supported. Perspectives can be switched. Only one perspective is active at a time. Perspectives share the same main area, if any.

 [<img src="/docs/site/images/workbench-layout.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-parts.svg)

#### Developer Experience
The SCION Workbench is built on top of Angular and is designed to have minimal impact on application development. The Workbench API is based on familiar Angular concepts, making development straightforward.

Any component can be opened as a view. A view is a regular Angular component associated with a route. Views are navigated using the Workbench Router. Like the Angular Router, it has a `navigate` method to open views or change the workbench layout. Data is passed to views through navigation. A view can read data from its `ActivatedRoute`.

Because SCION Workbench uses Angular's routing mechanism to navigate and lay out views, the application can harness Angular's extensive routing capabilities, such as lazy component loading, resolvers, browser back/forward navigation, persistent navigation, and more.

#### Integration into Angular
SCION Workbench integrates with the Angular Router to perform layout changes and populate views, enabling persistent and backward/forward navigation.

A view is a named router outlet that is filled based on the current Angular router state. The SCION Workbench registers view-specific auxiliary routes for all routes, enabling routing on a per-view basis.

The browser URL contains the path and arrangement of views in the main area. The arrangement of views outside the main area is passed as state to the navigation and stored in local storage.
The figure below shows the browser URL when there are 3 views opened in the main area. For each view, Angular adds an auxiliary route to the URL. An auxiliary route consists of the view identifier and the path. Multiple views are separated by two slashes.

 [<img src="/docs/site/images/navigational-state.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/navigational-state.svg)


[link-features]: /docs/site/features.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
