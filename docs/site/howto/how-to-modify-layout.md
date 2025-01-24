<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Layout

The workbench layout is a grid of parts. Parts are aligned relative to each other. Each part is a stack of views. Content is displayed in views or parts.

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
