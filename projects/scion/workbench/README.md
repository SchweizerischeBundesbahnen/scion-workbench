SCION Workbench
===============

**The SCION Workbench provides a workbench layout for Angular applications similar to the Eclipse Workbench for Eclipse RCP applications.**

Workbench layouts are useful for applications with non-linear workflows where users want to flexibly view and edit content in parallel. Examples include specialized business applications, scientific or development tools, as well as command & control interfaces.

A workbench layout allows the user to arrange and resize parts of the application using drag and drop. The layout consists of a view area and can define border panes. In the view area, the user can view or edit content in views. A view has a handle which the user can grab to arrange views side by side in a grid or move views to other locations in the grid. Border panes provide the user with additional information or context-sensitive assistance.

Although SCION Workbench is designed for use in Angular applications, its workbench layout is particularly well suited for implementing a framework-agnostic microfrontend architecture, as different web applications can contribute views in the form of microfrontends. SCION Workbench has built-in microfrontend support from the [SCION Microfrontend Platform](https://www.npmjs.com/package/@scion/microfrontend-platform), a lightweight library for embedding microfrontends. Microfrontends embedded as views can interact seamlessly with the workbench using the [SCION Workbench Client](https://www.npmjs.com/package/@scion/workbench-client) or communicate with other microfrontends via the SCION Microfrontend Platform. Any web application can be integrated as a workbench view. Likewise, a workbench view can embed further microfrontends, and so on.

The sources for this package are in [SCION Workbench](https://github.com/SchweizerischeBundesbahnen/scion-workbench) repo. Please file issues and pull requests against that repo.

License: EPL-2.0
