import { $ } from 'protractor';
import { enterText, findAsync } from '../spec.util';
import { SwitchToIframeFn } from '../browser-outlet/browser-outlet.po';
import { Qualifier } from '@scion/microfrontend-platform';
import { SciCheckboxPO, SciListPO, SciParamsEnterPO } from '@scion/ɵtoolkit/widgets.po';
import { CapabilityListItemPO } from './capability-list-item.po';
import { Defined } from '@scion/toolkit/util';

export class ManageCapabilitiesPagePO {

  public static readonly pageUrl = 'manage-capabilities'; // path to the page; required by {@link TestingAppPO}

  private _pageFinder = $('app-manage-capabilities');
  private _capabilityListPO: SciListPO;

  constructor(private _switchToIframeFn: SwitchToIframeFn) {
    this._capabilityListPO = new SciListPO(this._pageFinder.$('sci-list.e2e-capabilities'));
  }

  public async registerCapability(type: string, qualifier: Qualifier | undefined, options?: { scope: 'private' | 'public' }): Promise<void> {
    await this._switchToIframeFn();
    await enterText(type, this._pageFinder.$('input.e2e-capability-type'));
    if (qualifier) {
      await new SciParamsEnterPO(this._pageFinder.$('sci-params-enter.e2e-capability-qualifier')).enterParams(qualifier);
    }

    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-private')).toggle(Defined.orElse(options && options.scope, 'private') === 'private');
    await this._pageFinder.$('button.e2e-register-capability').click();
  }

  public async unregisterCapability(type: string, qualifier?: Qualifier): Promise<void> {
    await this._switchToIframeFn();

    const capabilityListItemPO = await this.findCapabilityListItemPO(type, qualifier);
    if (capabilityListItemPO) {
      await capabilityListItemPO.clickUnregister();
    }
  }

  public async findCapabilityListItemPO(type: string, qualifier?: Qualifier): Promise<CapabilityListItemPO> {
    await this._switchToIframeFn();

    const listItemPOs = await this._capabilityListPO.getListItems();
    const capabilityListItemPOs = listItemPOs.map(listItemPO => new CapabilityListItemPO(listItemPO, this._switchToIframeFn));

    return findAsync(capabilityListItemPOs, async (capability: CapabilityListItemPO): Promise<boolean> => {
      if (await capability.getType() !== type) {
        return false;
      }
      return qualifier && JSON.stringify(await capability.getQualifier()) === JSON.stringify(qualifier);
    });
  }
}
