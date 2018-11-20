![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to open a popup

### 1. Declare the intent (if invoking an external popup)

If the popup is provided by another application, open your application manifest and declare the respective intent:
  
```javascript
{
   "intents": [
    {
      "type": "popup",
      "qualifier": {...} ➀
    }
  ]
}
```
|#|Explanation|
|-|-|
|➀|Declares the qualifier of the popup to open. This step is only required for popups provided by other applications.|

### 2. Open the popup

In the component to open the popup, inject `PopupService` and open the popup.

```typescript 
public onPopupOpen(event: MouseEvent): void {
  const qualifier: Qualifier = {...}; ➀
  const popup: Popup = {
    position: 'east',
    anchor: event.target as Element,
  };
  this.popupService.open(popup, qualifier);
}
```
|#|Explanation|
|-|-|
|➀|Sets the qualifier of the popup to open, e.g `{entity: 'contact', id: 5}`.|

> For non Angular applications, get the popup service via `Platform.getService(PopupService)`.

The popup may return a result, which is why a `Promise` is returned when opening the popup.

Following properties are supported:

|property|type|mandatory|description|
|-|-|-|-|
|anchor|Element|✓|Specifies the `Element` where to attach the popup.|
|position|east&nbsp;\|&nbsp;west&nbsp;\|&nbsp;north&nbsp;\|&nbsp;south||Specifies in which region of the popup anchor to show the popup (unless not enough space).|
|queryParams|dictionary||Specifies query parameters to open the popup.|
|matrixParams|dictionary||Specifies matrix parameters to open the popup.<br>Matrix parameters can be used to associate optional data with the URL and are like regular URL parameters, but do not affect route resolution.|
|closeStrategy.onFocusLost|boolean||Specifies if to close the popup on focus lost, which is `true` by default.|
|closeStrategy.onEscape|boolean||Specifies if to close the popup on escape keystroke, which is `true` by default.|
|closeStrategy.onGridLayoutChange|boolean||Specifies if to close the popup on workbench view grid change, which is `true` by default.|


[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md