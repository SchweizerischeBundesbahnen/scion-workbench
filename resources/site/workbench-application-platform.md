![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

# SCION Workbench Application Platform

SCION Workbench Application Platform is an extension of SCION Workbench to integrate content from multiple web applications in a coherent way, thus enabling a micro frontend architecture for allowing different front-end frameworks to co-exist and independent delivery.

The platform provides the mechanics for client-side web application integration. Any web application can be integrated. If the site does not interact with the platform, there is no need for adaptation. For a deeper integration, the platform provides a framework-agnostic guest API.

A micro frontend architecture should only be implemented if absolutely required. For instance, if the application is developed by different teams, having independent lifecycle or using different web stacks. With micro frontends in place, there come some restrictions and limitations which you should be aware of. See core concepts for more information. For small applications, a micro frontend architecture is most probably overkill, and you should consider using standalone SCION Workbench instead.

***

- [**Getting started**][link-getting-started]\
  Learn about the core concepts of the Workbench Application Platform, how to setup an application platform and how to integrate your first applications.

- [**How To**][link-how-to]\
  Get answers to the most common questions when integrating applications.

- [**Demo**][link-demo]\
  See a live demo of the workbench application platform integrating two applications and learn how dev-tools can help developers to have a better overview of the applications installed in the platform.

***

[link-getting-started]:/resources/site/getting-started/workbench-application-platform/getting-started.md
[link-how-to]: /resources/site/how-to/workbench-application-platform/how-to.md
[link-demo]: https://scion-workbench-application-platform.now.sh

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md
