<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Notification

A notification is a closable message displayed in the upper-right corner that disappears after a few seconds unless hovered or focused.
It informs about system events, task completion, or errors. Severity indicates importance or urgency.

### How to Show a Notification
To show a text notification, inject `WorkbenchNotificationService` and invoke the `show` method, passing the text to display.

```ts
import {inject} from '@angular/core';
import {WorkbenchNotificationService} from '@scion/workbench';

inject(WorkbenchNotificationService).show('Task completed');
```

### How to Display Structured Content
To display structured content, pass a component instead of a string literal.

Data can be passed to the notification component as inputs in the notification options.

```ts
import {inject} from '@angular/core';
import {WorkbenchNotificationService} from '@scion/workbench';

const notificationService = inject(WorkbenchNotificationService);
notificationService.show(SomeComponent, {
  inputs: {
    firstname: 'Firstname',
    lastname: 'Lastname',
  },
});
```

```ts
import {Component, input} from '@angular/core';

@Component({...})
export class SomeComponent {
  firstname = input.required();
  lastname = input.required();
}
```

Alternatively, data can be passed for injection via a custom injector (`WorkbenchNotificationOptions.injector`) or providers (`WorkbenchNotificationOptions.providers`).

### How to Set the Severity of a Notification
A notification can be displayed as info, warning or error. The severity can be set via the options object.

```ts
import {inject} from '@angular/core';
import {WorkbenchNotificationService} from '@scion/workbench';

inject(WorkbenchNotificationService).show('Task failed to complete.', {
  severity: 'error',
});
```

### How to Set a Title
A notification can have a title. The title is specified via the options object.

```ts
import {inject} from '@angular/core';
import {WorkbenchNotificationService} from '@scion/workbench';

inject(WorkbenchNotificationService).show('Task has completed.', {
  title: 'Task Completion',
});
```

### How to Group Notifications
Notifications can be grouped. Only the most recent notification within a group is displayed.

```ts
import {inject} from '@angular/core';
import {WorkbenchNotificationService} from '@scion/workbench';

inject(WorkbenchNotificationService).show('Network connection interrupted.', {
  group: 'connectivity',
});
```

A new notification replaces the previous notification of the same group.

```ts
import {inject} from '@angular/core';
import {WorkbenchNotificationService} from '@scion/workbench';

inject(WorkbenchNotificationService).show('Network connection established.', {
  group: 'connectivity',
});
```

Configuring a reducer function enables aggregation of input values of notifications of the same group. 
The reducer is invoked with inputs of the previous notification, if still displaying, and inputs of the new notification. The returned input is passed to the new notification.

```ts
import {inject} from '@angular/core';
import {WorkbenchNotificationService} from '@scion/workbench';
import {ErrorNotificationComponent} from './dummy/error-notification.component';

inject(WorkbenchNotificationService).show(ErrorNotificationComponent, {
  group: 'error',
  groupInputReduceFn: (prevInput, currInput) => {
    const count = (prevInput['count'] ?? 0) as number;
    return {...currInput, count: count + 1};
  },
});
```

Aggregated input is available as input properties in the component. 

```ts
import {Component, input} from '@angular/core';

@Component({
  selector: 'app-error-notification',
  template: '{{count()}} errors occurred.',
})
export class ErrorNotificationComponent {
  count = input(0);
}
```

### How to Change the Default Look of a Notification
The following CSS variables can be set to customize the default look of a notification.

- `--sci-workbench-notification-width`
- `--sci-workbench-notification-severity-indicator-size`

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
