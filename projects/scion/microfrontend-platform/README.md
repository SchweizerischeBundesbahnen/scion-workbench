SCION Microfrontend Platform
============================

**SCION Microfrontend Platform provides the building blocks for integrating microfrontends based on iframes.**

SCION Microfrontend Platform is a TypeScript framework allowing us to integrate any web content on the client-side. It comes with a robust 
messaging facility for cross-origin intent- and topic-based communication supporting wildcard addressing, request-response message exchange pattern,
retained messaging, and more. Web content is embedded using a web component outlet that solves many of the cumbersome quirks of iframes.

The platform is UI framework agnostic and does not include or impose a UI. The platform integrates microfrontends by using iframes to provide the highest 
possible isolation between the microfrontends. Iframes, however, require microfrontends to have a fast startup time and impose some restrictions. 
For example, sharing state is more difficult because each microfrontend is mounted in a separate iframe. As for UI, microfrontends are trapped 
in their iframe boundary, which can be a strong limitation, particularly for overlays.

The platform aims to remove iframe restrictions where appropriate. For example, the platform bubbles selected keyboard events across iframe
boundaries, lets you determine if the focus is within a microfrontend, or changes the iframe size to the preferred size of embedded content.
You can further associate contextual data with an iframe that is then available in embedded content.
 
The platform supports the concept of intent-based communication, also known from the Android platform.
To interact with functionality available in the system, apps declare a respective intention in a manifest and are then qualified to issue an intent to 
interact. Apps can also provide capabilities. Capabilities are the counterpart to intentions and allow an app to provide functionality that qualified apps 
can call via intent. A capability can either be application-private or available to all apps in the system.

Intentions or capabilities are formulated in an abstract way, consist of a type and qualifier, and should include enough information to describe it.
The enforced declaration allows analyzing which app depends on each other and to look up capabilities for a flexible composition of web content.

The sources for this package are in [SCION Workbench](https://github.com/SchweizerischeBundesbahnen/scion-workbench) repo. Please file issues and pull requests against that repo.

License: EPL-2.0
