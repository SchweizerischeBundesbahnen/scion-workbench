<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

### How to Prevent a View from Closing

A view can register a `CanClose` guard to intercept or prevent the closing.

The passed callback function is called when the view is about to close. Return `true` to close the view or `false` to prevent closing. Instead of a `boolean`, the method can return a `Promise` or an `Observable` to perform an asynchronous operation, such as displaying a message box.

The following snippet asks the user whether to save changes.

```ts 
import {inject} from '@angular/core';
import {WorkbenchMessageBoxService, WorkbenchView} from '@scion/workbench';

inject(WorkbenchView).canClose(async () => {
  if (!inject(WorkbenchView).dirty()) {
    return true;
  }
  const action = await inject(WorkbenchMessageBoxService).open('Do you want to save changes?', {
    actions: {
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel'
    }
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
});
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
