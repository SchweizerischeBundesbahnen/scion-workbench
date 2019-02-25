![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to provide an activity capability
An activity is a visual workbench element shown at the left-hand side of the workbench frame and acts as an entry point into the application. At any given time, only a single activity can be active.

To provide an activity, perform the following steps:

### 1. Register the activity capability in the manifest
Open your application manifest and add a capability of the type 'activity' as follows:

```javascript
{
  "capabilities": [
    {
      "type": "activity",
      "qualifier": {...}, ➀
      "description": "...", ➁
      "properties": {
        "path": "...", ➂
        "title": "...", ➃
        "itemText": "...", ➄
        "itemCssClass": "..." ➅
      }
    }
  ]
}
```
|#|Explanation|
|-|-|
|➀|The qualifier used to invoke this capability. A qualifier is a dictionary of key-value pairs, e.g. `{"entity": "contacts"}`|
|➁|Short description (optional)|
|➂|Path of the page to be displayed when this capability is invoked, e.g. `contact/list`.|
|➃|Tooltip of the activity item (optional)|
|➄|Text of the activity item (optional), e.g. a font ligature like `person_outline` for Material Icons |
|➅|CSS class added to the activity item (optional), e.g. `material-icons` |

Following properties are supported:

|category|property|type|mandatory|description|
|-|-|-|-|-|
||type|'activity'|✓|For activity capabilities, the type must be 'activity'.|
||qualifier|dictionary|✓|Qualifiers which this capability requires for intents to have.|
||private|boolean||Specifies if this is an application private capability and not part of the public API. If private (or if not specified), other applications cannot use this capability.|
||description|string||Description of this capability.|
|properties|path|string|✓|Path of the application page to show as a workbench activity.<br>The path is relative to the base URL as specified in the application manifest.|
|properties|matrixParams|dictionary||Specifies query parameters given to the activity.<br>Matrix parameters can be used to associate optional data with the URL and are like regular URL parameters, but do not affect route resolution.|
|properties|queryParams|dictionary||Specifies query parameters given to the activity.|
|properties|title|string||Specifies the title of the activity.|
|properties|cssClass|string&nbsp;\|&nbsp;string[]||Specifies CSS class(es) added to the activity item and activity panel, e.g. used for e2e testing.|
|properties|itemText|string||Specifies the text for the activity item.<br>You can use it in combination with `itemCssClass`, e.g. to render an icon glyph by using its textual name.|
|properties|itemCssClass|string&nbsp;\|&nbsp;string[]||Specifies CSS class(es) added to the activity item, e.g. used for e2e testing or to set an icon font class.|
|properties|position|number||Specifies where to insert this activity in the list of activities.|

### 2. Create an activity component
  Use Angular CLI to create a new component for the activity.

  ```typescript
  @Component({
    ...
    providers: [provideWorkbenchActivity(ContactActivityComponent)] ➀
  })
  export class ContactActivityComponent {

    constructor(activity: WorkbenchActivity, ➁
                route: ActivatedRoute) { ➂
    }
  }
  ```
  |#|Explanation|
  |-|-|
  |➀|Instructs given class to live in the context of an activity.|
  |➁|Injects router to get URL parameters|
  |➂|Injects a handle to interact with the activity.|

  > For non Angular applications, you can interact with the activity via `Platform.getService(ActivityService)`.

### 3. Add a route
In the routing module, register a route to the component under the path as specified in the activity capability, e.g. `contact/list`.



[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md