<a href="/docs/site/application-platform/README.md"><img src="/docs/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench Application Platform][menu-home] > [How To Guides][menu-how-to] > Manifest

#### What does the application manifest structure look like
The application manifest is a JSON file which contains metadata about the application, its capabilities and intents.

##### The basic structure of the manifest is as follows:

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


##### The basic structure of a capability is as follows:
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
|➄|Capability specific properties. See relevant How-To for more information.<ul><li>[How to provide a view capability](docs/site/application-platform/howto/how-to-provide-a-view-capability.md)</li><li>[How to provide a popup capability](docs/site/application-platform/howto/how-to-provide-a-popup-capability.md)</li><li>[How to provide an activity capability](docs/site/application-platform/howto/how-to-provide-an-activity-capability.md)</li>|


##### The structure of an intent is as follows:
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

[menu-how-to]: /docs/site/application-platform/howto/how-to.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
