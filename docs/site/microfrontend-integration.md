<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > Microfrontend

The SCION Workbench is well suited for adopting a microfrontend architecture since different web applications can contribute views in the form of microfrontends.

A microfrontend architecture can be achieved in many different ways. If you are looking for the highest possible level of isolation between microfrontends, consider using the built-in microfrontend support based on the [SCION Microfrontend Platform][link-scion-microfrontend-platform].

The SCION Microfrontend Platform is a lightweight library specifically designed to facilitate the embedding of microfrontends via iframes. Microfrontends can seamlessly interact with the SCION Workbench using the [SCION Workbench Client][link-scion-workbench-client] or communicate with other microfrontends using the SCION Microfrontend Platform. Any web application can be integrated as a workbench view. Likewise, a workbench view can embed other microfrontends, and so on.

> Note that the documentation for integrating microfrontends into the SCION Workbench is still missing. We are working on a comprehensive guide that will cover the integration of microfrontends.

[link-features]: /docs/site/features.md
[link-scion-microfrontend-platform]: https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/README.md
[link-scion-workbench-client]: https://www.npmjs.com/package/@scion/workbench-client

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
