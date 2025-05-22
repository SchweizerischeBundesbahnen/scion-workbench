<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Desktop

The workbench displays a desktop when the layout is empty (no view and no navigated part).

A desktop can provide instructions for working with the application, display a welcome page, or provide links to open views.

### How to Provide a Desktop
Add the directive `wbDesktop` to an `<ng-template>` child of the `<wb-workbench>` component. The template content is used as the desktop content.

```html
<wb-workbench>
  <ng-template wbDesktop>
    Welcome
  </ng-template>
</wb-workbench>
```

> [!TIP]
> Using `@if` allows displaying the desktop based on a condition, e.g. the active perspective.

For layouts with a main area, it is recommended to navigate the main area part instead.
Refer to [How to display content in a part][link-how-to-navigate-part] for an example of how to navigate the main area part.

[link-how-to-navigate-part]: /docs/site/howto/how-to-navigate-part.md

[menu-how-to]: /docs/site/howto/how-to.md
[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
