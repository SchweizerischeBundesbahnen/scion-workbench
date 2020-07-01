<a href="/docs/site/application-platform/README.md"><img src="/docs/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench Application Platform][menu-home] > [How To Guides][menu-how-to] > MessageBox

#### How to open a message box

##### 1. Declare the intent

Open your application manifest and declare an intent as follows (if not done yet):
  
```javascript
{
  "intents": [
    {
      "type": "messagebox"
    }
  ]
}
```

##### 2. Open the message box

In the component to open the message box, inject `MessageBoxService` and open the message box.

```typescript 
messageBoxService.open({
  text: 'Want to save your changes?',
  actions: {
    'yes': 'Yes',
    'no': 'No',
    'cancel': 'Cancel',
  }
});

```
> For non Angular applications, get the message box service via `Platform.getService(MessageBoxService)`.

Following properties are supported:

|property|type|mandatory|description|
|-|-|-|-|
|title|string||Specifies the title.|
|text|string||Specifies the message box text.|
|actions|dictionary|✓|Specifies which buttons to display in the message box.|
|severity|info&nbsp;\|&nbsp;warn&nbsp;\|&nbsp;error||Specifies the severity.|
|modality|view&nbsp;\|&nbsp;application||Specifies the modality context created by the message box. By default, and if in view context, view modality is used.|
|contentSelectable|boolean||Specifies if the user can select the message box text.|
|cssClass|string||Specifies the message box text.|
|text|string&nbsp;\|&nbsp;string[]||Specifies CSS class(es) added to the  `<wb-message-box>` element, e.g. used for e2e testing.|
|payload|any||Payload available in messagebox handlers in the host application. Is used for custom messages boxes only.|

##### Custom message box

When opening the message box, an optional qualifier can be given. It is used to open a custom message box like to show a list of items or similar. The payload for the custom message box can be given via `payload` property.

```typescript
const qualifier: Qualifier = {...}; ➀
const msgbox: MessageBox = {
  payload: {...} ➁
}:

messageBoxService.open(msgbox, qualifier);
```
|#|Explanation|
|-|-|
|➀|Qualifies the custom message box implementation to open, e.g. `{'type': 'list'}`.|
|➁|Payload available in the custom message box.|


The custom message box is implemented in the host application. Hereto, register a programmatic intent handler. When a `messagebox` intent is received that matches your qualifier, the handler opens a message box which renders your custom component.

```typescript
@NgModule({
 declarations: [
    ListMessageboxComponent ➀
  ],
  entryComponents: [
    ListMessageboxComponent ➀
  ],
  providers: [
    {
      provide: INTENT_HANDLER, ➁
      useFactory: provideListMessageBoxIntentHandler, ➂
      multi: true,
    }
  ],
})
export class HostApp {
}

export function provideListMessageBoxIntentHandler(): MessageBoxIntentHandler { ➃
  return new MessageBoxIntentHandler({'type': 'list'}, 'Displays a messagebox with list content to the user.', ListMessageboxComponent);
}

```
|#|Explanation|
|-|-|
|➀|Registers the component to be rendered in the message box as an entry component.|
|➁|Registers the handler as multi provider under DI injection `INTENT_HANDLER`.|
|➂|Delegates instantiation of the handler to a factory method (required by AOT).|
|➃|Instantiates the handler to handle `messagebox` intents of given qualifier. When an application issues a respective intent, a messagebox with given component is opened.|

The component can inject `MessageBox` to access `payload` via its `input` property.

```typescript
@Component(...)
export class ListMessageboxComponent {

  constructor(public messageBox: MessageBox) {
  }
}
```

[menu-how-to]: /docs/site/application-platform/howto/how-to.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
