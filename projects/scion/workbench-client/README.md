SCION Workbench Client
======================

SCION Workbench Client allows integrating a web app into the [SCION Workbench][link-scion-workench] as a microfrontend, providing API for interacting with the workbench and other microfrontends. SCION Workbench Client is a pure TypeScript library based on the framework-agnostic [SCION Microfrontend Platform][link-scion-microfrontend-platform] library and can be used with any web stack.

#### How the SCION Workbench fits into the Microfrontend World
The SCION Workbench facilitates the creation of web applications that have a workbench layout for the flexible arrangement of content in views. A workbench layout is ideal for implementing a microfrontend architecture, as different web applications can contribute views in the form of microfrontends. SCION Workbench has built-in microfrontend support brought by the SCION Microfrontend Platform, a lightweight library for embedding microfrontends. Microfrontends embedded as views can interact seamlessly with the workbench using the SCION Workbench Client, or communicate with other microfrontends via the SCION Microfrontend Platform. Any web application can be integrated as a workbench view. Likewise, a workbench view can embed further microfrontends, and so on.

> - For more information about the SCION Workbench, please visit us on GitHub: https://github.com/SchweizerischeBundesbahnen/scion-workbench.
> - For more information about the SCION Microfrontend Platform, please visit us on GitHub:  https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform.


The sources for this package are in the [SCION Workbench](https://github.com/SchweizerischeBundesbahnen/scion-workbench) repo on GitHub. Please file issues and pull requests against that repo.

License: EPL-2.0

[link-scion-microfrontend-platform]: https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform
[link-scion-workench]: https://github.com/SchweizerischeBundesbahnen/scion-workbench

