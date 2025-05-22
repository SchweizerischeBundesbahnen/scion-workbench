<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Layout

The workbench layout is an arrangement of parts and views. Parts can be docked to the side or positioned relative to each other. Views are stacked in parts and can be dragged to other parts. Content can be displayed in both parts and views.

### How to Modify the Workbench Layout

The workbench layout can be modified using the `navigate` method of the `WorkbenchRouter` by passing a function. The router will invoke this function with the current workbench layout. The layout has methods for modifying it. The layout is immutable; each modification creates a new instance.

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

> [!NOTE]
> The function can call `inject` to get any required dependencies.


[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
