<a href="/docs/site/application-platform/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench Application Platform][menu-home] > [How To Guides][menu-how-to] > DevTools

#### How to integrate DevTools

The DevTools application is like a regular application and helps developers to have a better overview of the applications installed in the platform. DevTools is freely available which you can integrate into your application with minimal effort. Simply register the following application with the platform, and you are done. 

```typescript
@NgModule({
  imports: [
    WorkbenchModule.forRoot(),
    WorkbenchApplicationPlatformModule.forRoot({
      applicationConfig: [
        {
          symbolicName: 'dev-tools-app',
          manifestUrl: 'https://scion-workbench-application-platform-devtools.now.sh/assets/manifest.json', ➀
          scopeCheckDisabled: true, ➁
        }
      ],
    })
  ],
})
export class HostAppModule {
}
```

|#|Explanation|
|-|-|
|➀|Sets the URL to the devtools manifest|
|➁|Disables scope check because `dev-tools-app` requires to invoke private-scoped capabilities.|
  

DevTools provides the following functionality:

- helps analyze inter-application dependencies
- inspects the capabilities and intents of all applications
- for every intent, it shows the applications providing a respective capability, if any
- for every capability, it shows the applications using that capability, if any
- allows invocation of view and popup capabilities

<a href="/docs/site/images/workbench-application-platform-devtools-large.png">![DevTools](/docs/site/images/workbench-application-platform-devtools-small.png)</a>

##### Extend DevTools to allow invocation of custom capability types 

It is easy to extend `dev-tools` to allow invocation of custom capability types. Simply provide a public popup capability with the following qualifier:

```javascript
{
  "capabilities": [
    {
      "type": "popup",
      "qualifier": {
        "entity": "capability",
        "action": "execute",
        "type": "<your custom capability type>",
        "capabilityId": "*"
      }
    }
  ]
}
```
If found a capability provider for your custom capability type, the execute button is displayed, and the user can invoke it.\
In the popup, you can query the manifest registry to read metadata about the capability to be invoked. If the case, do not forget to specify the respective intent to read the manifest registry.

```javascript
{
  "intents": [
    {
      "type": "manifest-registry"
    }
  ]
}
```

[menu-how-to]: /docs/site/application-platform/howto/how-to.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
