<a href="/README.md"><img src="/docs/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Miscellaneous

#### How to show a message box
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

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
