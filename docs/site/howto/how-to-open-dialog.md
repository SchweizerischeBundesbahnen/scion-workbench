<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Dialog

A dialog is a visual element for focused interaction with the user, such as prompting the user for input or confirming actions. The user can move or resize a dialog.

Displayed on top of other content, a dialog blocks interaction with other parts of the application. A dialog can be view-modal or application-modal. Multiple dialogs are stacked, and only the topmost dialog in each modality stack can be interacted with.

### How to open a dialog
To open a dialog, inject `WorkbenchDialogService` and invoke the `open` method, passing the component to display.

```ts
const dialogService = inject(WorkbenchDialogService);

dialogService.open(MyDialogComponent);
```

### How to set the modality of a dialog
A dialog can be view-modal or application-modal. A view-modal dialog blocks only a specific view, allowing the user to interact with other views. An application-modal dialog blocks the workbench by default, or the browser's viewport, if set in the global workbench settings.

By default, the calling context determines the modality of the dialog. If the dialog is opened from a view, only this view is blocked. To open the dialog with a different modality, specify the modality in the dialog options.

```ts
const dialogService = inject(WorkbenchDialogService);

dialogService.open(MyDialogComponent, {
  modality: 'application',
});
```

An application-modal dialog blocks the workbench element, still allowing interaction with elements outside the workbench element. To block the entire browser viewport, change the global modality scope setting in the workbench module configuration.

```ts
import {WorkbenchModule} from '@scion/workbench';

WorkbenchModule.forRoot({
  dialog: {
    modalityScope: 'viewport',
  },
  ... // ommited configuration
});
```

### How to pass data to the dialog
Data can be passed to the dialog component as inputs in the dialog options.


```ts
const dialogService = inject(WorkbenchDialogService);

dialogService.open(MyDialogComponent, {
  inputs: {
    firstname: 'Firstname',
    lastname: 'Lastname'
  },
});
```

Dialog inputs are available as input properties in the dialog component.

```ts
@Component({...})
export class MyDialogComponent {

  @Input()
  public firstname: string;

  @Input()
  public lastname: string;
}
```

### How to set a dialog title 
The dialog component can inject the `WorkbenchDialog` handle and set the title.

```ts
inject(WorkbenchDialog).title = 'My dialog title';
```

### How to contribute to the dialog footer
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

### How to close the dialog 
The dialog component can inject the `WorkbenchDialog` handle and close the dialog, optionally passing a result to the dialog opener.

```ts
// Closes the dialog.
inject(WorkbenchDialog).close();

// Closes the dialog with a result.
inject(WorkbenchDialog).close('some result');
```

Opening the dialog returns a Promise, that resolves to the result when the dialog is closed.

```ts
const dialogService = inject(WorkbenchDialogService);

const result = await dialogService.open(MyDialogComponent);
```

### How to size the dialog
The dialog handle can be used to specify a preferred size, displaying scrollbar(s) if the component overflows. If no size is specified, the dialog has the size of the component.

```ts
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

### How to use a custom dialog header
By default, the dialog displays the title and a close button in the header. Alternatively, the dialog supports the use of a custom header. To provide a custom header, add an Angular template to the HTML of the dialog component and decorate it with the `wbDialogHeader` directive.
```html
<ng-template wbDialogHeader>
  <app-dialog-header/>
</ng-template>
```

### How to change the default dialog settings
The dialog component can inject the dialog handle `WorkbenchDialog` to interact with the dialog and change its default settings, such as making it non-closable, non-resizable, removing padding, and more.

```ts
const dialog = inject(WorkbenchDialog);
dialog.closable = false;
dialog.resizable = false;
dialog.padding = false;
```

### How to change the default look of a dialog
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
