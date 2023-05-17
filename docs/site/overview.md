<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > Overview

The SCION Workbench is a library for Angular application that enables the flexible arrangement of content. In the workbench, content is displayed in views. Views can be arranged side-by-side or stacked, all personalizable by the user via drag & drop.

The workbench has a main area and a peripheral area for placing views. The main area is the primary place for views to interact with the application. Typically, it is initially blank or displays a start page. The peripheral area arranges views around the main area. Peripheral views can be used to provide entry points to the application, tools or context-sensitive assistance to support the user's workflow.

Multiple arrangements of peripheral views, called perspectives, are supported. Different perspectives provide a different perspective on the application while sharing the main area. Only one perspective can be active at a time.

 [<img src="/docs/site/images/workbench-layout.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-parts.svg)

#### Developer Experience
The SCION Workbench integrates seamlessly with Angular, leveraging familiar Angular APIs and concepts. It is designed to have minimal impact on development. Developing with the SCION Workbench is as straightforward as developing a regular Angular application. Workbench views are registered as primary routes that can be navigated using the router. Data is passed to views through navigation, either as path or matrix parameters. A view can read passed data from `ActivatedRoute`.

Ultimately, because the workbench navigation is fully based on the Angular Router, the application can continue to leverage the rich and powerful features of the Angular Router, such as lazy component loading, resolvers, browser back/forward navigation, persistent navigation, and more. Dependency on SCION is minimal.

#### Integration into Angular
A view is a named router outlet that is filled based on the current Angular router state. For all top-level primary routes, SCION Workbench registers view-specific secondary routes, allowing routing on a per-view basis. The browser URL contains the path and arrangement of navigated views, enabling persistent navigation, i.e., the workbench layout is restored when reloading the application. Unlike the arrangement of views in the main area, the arrangement of views in the peripheral area is stored in local storage.

The figure below shows the browser URL when there are 3 views opened in the main area. For each view, Angular adds an auxiliary route to the URL. An auxiliary route consists of the view identifier and the path. Multiple views are separated by two slashes.

 [<img src="/docs/site/images/navigational-state.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/navigational-state.svg)


[link-features]: /docs/site/features.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
