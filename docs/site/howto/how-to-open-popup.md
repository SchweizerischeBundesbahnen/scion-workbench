<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Popup
A popup is a visual workbench element for displaying content above other content. It is positioned relative to an anchor, which can be an element or a coordinate.
The popup moves with the anchor. By default, the popup closes on focus loss or when pressing the escape key.

A popup can be bound to a context (e.g., a part or view), displaying the popup only if the context is visible and closing it when the context is disposed. Defaults to the calling context.

### How to Open a Popup
To open a popup, inject `WorkbenchPopupService` and invoke the `open` method, passing the component to display.

```ts
import {inject} from '@angular/core';
import {WorkbenchPopupService} from '@scion/workbench';

const popupService = inject(WorkbenchPopupService);

popupService.open(YourPopupComponent, {
  anchor: event.target as HTMLElement,
  align: 'south',
});
```

A popup is positioned using an anchor, which can be an element or a coordinate. The alignment controls the preferred side where to open the popup relative to the anchor. Defaults to `north`.

```ts
import {inject} from '@angular/core';
import {WorkbenchPopupService} from '@scion/workbench';

const popupService = inject(WorkbenchPopupService);

popupService.open(YourPopupComponent, {
  anchor: {x: 100, y: 500},
  align: 'west', 
});
```

Opening the popup returns a Promise, that resolves to the result when the popup is closed.

```ts
import {inject} from '@angular/core';
import {WorkbenchPopupService} from '@scion/workbench';

const popupService = inject(WorkbenchPopupService);

const result = await popupService.open(YourPopupComponent, {
  anchor: event.target as HTMLElement,
});
```

### How to Pass Data to the Popup
Data can be passed to the popup component as inputs in the popup options.

```ts
import {inject} from '@angular/core';
import {WorkbenchPopupService} from '@scion/workbench';

const popupService = inject(WorkbenchPopupService);

popupService.open(YourPopupComponent, {
  anchor: event.target as HTMLElement,
  inputs: {
    firstname: 'Firstname',
    lastname: 'Lastname',
  },
});
```

Popup inputs are available as input properties in the popup component.

```ts
import {Component, input} from '@angular/core';

@Component({...})
export class YourPopupComponent {
  firstname = input.required();
  lastname = input.required();
}
```

Alternatively, data can be passed for injection via a custom injector (`WorkbenchPopupOptions.injector`) or providers (`WorkbenchPopupOptions.providers`).

### How to Close the Popup
The popup component can inject the `WorkbenchPopup` handle and close the popup, optionally passing a result to the popup opener.

```ts
import {inject} from '@angular/core';
import {WorkbenchPopup} from '@scion/workbench';

// Closes the popup.
inject(WorkbenchPopup).close();

// Closes the popup with a result.
inject(WorkbenchPopup).close('some result');
```

### How to Size the Popup
By default, the popup adapts its size to the component size. Configure size constraints using the `WorkbenchPopup` handle.

```ts
import {inject} from '@angular/core';
import {WorkbenchPopup} from '@scion/workbench';

// Sets a fixed size.
inject(WorkbenchPopup).size.height = '500px';
inject(WorkbenchPopup).size.width = '600px';

// Sets the minimum size of the popup.
inject(WorkbenchPopup).size.minHeight = '300px';
inject(WorkbenchPopup).size.minWidth = '200px';

// Sets the maximum size of the popup.
inject(WorkbenchPopup).size.maxHeight = '900px';
inject(WorkbenchPopup).size.maxWidth = '700px';
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
