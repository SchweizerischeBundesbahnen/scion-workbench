<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Miscellaneous

A message box is a modal dialog box that an application can use to display a message to the user. It typically contains a text message and one or more buttons. A message box can be opened application-modal or view-modal. An application-modal message box blocks the entire workbench, whereas a view-modal message box blocks only the view in which it was opened. A view-modal message box sticks to its view; that is, it is displayed only when the view is visible.

### How to show a message box
To show a message box, inject `MessageBoxService` and invoke the `open` method, passing a `MessageBox` options object to control the appearance of the message box, like its severity, its content and the buttons. When closed, the `Promise` resolves to the close action string literal.

```ts
const messageBoxService = inject(MessageBoxService);
const action = await messageBoxService.open({
  content: 'Do you want to close the view?',
  severity: 'info',
  actions: {
    yes: 'Yes',
    no: 'No',
  },
});

if (action === 'yes') {
  inject(WorkbenchView).close();
}
```

To display structured content, consider passing a component to `MessageBoxConfig.content` instead of plain text.

A message box can be opened application-modal or view-modal, controlled via the `modality` option. By default, and if opened in the context of a view, the message box is view-modal.

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
