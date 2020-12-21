<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

<p align="center">
  <a href="https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/README.md">
      <img src="/docs/site/images/microfrontend-platform-promotion.svg" alt="Microfrontend Platform Promotion" height="250">
  </a>
</p>

## SCION Workbench

**The SCION Workbench provides a workbench layout for Angular applications.**

Workbench layouts are useful for applications with non-linear workflows where users want to flexibly view and edit content in parallel. Examples include specialized business applications, scientific or development tools, as well as command & control interfaces.

The SCION Workbench supports tabbed views that enable users to arrange content to fit their individual needs. Fixed areas can be defined to display additional information or context-sensitive assistance. In addition, typical workbench controls such as overlays, message boxes, and notification ribbons are available.


[<img src="/docs/site/images/workbench-layout.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout.svg)

Although SCION Workbench is designed for use in Angular applications, its workbench layout is particularly well suited for implementing a framework-agnostic microfrontend architecture, as different web applications can contribute views in the form of microfrontends. SCION Workbench has built-in microfrontend support from the [SCION Microfrontend Platform][link-scion-microfrontend-platform], a lightweight library for embedding microfrontends. Microfrontends embedded as views can interact seamlessly with the workbench using the [SCION Workbench Client][link-scion-workbench-client] or communicate with other microfrontends via the SCION Microfrontend Platform. Any web application can be integrated as a workbench view. Likewise, a workbench view can embed further microfrontends, and so on.

***

#### Quickstart

- [**How SCION Workbench can help you**][link-about]\
  Get an overview of the SCION Workbench.

- [**Features**][link-features]\
  Get an overview of existing and planned features of the SCION Workbench.
 
- [**Installation and Getting Started**][link-getting-started]\
  Follow these steps to install the SCION Workbench in your project and start with a gentle introduction to the essentials of the SCION Workbench.

#### Miscellaneous  

- [**SCION Workbench Demo**][link-demo]\
  See a live demo of the SCION Workbench.
  
- [**How To Guides**][link-howto]\
  Get answers to the most common questions when developing an application with SCION Workbench.
  
- [**Announcements**][link-announcements]\
  Get the latest news about the further development of the SCION Workbench.

***

### Versions
- `v11.0.0-beta.2` Limited microfrontend support; more coming soon
- `v11.0.0-beta.1` and newer are only compatible with Angular version 11.x.
- `v0.0.0-beta.35` and newer are only compatible with Angular version 10.x.
- `v0.0.0-beta.33` and newer are only compatible with Angular version 9.x.
- `v0.0.0-beta.23` to `v0.0.0-beta.32` is only compatible with Angular version 8.x.

[![Project version](https://img.shields.io/npm/v/@scion/workbench.svg)][link-download]
[![Project version](https://img.shields.io/npm/v/@scion/workbench/next.svg)][link-download]
[![Continuous Integration and Delivery][link-github-actions-workflow:status]][link-github-actions-workflow]


[link-download]: https://www.npmjs.com/package/@scion/workbench
[link-github-actions-workflow]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/actions
[link-github-actions-workflow:status]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/workflows/Continuous%20Integration%20and%20Delivery/badge.svg?branch=master&event=push

[link-scion-microfrontend-platform]: https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/README.md
[link-scion-workbench-client]: https://www.npmjs.com/package/@scion/workbench-client
[link-about]: /docs/site/about.md
[link-getting-started]: /docs/site/getting-started.md
[link-howto]: /docs/site/howto/how-to.md
[link-demo]: https://schweizerischebundesbahnen.github.io/scion-workbench-demo/#/(view.24:person/64//view.22:person/32//view.5:person/79//view.3:person/15//view.2:person/38//view.1:person/66//activity:person-list)?viewgrid=eyJpZCI6MSwic2FzaDEiOlsidmlld3BhcnQuMSIsInZpZXcuMSIsInZpZXcuMiIsInZpZXcuMSJdLCJzYXNoMiI6eyJpZCI6Miwic2FzaDEiOlsidmlld3BhcnQuMiIsInZpZXcuMyIsInZpZXcuMyJdLCJzYXNoMiI6eyJpZCI6Mywic2FzaDEiOlsidmlld3BhcnQuNCIsInZpZXcuMjQiLCJ2aWV3LjI0Il0sInNhc2gyIjpbInZpZXdwYXJ0LjMiLCJ2aWV3LjIyIiwidmlldy41Iiwidmlldy4yMiJdLCJzcGxpdHRlciI6MC41MTk0Mzg0NDQ5MjQ0MDY2LCJoc3BsaXQiOmZhbHNlfSwic3BsaXR0ZXIiOjAuNTU5NDI0MzI2ODMzNzk3NSwiaHNwbGl0Ijp0cnVlfSwic3BsaXR0ZXIiOjAuMzIyNjI3NzM3MjI2Mjc3MywiaHNwbGl0IjpmYWxzZX0%3D
[link-features]: /docs/site/features.md
[link-announcements]: /docs/site/announcements.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md

