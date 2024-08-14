import {
  AutocompleteState,
  BaseItem,
  InternalAutocompleteOptions,
} from '@kumoai/autocomplete-core';
import { SourceTemplates } from '@kumoai/autocomplete-js';
import { SearchForFacetValuesResponse } from '@kumoai/autocomplete-preset-algolia';
import type { SearchResponse } from '@kumoai/autocomplete-shared';

export interface RedirectUrlPlugin {
  data: RedirectUrlState[];
}

export interface RedirectUrlState {
  sourceId: string;
  urls: string[];
}

export interface RedirectUrlItem extends RedirectUrlState, BaseItem {}

export type OnRedirectOptions<TItem extends RedirectUrlItem> = {
  event: any;
  navigator: InternalAutocompleteOptions<TItem>['navigator'];
  state: AutocompleteState<TItem>;
};

export type TransformResponseParams<TItem> =
  | SearchResponse<TItem>
  | SearchForFacetValuesResponse;

export type CreateRedirectUrlPluginParams<TItem extends BaseItem> = {
  transformResponse?(
    response: TransformResponseParams<TItem>
  ): string | undefined;
  onRedirect?(
    redirects: RedirectUrlItem[],
    options: OnRedirectOptions<RedirectUrlItem>
  ): void;
  templates?: SourceTemplates<RedirectUrlItem>;
};
