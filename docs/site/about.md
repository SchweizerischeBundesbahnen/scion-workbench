<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > Overview

The SCION Workbench facilitates the development of Angular web applications that require a complex workbench layout of multiple views and windows. The workbench is based on Angular and Angular CDK. One of its main goals is the seamless integration with Angular and a minimal dependency of your project on the SCION Workbench. The navigation is fully based on the Angular router.

***
*As a first-level Angular citizen and with routing at its heart, it is like developing a regular Angular application that you feel familiar with instantly. Our vision is to provide you with a ready to go workbench layout for production use.*
***

#### The Workbench Layout
The SCION Workbench provides a workbench layout for Angular applications similar to the Eclipse Workbench for Eclipse RCP applications. A workbench layout allows the user to arrange and resize parts of the application using drag and drop. The layout consists of a view area and can define border panes (not yet implemented). In the view area, the user can view or edit content in views. A view has a handle, usually in the form of a tab, which the user can grab to arrange views side by side in a grid or move views to other locations in the grid. Border panes provide the user with additional information or context-sensitive assistance.
 
 The SCION Workbench layout consists of the parts shown in the following figure. Refer to the [feature overview](features.md) to see which features are already supported.
 
 [<img src="/docs/site/images/workbench-layout-parts.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-parts.svg)
 

#### View Routing
A view is a placeholder that is filled based on the current Angular router state. Every view has an auxiliary router outlet, allowing routing on a per-view basis to display content. The browser URL contains the arrangement of the views and the routes of all views. As a result, the workbench layout is restored when the user reloads the page.

The figure below shows the structure of the browser URL when three views are displayed. For each view, Angular adds an auxiliary route to the URL. An auxiliary route consists of an identifier (view name) and the path of the route. Multiple views are separated by two slashes.

 [<img src="/docs/site/images/navigational-state.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/navigational-state.svg)

For each view, the workbench registers auxiliary routes for all primary routes.  The workbench provides a view router service and a view router-link directive to facilitate view routing. Views benefit from built-in Angular routing features such as route parameters, lazy component loading, route guards, and resolvers.  

Any routed Angular component can act as workbench view. To open a component in a view, you declare a primary route for that component in your Angular routing config and navigate using the view router service. It is identical to displaying a component in an Angular router outlet. The component can obtain data via route parameters and inject a reference to the workbench view to interact with the view, for example, to set the title of the view or to close the view.

#### Workbench Perspective (not yet implemented)
Perspectives can help to define different border pane arrangements to facilitate task-oriented interaction. Views are not bound to a perspective, making it possible to switch between tasks without losing context.


[link-features]: /docs/site/features.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
