<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Message Box

A message box is a standardized dialog for presenting a message to the user, such as an info, warning or alert, or for prompting the user for confirmation. The message can be plain text or a component, allowing for
structured content or input prompts.

Displayed on top of other content, a message box blocks interaction with other parts of the application. A message box can be context-modal or application-modal. Message boxes are stacked per modality, with only the topmost message box in each stack being interactive.

A message box can be bound to a context (e.g., a part or view), displaying the message box only if the context is visible and closing it when the context is disposed. A message box is opened in the center of its context, if any, unless opened from the peripheral area.

### How to Display a Text Message
To display a text message, inject `MessageBoxService` and invoke the `open` method, passing the text to display. 

```ts
import {inject} from '@angular/core';
import {WorkbenchMessageBoxService} from '@scion/workbench';

inject(WorkbenchMessageBoxService).open('Lorem ipsum dolor sit amet.');
```

### How to Display Structured Content
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

### How to Define Action Buttons
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

### How to Set the Modality of a Message Box
A message box can be context-modal or application-modal. Context-modal blocks a specific part of the application, as specified by the context; application-modal blocks the workbench or browser viewport, based on global workbench settings.

By default, the message box is modal to the calling context. Specify a different modality in message box options.

```ts
import {inject} from '@angular/core';
import {WorkbenchMessageBoxService} from '@scion/workbench';

inject(WorkbenchMessageBoxService).open('Lorem ipsum dolor sit amet.', {
  modality: 'application',
});
```

### How to Set the Severity of a Message Box
A message can be displayed as info, warning or alert. The severity can be set via the options object.

```ts
import {inject} from '@angular/core';
import {WorkbenchMessageBoxService} from '@scion/workbench';

inject(WorkbenchMessageBoxService).open('Data could not be saved.', {
  severity: 'error',
});
```

### How to Set a Title
A message box can have a title. The title is specified via the options object. 

```ts
import {inject} from '@angular/core';
import {WorkbenchMessageBoxService} from '@scion/workbench';

inject(WorkbenchMessageBoxService).open('The view contains stale data.', {
  title: 'Stale Data',
});
```

### How to Change the Default Look of a Message Box
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
