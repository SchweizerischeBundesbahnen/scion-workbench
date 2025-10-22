SCION Workbench
===============

SCION Workbench enables the creation of Angular web applications that require a flexible layout to display content side-by-side or stacked, all personalizable by the user via drag & drop. This type of layout is ideal for applications with non-linear workflows, enabling users to work on content in parallel. Examples include business applications, scientific or development tools, and command & control interfaces.

An application can have multiple layouts, called perspectives. A perspective defines an arrangement of parts and views. Parts can be docked to the side or positioned relative to each other. Views are stacked in parts and can be dragged to other parts. Content can be displayed in both parts and views.

Users can personalize the layout of a perspective and switch between perspectives. The workbench remembers the layout of a perspective, restoring it the next time it is activated.

A perspective typically has a main area part and parts docked to the side, providing navigation and context-sensitive assistance to support the user's workflow. Initially empty or displaying a welcome page, the main area is where the workbench opens views by default. Users can split the main area (or any other part) by dragging views side-by-side, vertically and horizontally, even across windows.

Unlike any other part, the main area is shared between perspectives, and its layout is not reset when resetting perspectives. Having a main area and multiple perspectives is optional.

The sources for this package are in [SCION Workbench](https://github.com/SchweizerischeBundesbahnen/scion-workbench) repo. Please file issues and pull requests against that repo.

License: EPL-2.0
