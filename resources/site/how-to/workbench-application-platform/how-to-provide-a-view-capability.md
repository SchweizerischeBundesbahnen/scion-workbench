![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to provide a view capability

A view is a visual workbench element which the user can flexibile arrange in the view grid. Views are the principal elements to show data to the user.

To provide a view, perform the following steps:

### 1. Register the view capability in the manifest
Open your application manifest and add a capability of the type 'view' as follows:

```javascript
{
  "capabilities": [
    {
      "type": "view",
      "qualifier": {...}, ➀
      "description": "...", ➁
      "properties": {
        "path": "...", ➂
        "title": "..." ➃
      }
    }
  ]
}
```
|#|Explanation|
|-|-|
|➀|The qualifier used to invoke this capability. A qualifier is a dictionary of key-value pairs, e.g. `{"entity": "contact", "id": "*"}`|
|➁|Short description (optional)|
|➂|Path of the page to be displayed when this capability is invoked, e.g. `contact/:id`. You can use the qualifier keys as path variables. |
|➃|Title of the view tab (optional)|

Following properties are supported:

|category|property|type|mandatory|description|
|-|-|-|-|-|
||type|'view'|✓|For view capabilities, the type must be 'view'.|
||qualifier|dictionary|✓|Qualifier which this capability requires for intents to have.|
||private|boolean||Specifies if this is an application private capability and not part of the public API. If private (or if not specified), other applications cannot use this capability.|
||description|string||Description of this capability.|
|properties|path|string|✓|Path of the application page to open when this capability is invoked.<br>The path is relative to the base URL as specified in the application manifest.<br>Qualifier keys can be used as path variables.<p>Example path: 'contact/:id'|
|properties|matrixParams|dictionary||Specifies matrix parameters to open the view.<br>Matrix parameters can be used to associate optional data with the URL and are like regular URL parameters, but do not affect route resolution.|
|properties|queryParams|dictionary||Specifies query parameters to open the view.|
|properties|title|string||Specifies the title to be displayed in the view tab.|
|properties|heading|string||Specifies the sub title to be displayed in the view tab.|
|properties|closable|boolean||Specifies if a close button should be displayed in the view tab.|
|properties|cssClass|string&nbsp;\|&nbsp;string[]||Specifies CSS class(es) added to the <wb-view-tab> and <wb-view> elements, e.g. used for e2e testing.|
|properties|activityItem|object||If specified, an activity item is added to the activity panel for this view.|
|activityItem|title|string||Specifies the title of the activity.|
|activityItem|cssClass|string&nbsp;\|&nbsp;string[]||Specifies CSS class(es) added to the activity item and activity panel, e.g. used for e2e testing.|
|activityItem|itemText|string||Specifies the text for the activity item.<br>You can use it in combination with `itemCssClass`, e.g. to render an icon glyph by using its textual name.|
|activityItem|itemCssClass|string&nbsp;\|&nbsp;string[]||Specifies CSS class(es) added to the activity item, e.g. used for e2e testing or to set an icon font class.|
|activityItem|position|number||Specifies where to insert this item in the list of activities.|

### 2. Create a view component
Use Angular CLI to create a new component for the view.

```typescript
@Component({
  ...
  providers: [provideWorkbenchView(ContactViewComponent)] ➀
})
export class ContactViewComponent {

  constructor(view: WorkbenchView, ➁
              route: ActivatedRoute) { ➂
  }
}
```
|#|Explanation|
|-|-|
|➀|Instructs given class to live in the context of a view.|
|➁|Injects router to get URL parameters|
|➂|Injects a handle to interact with the view, e.g. to mark it dirty or to close it.|

> For non Angular applications, you can interact with the activity via `Platform.getService(ViewService)`.

### 3. Add a route
In the routing module, register a route to the component under the path as specified in the view capability, e.g. `contact/:id`.

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md