<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > Announcements

On this page you will find the latest news about the development of the SCION Workbench.

- **2023-11: Added Workbench Dialog**\
  SCION Workbench enables the display of a component in a modal dialog. A dialog can be view-modal or application-modal.
 
- **2023-10: Theming of SCION Workbench**\
  SCION Workbench has introduced design tokens for applications to control the look of the workbench.
 
- **2023-10: Reworked Tab Design**\
  SCION Workbench has a new tab design for improved user experience and a modern and consistent look.

- **2023-05: Introduction of Perspectives**\
  SCION Workbench now supports the definition of one or more view arrangements, referred to as perspectives. Perspectives can be switched. Perspectives share the same main area, if any.
 
- **2023-05: Support Arranging Views Around the Main Area**\
  The workbench has a main area and a peripheral area for placing views. The main area is the primary place for views to interact with the application. The peripheral area arranges views around the main area. Peripheral views can be used to provide entry points to the application, tools or context-sensitive assistance to support the user's workflow.

- **2021-01: Built-in Microfrontend Support**\
We have added microfrontend support to the SCION Workbench.

  SCION Workbench has built-in microfrontend support from the [SCION Microfrontend Platform][link-scion-microfrontend-platform], a lightweight library for embedding microfrontends. Microfrontends embedded as views can interact seamlessly with the workbench using the [SCION Workbench Client][link-scion-workbench-client] or communicate with other microfrontends via the SCION Microfrontend Platform. Any web application can be integrated as a workbench view. Likewise, a workbench view can embed further microfrontends, and so on.

  Documentation and step-by-step instructions are still missing, but the JSDoc is quite detailed. See [WorkbenchConfig][link-workbench-config.ts] on how to enable microfrontend support in the workbench. In the meantime, for micro apps that want to interact with the workbench, we refer you to the [published TypeDoc][link-scion-workbench-client-api].

- **2020-11: Deletion of the SCION Application Platform**\
We have deleted the SCION application platform from our Git repository and deprecated respective NPM modules. This project is discontinued and will no longer be maintained. Its documentation is still online. The following NPM modules are deprecated: `@scion/workbench-application-platform`, `@scion/workbench-application-platform.api`, `@scion/workbench-application.core`, `@scion/workbench-application.angular`, `@scion/mouse-dispatcher`, `@scion/dimension` (moved to `@scion/toolkit`), `@scion/viewport` (moved to `@scion/toolkit`). 

  If you still need updates for new Angular versions, please let us know and submit a GitHub issue. Alternatively, micro applications can use the TypeScript module `@scion/workbench-application.core` instead of `@scion/workbench-application.angular`. We plan to release the new microfrontend support for the SCION Workbench by the end of 2020 so that you can migrate to Angular 11. Detailed migration instructions for upgrading to the new workbench microfrontend support will follow after its release.

- **2020-06: Integration of the SCION Microfrontend Platform**\
We are working on the integration of the new [SCION Microfrontend Platform][link-scion-microfrontend-platform] into the workbench to enable a seamless integration of microfrontends as workbench views. Embedded microfrontends will be able to interact with the workbench via a framework-agnostic workbench API and benefit from the full functionality of the SCION Microfrontend Platform.

- **2020-06: Deprecation of the SCION Application Platform**\
While the SCION Application Platform did many things right, there was a strong push to rewrite the project so that it no longer depends on the SCION Workbench. A separation would provide non-workbench projects with proven concepts and solid tools to implement a microfrontend architecture on their own. That way, the [SCION Microfrontend Platform][link-scion-microfrontend-platform] was born, a lightweight, web stack agnostic library that has no user-facing components and does not dictate any form of application structure. It focuses on cross-origin communication, routing, and embedding of microfrontends.

- **2020-06: Deprecation of Activities in SCION Workbench**\
On the way to a true workbench layout, we deprecate activities to introduce the more powerful and flexible workbench layout.


[link-scion-microfrontend-platform]: https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/README.md 
[link-scion-workbench-client]: https://www.npmjs.com/package/@scion/workbench-client
[link-scion-workbench-client-api]: https://scion-workbench-client-api.vercel.app
[link-workbench-config.ts]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/projects/scion/workbench/src/lib/workbench-config.ts

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
