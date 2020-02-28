![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

# Overview

SCION Workbench helps to build multi-view web applications and integrates separate micro frontends into a consistent rich web application. Views are shown within tabs which can be flexibly arranged and dragged around by the user.

<a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/resources/site/pics/workbench-large.png">![SCION Workbench](/resources/site/pics/workbench-small.png)</a>

The Workbench provides core features of a modern rich web application.
-	tabbed, movable and stackable views
-	activity panel as application entry point
- popups
-	global notifications 
-	global or view-local message boxes
- global or view-local viewpart actions
-	URL encoded navigational state

<a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/resources/site/pics/workbench-sketch-large.png">![SCION Workbench Features](/resources/site/pics/workbench-sketch-small.png)</a>

## Background
Web frontends are becoming more and more common even for complex business applications. To tackle complexity and lifecycle of enterprise application landscapes there is a strong trend towards micro-service based backends and so called micro frontends. Micro frontends break-up hard to handle monoliths into parts by allowing different lifecycle, hosting on different backend systems and usage of completely different web development stacks. The latter is particularly important nowadays as we see a huge dynamic in Web frameworks: they evolve and may also disappear quickly.

While micro frontends offer several benefits from the development and deployment point of view end users still need an integrated and consistent interface which offers a similar performance as every single micro frontend.

Software developers need a simple and lightweight mechanism for common tasks like opening an activity or a view for e.g. a business object’s details.

## Solution and Technology
SCION Workbench builds on top of Angular but it does not impose a dependency on Angular or any other framework for micro frontends hosted in workbench views.

The workbench is a lightweight application frame which depends on Angular only. The navigation is fully based on Angular routing with every view having its separate router outlet. That allows routing on a per-view basis, with all the benefits like lazy component loading, route guards and the application URL to reflect navigational state. As many views may be opened at the same time, views not presented to the user are removed from Angular change detection tree to not compromise application performance.

As a first level Angular citizen and with routing at its heart, it is like to develop a regular Angular application which you feel familiar with instantly. Integration into SCION Workbench is as lean as possible. Any vanilla Angular component can act as workbench view and obtain data via route parameters. 

Our vision is to provide you with a ready to go workbench frame for production use. We believe in first class code quality and a profound understanding of the things we do.

## Project Status
Development is still at a very early stage mainly driven by requirements of the project. Many other use cases are imaginable. Hence, we encourage other developers to join the project and contribute to make SCION Workbench constantly better and more stable.

Further development will mainly focus on stability and performance, micro frontend integration points and features like theming, multi-window and responsive design.

We would like to thank SBB which supports open source software and made SCION Workbench possible in the first place.

### Disclaimer
As for now, the SCION Workbench and the SCION Workbench Application Platform are exclusively optimized and tested on the latest Google Chrome Release. Nevertheless, most things should work fine on other modern browsers like Firefox or Microsoft Edge. We are planning to support and test more browsers in the future.

## Current Version
[![Project version](https://img.shields.io/npm/v/@scion/workbench.svg)][menu-download] [![Project version](https://img.shields.io/npm/v/@scion/workbench/next.svg)][menu-download]

SCION Workbench `v0.0.0-beta.23` to `v0.0.0-beta.32` is only compatible with Angular version 8.x.

SCION Workbench `v0.0.0-beta.33` and newer is only compatible with Angular version 9.x. and published as Ivy library.

[menu-download]: https://www.npmjs.com/package/@scion/workbench

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md
