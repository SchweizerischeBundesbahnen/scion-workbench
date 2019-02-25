![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to provide a custom activity action

This section explains how you can add actions like a create button to an activity. When the activity is activated, the platform displays its registered actions in the activity header to the right of the activity title.

### 1. Create and register a custom ActivityActionProvider (host application)

In the host application, create an `ActivityActionProvider` and register it under DI injection token `ACTIVITY_ACTION_PROVIDER` as a multi provider. The action provider registers a component which is rendered when your custom action is added to an activity.

```typescript
@NgModule({
  declarations: [
    CustomActivityActionComponent, ➀
  ],
  entryComponents: [
    CustomActivityActionComponent, ➁
  ],
  providers: [
    {
      provide: ACTIVITY_ACTION_PROVIDER, ➂
      useClass: CustomActivityActionProvider,
      multi: true
    }
  ]
})
export class HostAppModule {
}
```
|#|Explanation|
|-|-|
|➀|Registers the component which renders the activity action.|
|➁|Registers the component as an entry component because loaded dynamically.|
|➂|Registers the action provider as a multi provider.|


The providers looks as follows:
```typescript
@Injectable()
export class CustomActivityActionProvider implements ActivityActionProvider {
  public type = 'custom'; ➀
  public component = CustomNotifyActivityActionComponent; ➁ 
}
```
|#|Explanation|
|-|-|
|➀|Sets the type of your custom action. When adding an activity action of given type, this action is rendered.|
|➁|Specifies the component to render this action.|

### 2. Create an action interface to describe action properties (optional)

```typescript
export interface CustomActivityAction extends ActivityAction {
  type: 'custom';
  properties: {
    ...➀
  };
}
```
|#|Explanation|
|-|-|
|➀|Declare any properties which your action requires.|

Put this interface into a shared module (if existing), or copy it somewhere into the host and sub-application(s).

### 3. Read action properties in the action component (host application)

To read action properties (if any), open the previously created action component and inject the action via DI injection token `ACTIVITY_ACTION`.

```typescript
@Component(...)
export class CustomActivityActionComponent {

  constructor(@Inject(ACTIVITY_ACTION) action: CustomNotifyActivityAction) {
  }
}
```

### 4. Add your custom action to an activity (sub-application)

Open the activity where to add the action. Add the action via platform service, or if in Angular, by injecting `WorkbenchActivity`. Then invoke `addAction` to add the action to the activity.

```typescript
const action: CustomActivityAction = {
  type: 'custom',
  properties: {
    ...
  }
};
Platform.getService(ActivityService).addAction(action);
```

> Alternatively, for Angular applications, you can create a directive similar to the built-in action directives. When constructed, the directive registers the action, and when being destroyed, it unregisters it. For example, see `WorkbenchUrlOpenActivityActionDirective`.

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md
