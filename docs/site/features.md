<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > Feature Overview

This page gives you an overview of existing and planned workbench features. Development is mainly driven by requirements of projects at [SBB][link-company-sbb] building a revolutionary traffic management system. Many other features are imaginable. If a feature you need is not listed here or needs to be prioritized, please [file a GitHub issue](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/new?template=feature_request.md).

[![][done]](#) Done&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
[![][progress]](#) In Progress&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
[![][planned]](#) Planned&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
[![][deprecated]](#) Deprecated

| Feature                 |Category|Status|Note
|-------------------------|-|-|-|
| Workbench Layout        |layout|[![][done]](#)|Layout for the flexible arrangement of views side-by-side or stacked, all personalizable by the user via drag & drop.
| Activity Layout         |layout|[![][progress]](#)|Compact presentation of views around the main area, similar to activities known from Visual Studio Code or IntelliJ.
| Perspective             |layout|[![][done]](#)|Multiple layouts, called perspectives, are supported. Perspectives can be switched with one perspective active at a time. Perspectives share the same main area, if any. [#305](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/305).
| View                    |layout|[![][done]](#)|Visual component for displaying content stacked or side-by-side in the workbench layout.
| Multi-Window            |layout|[![][done]](#)|Views can be opened in new browser windows.
| Part Actions            |layout|[![][done]](#)|Actions that are displayed in the tabbar of a part. Actions can stick to a view, so they are only visible if the view is active.
| View Context Menu       |layout|[![][done]](#)|A viewtab has a context menu. By default, the workbench adds some workbench-specific menu items to the context menu, such as for closing other views. Custom menu items can be added to the context menu as well.
| Persistent Navigation   |navigation|[![][done]](#)|The arrangement of the views is added to the browser URL or local storage, enabling persistent navigation.
| Start Page              |layout|[![][done]](#)|A start page can be used to display content when all views are closed.
| Microfrontend Support   |microfrontend|[![][done]](#)|Microfrontends can be opened in views. Embedded microfrontends can interact with the workbench using a framework-angostic workbench API. The documentation is still missing. [#304](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/304).
| Theming                 |customization|[![][done]](#)|An application can define a custom theme to change the default look of the SCION Workbench. [#110](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/110)
| Responsive Design       |layout|[![][planned]](#)|The workbench adapts its layout to the current display size and device. [#112](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/112) 
| Electron/Edge Webview 2 |env|[![][planned]](#)|The workbench can be used in desktop applications built with [Electron](https://www.electronjs.org/) and/or [Microsoft Edge WebView2](https://docs.microsoft.com/en-us/microsoft-edge/webview2/) to support window arrangements. [#306](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/306)
| Localization (l10n)     |env|[![][planned]](#)|The workbench allows the localization of built-in texts such as texts in context menus and manifest entries. [#255](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/255)
| Browser Support         |env|[![][planned]](#)|The workbench works with most modern browsers. As of now, the workbench is optimized and tested on browsers based on the Chromium rendering engine (Google Chrome, Microsoft Edge). However, the workbench should work fine on other modern browsers as well. [#111](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/111)
| Dialog                  |control|[![][progress]](#)|Content can be displayed in a modal dialog. A dialog can be view or application modal. Multiple dialogs are stacked.
| Message Box             |control|[![][done]](#)|Content can be displayed in a modal message box. A message box can be view or application modal. Multiple message boxes are stacked.
| Notification Ribbon     |control|[![][done]](#)|Notifications can be displayed to the user. Notifications slide in in the upper-right corner. Multiple notifications are displayed one below the other.
| Popup                   |control|[![][done]](#)|Content can be displayed in a popup overlay. A popup does not block the application.
| Developer guide         |doc|[![][planned]](#)|Developer Guide describing the workbench layout, its conceptsm fundamental APIs and built-in microfrontend support. [#304](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/304)
| Tab                     |customization|[![][done]](#)|The built-in viewtab can be replaced with a custom viewtab implementation, e.g., to add additional functionality. 

[done]: /docs/site/images/icon-done.svg
[progress]: /docs/site/images/icon-in-progress.svg
[planned]: /docs/site/images/icon-planned.svg
[deprecated]: /docs/site/images/icon-deprecated.svg

[link-company-sbb]: http://www.sbb.ch

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
