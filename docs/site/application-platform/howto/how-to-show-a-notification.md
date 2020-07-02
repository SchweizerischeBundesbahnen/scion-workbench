<a href="/docs/site/application-platform/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench Application Platform][menu-home] > [How To Guides][menu-how-to] > Notification

#### How to show a notification

##### 1. Declare the intent

Open your application manifest and declare an intent as follows (if not done yet):
  
```javascript
{
  "intents": [
    {
      "type": "notification"
    }
  ]
}
```

##### 2. Show the notification

In the component to show the notification, inject `NotificationService` and show the notification.

```typescript 
notificationService.notify('Something good happened');
```
or
```typescript 
notificationService.notify({
  title: 'Congratulations',
  text: 'Something good happened',
  severity: 'info',
});
```

> For non Angular applications, get the notification service via `Platform.getService(NotificationService)`.

Following properties are supported:

|property|type|mandatory|description|
|-|-|-|-|
|title|string||Specifies the title.|
|text|string||Specifies the notification text.|
|severity|info&nbsp;\|&nbsp;warn&nbsp;\|&nbsp;error||Specifies the severity.|
|duration|short&nbsp;\|&nbsp;medium&nbsp;\|&nbsp;long&nbsp;\|&nbsp;infinite||Specifies the timeout upon which to close this notification automatically. If not specified, a 'short' timeout is used. Use 'infinite' to not close this notification automatically.|
|group|string||Specifies the group which this notification belongs to. If specified, this notification closes all notification of the same group before being presented.|
|cssClass|string||Specifies CSS class(es) added to the `<wb-notification>` element, e.g. used for e2e testing.|
|payload|any||Payload available in notification handler in the host application. Is used for custom notifications only.|

##### Custom notification

When showing the notification, an optional qualifier can be given. It is used to show a custom notification like to show a list of items or similar. The payload for the custom notification can be given via `payload` property.

```typescript
const qualifier: Qualifier = {...}; ➀
const notification: Notification = {
  payload: {...} ➁
}:

notificationService.notify(notification, qualifier);
```
|#|Explanation|
|-|-|
|➀|Qualifies the custom notification implementation to show, e.g. `{'type': 'list'}`.|
|➁|Payload available in the custom notification.|

The custom notification is implemented in the host application. Hereto, register a programmatic intent handler. When a notification intent is received that matches your qualifier, the handler shows a notification which renders your custom component.


```typescript
@NgModule({
 declarations: [
    ListNotificationComponent ➀
  ],
  entryComponents: [
    ListNotificationComponent ➀
  ],
  providers: [
    {
      provide: INTENT_HANDLER, ➁
      useFactory: provideListNotificationIntentHandler, ➂
      multi: true,
    }
  ],
})
export class HostApp {
}

export function provideListNotificationIntentHandler(): NotificationIntentHandler { ➃
  return new NotificationIntentHandler({'type': 'list'}, 'Shows a notification with list content to the user.', ListNotificationComponent);
}
```
|#|Explanation|
|-|-|
|➀|Registers the component to be rendered in the notification as an entry component.|
|➁|Registers the handler as multi provider under DI injection `INTENT_HANDLER`.|
|➂|Delegates instantiation of the handler to a factory method (required by AOT).|
|➃|Instantiates the handler to handle `notification` intents of given qualifier. When an application issues a respective intent, a notification with given component is shown.|

The component can inject `Notification` to access `payload` via its `input` property.

```typescript
@Component(...)
export class ListNotificationComponent {

  constructor(public notification: Notification) {
  }
}
```

[menu-how-to]: /docs/site/application-platform/howto/how-to.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
