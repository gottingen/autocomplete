import {
  createLocalStorageRecentSearchesPlugin,
  search,
} from '@kumoai/autocomplete-plugin-recent-searches';

export const recentSearchesPlugin = createLocalStorageRecentSearchesPlugin({
  key: 'autocomplete-two-column-layout-example',
  search(params) {
    return search({ ...params, limit: params.query ? 1 : 4 });
  },
});
