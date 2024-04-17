<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Message Box

A message box is a standardized dialog for presenting a message to the user, such as an info, warning or alert, or for prompting the user for confirmation. The message can be plain text or a component, allowing for
structured content or input prompts.

Displayed on top of other content, a message box blocks interaction with other parts of the application. A message box can be view-modal or application-modal. Multiple message boxes are stacked, and only the topmost message box in each modality stack can be interacted with.

### How to display a text message
To display a text message, inject `MessageBoxService` and invoke the `open` method, passing the text to display. 

```ts
import {inject} from '@angular/core';
import {WorkbenchMessageBoxService} from '@scion/workbench';

inject(WorkbenchMessageBoxService).open('Lorem ipsum dolor sit amet.');
```

### How to display structured content
To display structured content, pass a component instead of a string literal.

Data can be passed to the component as inputs via the options object in the form of an object literal. Inputs are available as input properties in the component.

```ts
import {inject} from '@angular/core';
import {WorkbenchMessageBoxService} from '@scion/workbench';

const action = await inject(WorkbenchMessageBoxService).open(SomeComponent, {
  inputs: {
    a: '...',
    b: '...',
  }
});
```

```ts
import {Component, Input} from '@angular/core';

@Component({...})
export class SomeComponent {

  @Input({required: true})
  public a!: string;

  @Input()
  public b?: string;
}
```

### How to define action buttons
Action buttons can be defined via the options object in the form of an object literal. Each property in the object literal represents a button, with the property value used as the button label. If not defining a button, the message box displays an OK button.

Clicking a button closes the message box and resolves the Promise to the property key. A button with the key `cancel` is also assigned the Escape keystroke.


```ts
import {inject} from '@angular/core';
import {WorkbenchMessageBoxService} from '@scion/workbench';

const action = await inject(WorkbenchMessageBoxService).open('Do you want to save changes?', {
  actions: {
    yes: 'Yes',
    no: 'No',
    cancel: 'Cancel',
  },
});

if (action === 'yes') {
// do something
}
```

### How to set the modality of a message box
A message box can be view-modal or application-modal. A view-modal message box blocks only a specific view, allowing the user to interact with other views. An application-modal message box blocks the workbench by default, or the browser's viewport, if set in the global workbench dialog settings.

By default, the calling context determines the modality of the message box. If the message box is opened from a view, only this view is blocked. To open the message box with a different modality, specify the modality in the message box options.

```ts
import {inject} from '@angular/core';
import {WorkbenchMessageBoxService} from '@scion/workbench';

inject(WorkbenchMessageBoxService).open('Lorem ipsum dolor sit amet.', {
  modality: 'application',
});
```

### How to set the severity of a message box
A message can be displayed as info, warning or alert. The severity can be set via the options object.

```ts
import {inject} from '@angular/core';
import {WorkbenchMessageBoxService} from '@scion/workbench';

inject(WorkbenchMessageBoxService).open('Data could not be saved.', {
  severity: 'error',
});
```

### How to set a title
A message box can have a title. The title is specified via the options object. 

```ts
import {inject} from '@angular/core';
import {WorkbenchMessageBoxService} from '@scion/workbench';

inject(WorkbenchMessageBoxService).open('The view contains stale data.', {
  title: 'Stale Data',
});
```

### How to change the default look of a message box
The following CSS variables can be set to customize the default look of a message box.

- `--sci-workbench-messagebox-max-width`
- `--sci-workbench-messagebox-severity-indicator-size`
- `--sci-workbench-messagebox-padding`
- `--sci-workbench-messagebox-text-align`
- `--sci-workbench-messagebox-title-align`
- `--sci-workbench-messagebox-title-font-family`
- `--sci-workbench-messagebox-title-font-weight`
- `--sci-workbench-messagebox-title-font-size`

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
