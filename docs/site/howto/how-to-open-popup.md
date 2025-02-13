<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Popup

A popup is a visual workbench component for displaying content above other content. It is positioned relative to an anchor and
moves when the anchor moves. By default, the popup closes on focus loss or when pressing the escape key.

The anchor is used to position the popup based on its preferred alignment:
- Using an element: The popup opens and sticks to the element.
- Using coordinates: The popup opens and sticks relative to the view or page bounds.

If the popup is opened within a view, it only displays if the view is active and closes when the view is closed.

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

To interact with the popup, the popup component can inject the popup handle `Popup`, e.g., to read input passed to the popup or to close the popup, optionally passing a result to the popup opener.

```ts
import {inject} from '@angular/core';
import {Popup} from '@scion/workbench';

// Close the popup
inject(Popup).close();

// Read data passed to the popup
inject(Popup).input;
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
