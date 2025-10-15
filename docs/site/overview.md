<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > Overview

SCION Workbench enables the creation of Angular web applications that require a flexible layout to display content side-by-side or stacked, all personalizable by the user via drag & drop. This type of layout is ideal for applications with non-linear workflows, enabling users to work on content in parallel. Examples include business applications, scientific or development tools, and command & control interfaces.

An application can have multiple layouts, called perspectives. A perspective defines an arrangement of parts and views. Parts can be docked to the side or positioned relative to each other. Views are stacked in parts and can be dragged to other parts. Content can be displayed in both parts and views.

Users can personalize the layout of a perspective and switch between perspectives. The workbench remembers the layout of a perspective, restoring it the next time it is activated.

A perspective typically has a main area part and parts docked to the side, providing navigation and context-sensitive assistance to support the user's workflow.

[<img src="/docs/site/images/workbench-layout-1.drawio.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-1.drawio.svg)

Initially empty or displaying a welcome page, the main area is where the workbench opens views by default.

[<img src="/docs/site/images/workbench-layout-2.drawio.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-2.drawio.svg)

Users can split the main area (or any other part) by dragging views side-by-side, vertically and horizontally, even across windows. 

[<img src="/docs/site/images/workbench-layout-3.drawio.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-3.drawio.svg)


> [!NOTE]
> - Unlike any other part, the main area is shared between perspectives, and its layout is not reset when resetting perspectives.
> - Having a main area and multiple perspectives is optional.

#### Developer Experience
The SCION Workbench is built on top of Angular and is designed to have minimal impact on application development. The Workbench API is based on familiar Angular concepts, making development straightforward.

Any component associated with a route can be opened as a view or displayed in a part. Similar to Angular, the workbench provides a router for view and part navigation. A view or part can inject `ActivatedRoute` to get parameters passed to the navigation. The navigation is based on Angular's routing mechanism and thus supports lazy component loading, resolvers, browser back/forward navigation, persistent navigation, and more.

[link-features]: /docs/site/features.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
