import { $ } from 'protractor';
import { enterText, findAsync } from '../spec.util';
import { SwitchToIframeFn } from '../outlet.po';
import { Qualifier } from '@scion/microfrontend-platform';
import { SciListPO, SciParamsEnterPO } from '@scion/ɵtoolkit/widgets.po';
import { IntentListItemPO } from './intent-list-item.po';

export class ManageIntentsPagePO {

  public static readonly pageUrl = 'manage-intents';

  private _pageFinder = $('app-manage-intents');
  private _intentListPO: SciListPO;

  constructor(private _switchToIframeFn: SwitchToIframeFn) {
    this._intentListPO = new SciListPO(this._pageFinder.$('sci-list.e2e-intents'));
  }

  public async registerIntent(type: string, qualifier?: Qualifier): Promise<void> {
    await this._switchToIframeFn();
    await enterText(type, this._pageFinder.$('input.e2e-intent-type'));
    if (qualifier) {
      await new SciParamsEnterPO(this._pageFinder.$('sci-params-enter.e2e-intent-qualifier')).enterParams(qualifier);
    }
    await this._pageFinder.$('button.e2e-register-intent').click();
  }

  public async unregisterIntent(type: string, qualifier?: Qualifier): Promise<void> {
    await this._switchToIframeFn();

    const intentListItemPO = await this.findIntentListItemPO(type, qualifier);
    if (intentListItemPO) {
      await intentListItemPO.clickUnregister();
    }
  }

  public async findIntentListItemPO(type: string, qualifier?: Qualifier): Promise<IntentListItemPO> {
    await this._switchToIframeFn();

    const listItemPOs = await this._intentListPO.getListItems();
    const intentListItemPOs = listItemPOs.map(listItemPO => new IntentListItemPO(listItemPO, this._switchToIframeFn));

    return findAsync(intentListItemPOs, async (intentPO: IntentListItemPO): Promise<boolean> => {
      if (await intentPO.getType() !== type) {
        return false;
      }
      return qualifier && JSON.stringify(await intentPO.getQualifier()) === JSON.stringify(qualifier);
    });
  }
}
