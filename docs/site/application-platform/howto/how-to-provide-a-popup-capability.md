<a href="/docs/site/application-platform/README.md"><img src="/docs/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench Application Platform][menu-home] > [How To Guides][menu-how-to] > Popup

#### How to provide a popup capability
To provide a popup, perform the following steps:

##### 1. Register the popup capability in the manifest
Open your application manifest and add a capability of the type 'popup' as follows:

```javascript
{
  "capabilities": [
    {
      "type": "popup",
      "qualifier": {...}, ➀
      "description": "...", ➁
      "properties": {
        "path": "...", ➂
        "width": "400px",
        "height": "500px"
      }
    }
  ]
}
```
|#|Explanation|
|-|-|
|➀|The qualifier used to invoke this capability. A qualifier is a dictionary of key-value pairs, e.g. `{"entity": "contact", "action": "create"}`|
|➁|Short description (optional)|
|➂|Path of the page to be displayed when this capability is invoked, e.g. `contact/new`. You can use the qualifier keys as path variables. |
|➃|Dimension of the popup|

Following properties are supported:

|category|property|type|mandatory|description|
|-|-|-|-|-|
||type|'popup'|✓|For popup capabilities, the type must be 'popup'.|
||qualifier|dictionary|✓|Qualifiers which this capability requires for intents to have.|
||private|boolean||Specifies if this is an application private capability and not part of the public API. If private (or if not specified), other applications cannot use this capability.|
||description|string||Description of this capability.|
|properties|path|string|✓|Path of the application page to open when this capability is invoked.<br>The path is relative to the base URL as specified in the application manifest.<br>Qualifier keys can be used as path variables.<p>Example path: 'contact/new'|
|properties|matrixParams|dictionary||Specifies matrix parameters to open the popup.<br>Matrix parameters can be used to associate optional data with the URL and are like regular URL parameters, but do not affect route resolution.|
|properties|queryParams|dictionary||Specifies query parameters to open the popup.|
|properties|width|string|✓|Specifies the width of the popup in the unit as specified.|
|properties|height|string|✓|Specifies the height of the popup in the unit as specified.|
|properties|cssClass|string&nbsp;\|&nbsp;string[]||Specifies CSS class(es) added to the popup overlay, e.g. used for e2e testing.|

##### 2. Create a popup component
Use Angular CLI to create a new component for the popup.

```typescript
@Component({
  ...
  providers: [provideWorkbenchPopup(ContactNewPopupComponent)] ➀
})
export class ContactNewPopupComponent {

  constructor(popup: WorkbenchPopup, ➁
              route: ActivatedRoute) { ➂
  }
}
```
|#|Explanation|
|-|-|
|➀|Instructs given class to live in the context of a popup.|
|➁|Injects router to get URL parameters|
|➂|Injects a handle to interact with the popup, e.g. to close it.|

> For non Angular applications, you can interact with the popup via `Platform.getService(PopupService)`.

##### 3. Add a route
In the routing module, register a route to the component under the path as specified in the popup capability, e.g. `contact/new`.


[menu-how-to]: /docs/site/application-platform/howto/how-to.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
