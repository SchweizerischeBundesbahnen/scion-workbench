<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

### How to prevent a view from being closed

The closing of a view can be intercepted by implementing the `WorkbenchViewPreDestroy` lifecycle hook in the view component. The `onWorkbenchViewPreDestroy` method is called when the view is about to be closed. Return `true` to continue closing or `false` otherwise. Alternatively, you can return a Promise or Observable to perform an asynchronous operation such as displaying a message box.

The following snippet asks the user whether to save changes.

```ts 
import {Component} from '@angular/core';
import {WorkbenchMessageBoxService, WorkbenchView, WorkbenchViewPreDestroy} from '@scion/workbench';

@Component({})
export class ViewComponent implements WorkbenchViewPreDestroy {

  constructor(private view: WorkbenchView, private messageBoxService: WorkbenchMessageBoxService) {
  }

  public async onWorkbenchViewPreDestroy(): Promise<boolean> {
    if (!this.view.dirty) {
      return true;
    }

    const action = await this.messageBoxService.open('Do you want to save changes?', {
      severity: 'info',
      actions: {
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
      },
    });

    switch (action) {
      case 'yes':
        // Store changes ...
        return true;
      case 'no':
        return true;
      default:
        return false;
    }
  }
}
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
