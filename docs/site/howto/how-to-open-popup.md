<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Popup

A popup is a visual workbench component for displaying content above other content. It is positioned relative to an anchor,
which can be either a coordinate or an HTML element. The popup moves when the anchor moves. By default, the popup closes on focus loss, or when the user hits the escape key. If opening a popup in the context of a view, the popup is bound to the lifecycle of the view, that is, the popup is displayed only if the view is active and is closed when the view is closed.

### How to open a popup
To open a popup, inject `PopupService` and invoke the `open` method, passing a `PopupConfig` options object to control the appearance of the popup.

```ts
import {inject} from '@angular/core';
import {PopupService} from '@scion/workbench';

const popupService = inject(PopupService);

const result = await popupService.open({
  component: PopupComponent,
  anchor: event.target as HTMLElement,
  align: 'south',
});
```

To interact with the popup in the popup component, inject the popup handle `Popup`, e.g., to read input passed to the popup or to close the popup, optionally passing a result to the popup opener.


```typescript
import {inject} from '@angular/core';
import {Popup} from '@scion/workbench';

inject(Popup).close();
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
