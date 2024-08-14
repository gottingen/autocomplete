import { autocomplete } from '@kumoai/autocomplete-js';
import { createQuerySuggestionsPlugin } from '@kumoai/autocomplete-plugin-query-suggestions';
import { createLocalStorageRecentSearchesPlugin } from '@kumoai/autocomplete-plugin-recent-searches';
import algoliasearch from 'algoliasearch/lite';

import '@kumoai/autocomplete-theme-classic';

const appId = 'latency';
const apiKey = '6be0576ff61c053d5f9a3225e2a90f76';
const searchClient = algoliasearch(appId, apiKey);

const recentSearchesPlugin = createLocalStorageRecentSearchesPlugin({
  key: 'query-suggestions-history-with-category-example',
  limit: 5,
});

const querySuggestionsPlugin = createQuerySuggestionsPlugin({
  searchClient,
  indexName: 'instant_search_demo_query_suggestions',
  getSearchParams() {
    return recentSearchesPlugin.data.getAlgoliaSearchParams({
      hitsPerPage: 5,
    });
  },
  categoryAttribute: [
    'instant_search',
    'facets',
    'exact_matches',
    'categories',
  ],
});

autocomplete({
  container: '#autocomplete',
  placeholder: 'Search',
  openOnFocus: true,
  insights: true,
  plugins: [recentSearchesPlugin, querySuggestionsPlugin],
});
