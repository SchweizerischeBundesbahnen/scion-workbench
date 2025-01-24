**<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Part

### How to display content in a part
A part can display content when its view stack is empty.

To display content in a part, the part must be navigated, similar to navigating a view.
A navigated part can still have views but won't display navigated content unless its view stack is empty.
Views cannot be dragged into parts displaying navigated content, except for the main area part.

The following example adds a part to the right of the main area and navigates it.
```ts
import {MAIN_AREA, provideWorkbench} from '@scion/workbench';

provideWorkbench({
  layout: factory => factory
    .addPart(MAIN_AREA)
    .addPart('sidebar', {relativeTo: MAIN_AREA, align: 'right'})
    .navigatePart('sidebar', ['path/to/sidebar'])
});
```

A part can also be navigated using the `WorkbenchRouter`.

```ts
import {inject} from '@angular/core';
import {WorkbenchRouter} from '@scion/workbench';

inject(WorkbenchRouter).navigate(layout => layout.navigatePart('sidebar', ['path/to/sidebar']));
```

Like any other part, the main area part can be navigated, allowing the display of a desktop when no view is opened in the main area. 
```ts
import {MAIN_AREA, provideWorkbench} from '@scion/workbench';

provideWorkbench({
  layout: factory => factory
    .addPart(MAIN_AREA)
    .navigatePart(MAIN_AREA, ['path/to/desktop'])
});
```

To maintain a clean URL, use a hint and navigate to the empty path route.
```ts
import {MAIN_AREA, provideWorkbench} from '@scion/workbench';

provideWorkbench({
  layout: factory => factory
    .addPart(MAIN_AREA)
    .navigatePart(MAIN_AREA, [], {hint: 'desktop'})
});
```

The above navigation resolves to the following route.
```ts
import {provideRouter} from '@angular/router';
import {canMatchWorkbenchPart} from '@scion/workbench';

provideRouter([
  {
    path: '',
    component: DesktopComponent,
    canMatch: [canMatchWorkbenchPart('desktop')],
  }
]);
```

[menu-how-to]: /docs/site/howto/how-to.md
[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
