![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## What does the application manifest structure look like
The application manifest is a JSON file which contains metadata about the application, its capabilities and intents.

#### The basic structure of the manifest is as follows:

```javascript
{
  "name": "...", ➀
  "baseUrl": "...", ➁
  "capabilities": [...], ➂
  "intents": [...] ➃
}
```
|#|Explanation|
|-|-|
|➀|Name of the application|
|➁|URL to the application root. The base URL can be absolute, or relative to the origin of the 'manifestUrl'. If not specified, the origin from 'manifestUrl' is used as the base URL.|
|➂|Functionality which the application provides.|
|➃|Functionality which the application intends to use.<br>An application has implicit intents for all its own capabilities which therefore must not be declared in the manifest.|


#### The basic structure of a capability is as follows:
```javascript
{
  "type": "...", ➀
  "qualifier": {...}, ➁
  "private": ..., ➂
  "description": "...", ➃
  "properties": {...} ➄
}
```
|#|Explanation|
|-|-|
|➀|Type of functionality which this capability represents, e.g. 'view' if providing a view.|
|➁|Qualifier used to invoke this capability. A qualifier is a dictionary of key-value pairs, e.g. `{"entity": "contact", "id": "*"}`|
|➂|Visibility scope of this capability to specify if this is an application private capability and not part of the public API. If private (or if not specified), other applications cannot use this capability.|
|➃|Optional description of this capability.|
|➄|Capability specific properties. See relevant How-To for more information.<ul><li>[How to provide a view capability](how-to-provide-a-view-capability.md)</li><li>[How to provide a popup capability](how-to-provide-a-popup-capability.md)</li><li>[How to provide an activity capability](how-to-provide-an-activity-capability.md)</li>|


#### The structure of an intent is as follows:
```javascript
{
  "type": "...", ➀
  "qualifier": {...} ➁
}
```
|#|Explanation|
|-|-|
|➀|Specifies the type of functionality to use, e.g. 'view' to open a view.|
|➁|Optional qualifiers to identify the capability to use, e.g. `{"entity": "contact", "id": "*"}`|

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md