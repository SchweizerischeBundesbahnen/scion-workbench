# [18.0.0-beta.3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/18.0.0-beta.2...18.0.0-beta.3) (2024-06-21)


### Bug Fixes

* **workbench/perspective:** create default perspective if no perspective exists ([7010623](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/701062314d580110d2e368eff899d55869bd046a))
* **workbench/view:** align microfrontend with view bounds when moving it to another part of the same size ([e57f0d0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e57f0d00894851fb720cad70da4c77f2b3b5fcb1))
* **workbench/view:** do not error when initializing view in `ngOnInit` ([1374260](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/1374260523670f447ace5e9757890f5a24e81dc8))
* **workbench/view:** initialize microfrontend loaded into inactive view ([764f89e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/764f89eee64e06685db4c9144ccaaf072d784449))


### Features

* **workbench/perspective:** activate first view of each part if not specified ([161d05d](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/161d05d787caf0df2fbc74596b845a711e44891b))
* **workbench/perspective:** enable micro app to contribute perspective ([f20f607](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f20f607333a480ad9f89f3c13f52ef472ff256c4)), closes [#449](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/449)
* **workbench/view:** display "Not Found" page if microfrontend is not available ([93be385](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/93be3853734b248cf29364c96f641d329eef8d5b))


### BREAKING CHANGES

* **workbench/perspective:** The return type of the function to select the initial perspective has changed. To migrate, return the perspective id instead of the perspective instance.
* **workbench:** SCION Workbench requires `@scion/microfrontend-platform` version `1.3.0` or later.
* **workbench:** SCION Workbench requires `@scion/workbench-client` version `1.0.0-beta.24` or later.



