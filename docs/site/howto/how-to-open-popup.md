<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Popup
A popup is a visual workbench element for displaying content above other content. It is positioned relative to an anchor, which can be an element or a coordinate.
The popup moves with the anchor. By default, the popup closes on focus loss or when pressing the escape key.

A popup can be bound to a context (e.g., a part or view), displaying the popup only if the context is visible and closing it when the context is disposed. Defaults to the calling context.

### How to Open a Popup
To open a popup, inject `WorkbenchPopupService` and invoke the `open` method, passing a `PopupConfig` options object to control the appearance of the popup.

```ts
import {inject} from '@angular/core';
import {WorkbenchPopupService} from '@scion/workbench';

const popupService = inject(WorkbenchPopupService);

const result = await popupService.open({
  component: PopupComponent,
  anchor: event.target as HTMLElement,
  align: 'south',
});
```

The popup component can inject the popup handle `WorkbenchPopup` to interact with the popup, e.g., to read input passed to the popup or to close the popup, optionally passing a result to the popup opener.

```ts
import {inject} from '@angular/core';
import {WorkbenchPopup} from '@scion/workbench';

// Close the popup
inject(WorkbenchPopup).close();

// Read data passed to the popup
inject(WorkbenchPopup).input;
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
