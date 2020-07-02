<a href="/docs/site/application-platform/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## SCION Workbench Application Platform

<p align="center">
  <img src="/docs/site/images/application-platform-deprecation-note.svg" alt="DEPRECATION NOTE" height="250">
</p>

### End of Life Announcement

**While the SCION Application Platform did many things right, there was a strong push to rewrite the project so that it no longer depends on the SCION Workbench. A separation would provide non-workbench projects with proven concepts and solid tools to implement a microfrontend architecture on their own. That way, the [SCION Microfrontend Platform][link-scion-microfrontend-platform] was born, a lightweight, web stack agnostic library that has no user-facing components and does not dictate any form of application structure. It focuses on cross-origin communication, routing, and embedding of microfrontends.**

<a href="https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/README.md"><img src="/docs/site/images/arrow-right.svg">
**Learn more about the new SCION Microfrontend Platform**
</a>

Microfrontend support for the SCION Workbench will be back soon. We are working on the integration of the new [SCION Microfrontend Platform][link-scion-microfrontend-platform] into the workbench to enable a seamless integration of microfrontends as workbench views. Embedded microfrontends will be able to interact with the workbench via a framework-agnostic workbench API and benefit from the full functionality of the SCION Microfrontend Platform.

***

SCION Workbench Application Platform is an extension of the SCION Workbench and provides the mechanics for integrating microfrontends into the SCION Workbench. Any web app can be integrated. If the web app does not interact with workbench, there is no need for adaptation. For a deeper integration, the platform provides a framework-agnostic API to interact with the workbench.

***

- [**Getting started**][link-getting-started]\
  Learn about the core concepts of the Workbench Application Platform, how to setup an application platform and how to integrate your first applications.

- [**How To**][link-how-to]\
  Get answers to the most common questions when integrating applications.

- [**Demo**][link-demo]\
  See a live demo of the Workbench Application Platform integrating two applications and learn how dev-tools can help developers to have a better overview of the applications installed in the platform.

***

[link-getting-started]:/docs/site/application-platform/getting-started.md
[link-how-to]: /docs/site/application-platform/howto/how-to.md
[link-demo]: https://scion-workbench-application-platform.now.sh
[link-scion-microfrontend-platform]: https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/README.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
