<a href="/README.md"><img src="/docs/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > Feature Overview

This page gives you an overview of existing and planned workbench features. Development is mainly driven by requirements of projects at [SBB][link-company-sbb] building a revolutionary traffic management system on behalf of the [SmartRail 4.0 project][link-project-sr40]. Many other features are imaginable. If a feature you need is not listed here or needs to be prioritized, please [file a GitHub issue](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/new?template=feature_request.md).

[![][done]](#) Done&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
[![][progress]](#) In Progress&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
[![][planned]](#) Planned&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
[![][deprecated]](#) Deprecated

|Feature|Category|Status|Note
|-|-|-|-|
|Viewgrid|layout|[![][done]](#)|Grid for the flexible arrangement of views.
|Viewdrag|layout|[![][done]](#)|The user can drag views to different locations in the grid or display views side by side, both vertically and horizontally. Viewdrag also works across browser windows of the same web application.
|Multi-Window|layout|[![][done]](#)|Views can be opened in new browser windows.
|Viewpart Actions|layout|[![][done]](#)|Actions that are displayed in the tabbar of a viewpart after the last visible viewtab. Actions can stick to a view, so they are only visible when the view is active.
|View Context Menu|layout|[![][done]](#)|A viewtab has a context menu. By default, the workbench adds some workbench-specific menu items to the context menu, such as for closing other views. Custom menu items can be added to the context menu as well.
|Perspective|layout|[![][planned]](#)|A perspective defines the initial arrangement of border panes. Multiple perspectives are possible, useful if having different application contexts. 
|Border Pane|layout|[![][planned]](#)|Border panes allow the display of auxiliary content or context-sensitive assistance. Border panes are located at the edges of the view area.
|Persistent Navigation|navigation|[![][done]](#)|The arrangement of the views and displayed routes are added to the browser URL; thus, a page refresh restores the workbench layout.
|Default Page|layout|[![][done]](#)|The workbench adds a primary router outlet when no view is opened, displaying the empty path route.
|Microfrontend Support|microfrontend|[![][progress]](#)|Microfrontends can be opened in views. Embedded microfrontends can interact with the workbench using a framework-angostic workbench API.
|Theming|customization|[![][planned]](#)|A custom theme can be applied to change the look of the workbench.
|Responsive Design|layout|[![][planned]](#)|The workbench adapts its layout to the current display size and device. 
|Electron Support|env|[![][planned]](#)|The workbench can be used in desktop applications built with [Electron](https://www.electronjs.org/) and supports window arrangements.
|Localization (l10n)|env|[![][planned]](#)|The workbench allows the localization of built-in texts such as texts in context menus.
|Browser Support|env|[![][planned]](#)|The workbench works with most modern browsers. As of now, the workbench is optimized and tested on browsers based on the Chromium rendering engine (Google Chrome, Microsoft Edge). However, the workbench should work fine on other modern browsers as well.
|Message Box|control|[![][done]](#)|The workbench allows displaying content in a message box. The message box can be either view or application modal.
|Notification Ribbon|control|[![][done]](#)|The workbench allows showing content in notifications ribbons. Notifications slide in at the top right corner. Multiple notifications are displayed one below the other.
|Popup|control|[![][done]](#)|The workbench allows displaying content in a popup overlay.
|Activity|layout|[![][done]](#)&nbsp;&nbsp;[![][deprecated]](#)|Visual workbench element on the left side of the workbench layout. (We will drop support for activities once supporting border panes) 
|Activity Actions|layout|[![][done]](#)&nbsp;&nbsp;[![][deprecated]](#)|Actions in the header of an activity. (We will drop support for activities once supporting border panes)
|Developer guide|doc|[![][planned]](#)|Guide describing the workbench layout, its concepts and fundamental APIs.
|Viewtab|customization|[![][done]](#)|The built-in viewtab can be replaced with a custom viewtab implementation, e.g., to add additional functionality. 

[done]: /docs/site/images/icon-done.svg
[progress]: /docs/site/images/icon-in-progress.svg
[planned]: /docs/site/images/icon-planned.svg
[deprecated]: /docs/site/images/icon-deprecated.svg

[link-company-sbb]: http://www.sbb.ch
[link-project-sr40]: https://smartrail40.ch

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
