![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to show a message box
To show a message box, inject `MessageBoxService` and invoke `open` method. Provide a `MessageBox` options object to control the appearance of the message box, like its severity, its content and the buttons shown. When being closed by the user, the `Promise` emits the action as string literal.

The content can be as simple as some text, or a component to be displayed. When specifying a component, do not forget to register it as `entryComponents` in your application module, so it is available at runtime.

A message box can be application modal or view modal, which you can control by setting 'modality' property. By default, and if in view context, the message box is view modal.

```typescript
@Component({...})
export class PersonComponent {

  constructor(private view: WorkbenchView,
              private messageBoxService: MessageBoxService) {
  }

  public close(): void{
    this.messageBoxService.open({
      content: 'Do you want to close?',
      severity: 'info',
      actions: {
        yes: 'Yes',
        no: 'No',
      }
    }).then(action => {
      if (action === 'yes') {
        this.view.close();
      }
    });
  }
}
```

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md