<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Miscellaneous

#### How to show a notification
To show a notification, inject `NotificationService` and invoke `notify` method. Provide a `Notification` options object to control the appearance of the notification, like its severity, its content and show duration.

The content can be as simple as some text, or a component to be displayed.

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

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
