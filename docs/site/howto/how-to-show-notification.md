<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Notification

A notification is a closable message that appears in the upper-right corner and disappears automatically after a few seconds. It informs the user of a system event, e.g., that a task has been completed or an error has occurred. Multiple notifications are stacked vertically. Notifications can be grouped. For each group, only the last notification is displayed.

### How to show a notification
To show a notification, inject `NotificationService` and invoke the `notify` method, passing a `Notification` options object to control the appearance of the notification, like its severity, its content and show duration.

```ts
import {inject} from '@angular/core';
import {NotificationService} from '@scion/workbench';

const notificationService = inject(NotificationService);
notificationService.notify({
  content: 'Person successfully created',
  severity: 'info',
  duration: 'medium',
});
```

To display structured content, consider passing a component to `NotificationConfig.content` instead of plain text.

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
