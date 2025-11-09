<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Dialog

A dialog is a visual element for focused interaction with the user, such as prompting the user for input or confirming actions. The user can move and resize a dialog.

Displayed on top of other content, a dialog blocks interaction with other parts of the application. A dialog can be context-modal or application-modal. Dialogs are stacked per modality, with only the topmost dialog in each stack being interactive.

A dialog can be bound to a context (e.g., a part or view), displaying the dialog only if the context is visible and closing it when the context is disposed. Defaults to the calling context. 

A dialog is opened in the center of its context, if any, unless opened from the peripheral area.

### How to Open a Dialog
To open a dialog, inject `WorkbenchDialogService` and invoke the `open` method, passing the component to display.

```ts
import {inject} from '@angular/core';
import {WorkbenchDialogService} from '@scion/workbench';

const dialogService = inject(WorkbenchDialogService);

dialogService.open(YourDialogComponent);
```

### How to Set the Modality of a Dialog
A dialog can be context-modal or application-modal. Context-modal blocks a specific part of the application, as specified by the context; application-modal blocks the workbench or browser viewport, based on global workbench settings.

By default, the dialog is modal to the calling context. Specify a different modality in dialog options.

```ts
import {inject} from '@angular/core';
import {WorkbenchDialogService} from '@scion/workbench';

const dialogService = inject(WorkbenchDialogService);

dialogService.open(YourDialogComponent, {
  modality: 'application',
});
```

An application-modal dialog blocks the workbench element, still allowing interaction with elements outside the workbench element. To block the entire browser viewport, change the global modality scope setting in the workbench configuration.

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideWorkbench} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideWorkbench({
      dialog: {modalityScope: 'viewport'},
    }),
  ],
});
```

### How to Pass Data to the Dialog
Data can be passed to the dialog component as inputs in the dialog options.


```ts
import {inject} from '@angular/core';
import {WorkbenchDialogService} from '@scion/workbench';

const dialogService = inject(WorkbenchDialogService);

dialogService.open(YourDialogComponent, {
  inputs: {
    firstname: 'Firstname',
    lastname: 'Lastname'
  },
});
```

Dialog inputs are available as input properties in the dialog component.

```ts
import {Component, Input} from '@angular/core';

@Component({...})
export class YourDialogComponent {

  @Input()
  public firstname: string;

  @Input()
  public lastname: string;
}
```

### How to Set a Dialog Title 
The dialog component can inject the `WorkbenchDialog` handle and set the title.

```ts
inject(WorkbenchDialog).title = 'My dialog title';
```

### How to Contribute to the Dialog Footer
A dialog has a default footer that displays actions defined in the HTML of the dialog component. An action is an Angular template decorated with the `wbDialogAction` directive. Multiple actions are supported, rendered in modeling order, and can be left- or right-aligned.

```html
<!-- Checkbox -->
<ng-template wbDialogAction align="start">
  <label>
    <input type="checkbox"/>
    Do not ask me again
  </label>
</ng-template>

<!-- OK Button -->
<ng-template wbDialogAction align="end">
  <button (click)="...">OK</button>
</ng-template>

<!-- Cancel Button -->
<ng-template wbDialogAction align="end">
  <button (click)="...">Cancel</button>
</ng-template>
```

Alternatively, the dialog supports the use of a custom footer. To provide a custom footer, add an Angular template to the HTML of the dialog component and decorate it with the `wbDialogFooter` directive.

```html
<ng-template wbDialogFooter>
  <app-dialog-footer/>
</ng-template>
```

### How to Close the Dialog 
The dialog component can inject the `WorkbenchDialog` handle and close the dialog, optionally passing a result to the dialog opener.

```ts
import {inject} from '@angular/core';
import {WorkbenchDialog} from '@scion/workbench';

// Closes the dialog.
inject(WorkbenchDialog).close();

// Closes the dialog with a result.
inject(WorkbenchDialog).close('some result');
```

Opening the dialog returns a Promise, that resolves to the result when the dialog is closed.

```ts
import {inject} from '@angular/core';
import {WorkbenchDialog} from '@scion/workbench';

const dialogService = inject(WorkbenchDialogService);

const result = await dialogService.open(YourDialogComponent);
```

### How to Size the Dialog
The dialog handle can be used to specify a preferred size, displaying scrollbar(s) if the component overflows. If no size is specified, the dialog has the size of the component.

```ts
import {inject} from '@angular/core';
import {WorkbenchDialog} from '@scion/workbench';

// Sets a fixed size.
inject(WorkbenchDialog).size.height = '500px';
inject(WorkbenchDialog).size.width = '600px';

// Sets the minimum size of the dialog.
inject(WorkbenchDialog).size.minHeight = '300px';
inject(WorkbenchDialog).size.minWidth = '200px';

// Sets the maximum size of the dialog.
inject(WorkbenchDialog).size.maxHeight = '900px';
inject(WorkbenchDialog).size.maxWidth = '700px';
```

### How to Use a Custom Dialog Header
By default, the dialog displays the title and a close button in the header. Alternatively, the dialog supports the use of a custom header. To provide a custom header, add an Angular template to the HTML of the dialog component and decorate it with the `wbDialogHeader` directive.
```html
<ng-template wbDialogHeader>
  <app-dialog-header/>
</ng-template>
```

### How to Change the Default Dialog Settings
The dialog component can inject the dialog handle `WorkbenchDialog` to interact with the dialog and change its default settings, such as making it non-closable, non-resizable, removing padding, and more.

```ts
import {inject} from '@angular/core';
import {WorkbenchDialog} from '@scion/workbench';

const dialog = inject(WorkbenchDialog);
dialog.closable = false;
dialog.resizable = false;
dialog.padding = false;
```

### How to Change the Default Look of a Dialog
The following CSS variables can be set to customize the default look of a dialog.

- `--sci-workbench-dialog-padding`
- `--sci-workbench-dialog-header-height`
- `--sci-workbench-dialog-header-background-color`
- `--sci-workbench-dialog-title-font-family`
- `--sci-workbench-dialog-title-font-weight`
- `--sci-workbench-dialog-title-font-size`
- `--sci-workbench-dialog-title-align`

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
