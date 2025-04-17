<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Layout

The SCION Workbench provides a layout for displaying content side-by-side or stacked, all personalizable by the user via drag & drop.

The layout defines an arrangement of parts and views. Parts can be docked to the side or aligned relative to each other, and views are contained within parts. Content can be displayed in both parts and views.

Users can drag views to different parts or place them side-by-side, horizontally or vertically, even across windows. Docked parts can be minimized to the side to create more space for the main content.

A typical workbench application features a main area part, and several parts docked to the side, providing navigation and context-sensitive assistance to support the user's workflow. Multiple layouts, referred to as perspectives, can be created. Users can switch between perspectives. Views in the main area can be pinned to remain open when switching perspectives.

The SCION Workbench remembers the last layout used and will restore it the next time the application is opened.

### How to modify the workbench layout

The workbench layout can be modified using the `navigate` method of the `WorkbenchRouter` by passing a function. The router will invoke this function with the current workbench layout. The layout has methods for modifying it. The layout is immutable, so each modification creates a new instance. Use the instance for further modifications and finally return it.

The following example adds a part to the left of the main area, inserts a view and navigates it.

```ts
import {inject} from '@angular/core';
import {MAIN_AREA, WorkbenchRouter} from '@scion/workbench';

inject(WorkbenchRouter).navigate(layout => layout
  .addPart('left', {relativeTo: MAIN_AREA, align: 'left'})
  .addView('navigator', {partId: 'left'})
  .navigateView('navigator', ['path/to/view'])
  .activateView('navigator')
);
```

> The function can call `inject` to get any required dependencies.


[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
