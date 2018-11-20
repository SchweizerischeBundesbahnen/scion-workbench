![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to show a notification
To show a notification, inject `NotificationService` and invoke `notify` method. Provide a `Notification` options object to control the appearance of the notification, like its severity, its content and show duration.

The content can be as simple as some text, or a component to be displayed. When specifying a component, do not forget to register it as `entryComponents` in your application module, so it is available at runtime.

```typescript
@Component({...})
export class PersonComponent {

  constructor(private notificationService: NotificationService) {
  }

  public store(): void{
    this.notificationService.notify({
      content: 'Person successfully created',
      severity: 'info',
      duration: 'medium',
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