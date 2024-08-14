export * from '@kumoai/autocomplete-shared/dist/esm/js';
export * from './AutocompleteApi';
export * from './AutocompleteDom';

import {
  AutocompleteOptions as AutocompleteCoreOptions,
  BaseItem,
} from '@kumoai/autocomplete-core';
import { AutocompleteOptions as AutocompleteJsOptions } from '@kumoai/autocomplete-shared/dist/esm/js';

export type {
  AutocompleteInsightsApi,
  AlgoliaInsightsHit,
} from '@kumoai/autocomplete-core';

export interface AutocompleteOptions<TItem extends BaseItem>
  extends AutocompleteJsOptions<TItem> {
  insights?: AutocompleteCoreOptions<TItem>['insights'];
}
