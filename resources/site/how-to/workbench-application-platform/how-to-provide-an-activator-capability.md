![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to provide an activator capability

An activator is a hook for microfrontends, allowing them to interact with the platform, even if no microfrontend of that application is running, e.g. to dynamically register capabilities based on some application state.

To provide an activator, perform the following steps:

### 1. Register the activator capability in the manifest
Open your application manifest and add a capability of the type 'activator' as follows:

```javascript
{
  "capabilities": [
    {
      "type": "activator",
      "properties": {
        "path": "..." ➀
      }
    }
  ]
}
```
|#|Explanation|
|-|-|
|➀|Path to the module to be instantiated at platform startup, e.g. `activator`. |

Following properties are supported:

|category|property|type|mandatory|description|
|-|-|-|-|-|
||type|'activator'|✓|For activators, the type must be 'activator'.|
|properties|path|string|✓|Path to the module to load when this capability is invoked.<br>The path is relative to the base URL as specified in the application manifest.|

### 2. Create an activator module
Use Angular CLI to create a new module.

```typescript
@NgModule({})
export class ActivatorModule {
  constructor(manifestRegistryService: ManifestRegistryService) { ➀
    // Activator logic
  }
}
```
|#|Explanation|
|-|-|
|➀|Inject services which you use in the activator logic.|

> For non Angular applications, you can inject services via `Platform.getService(ManifestRegistryService)`.

### 3. Add a lazy-loaded route
In the routing module, register a lazy-loaded route to the module under the path as specified in the activator capability, e.g. `activator`.

```typescript
const routes: Routes = [
  ...,
  {path: 'activator', loadChildren: (): any => import('./activator.module').then(m => m.ActivatorModule)},
];
```

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md
