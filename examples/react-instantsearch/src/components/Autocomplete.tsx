import type { SearchClient } from 'algoliasearch/lite';
import type { BaseItem } from '@kumoai/autocomplete-core';
import type { AutocompleteOptions } from '@kumoai/autocomplete-js';

import {
  createElement,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createRoot, Root } from 'react-dom/client';

import {
  useHierarchicalMenu,
  usePagination,
  useSearchBox,
} from 'react-instantsearch';
import { autocomplete } from '@kumoai/autocomplete-js';
import { createLocalStorageRecentSearchesPlugin } from '@kumoai/autocomplete-plugin-recent-searches';
import { createQuerySuggestionsPlugin } from '@kumoai/autocomplete-plugin-query-suggestions';
import { debounce } from '@kumoai/autocomplete-shared';

import {
  INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES,
  INSTANT_SEARCH_INDEX_NAME,
  INSTANT_SEARCH_QUERY_SUGGESTIONS,
} from '../constants';

import '@kumoai/autocomplete-theme-classic';

type AutocompleteProps = Partial<AutocompleteOptions<BaseItem>> & {
  searchClient: SearchClient;
  className?: string;
};

type SetInstantSearchUiStateOptions = {
  query: string;
  category?: string;
};

export function Autocomplete({
  searchClient,
  className,
  ...autocompleteProps
}: AutocompleteProps) {
  const autocompleteContainer = useRef<HTMLDivElement>(null);
  const panelRootRef = useRef<Root | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);

  const { query, refine: setQuery } = useSearchBox();
  const { items: categories, refine: setCategory } = useHierarchicalMenu({
    attributes: INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES,
  });
  const { refine: setPage } = usePagination();

  const [instantSearchUiState, setInstantSearchUiState] =
    useState<SetInstantSearchUiStateOptions>({ query });
  const debouncedSetInstantSearchUiState = debounce(
    setInstantSearchUiState,
    500
  );

  useEffect(() => {
    setQuery(instantSearchUiState.query);
    instantSearchUiState.category && setCategory(instantSearchUiState.category);
    setPage(0);
  }, [instantSearchUiState]);

  const currentCategory = useMemo(
    () => categories.find(({ isRefined }) => isRefined)?.value,
    [categories]
  );

  const plugins = useMemo(() => {
    const recentSearches = createLocalStorageRecentSearchesPlugin({
      key: 'instantsearch',
      limit: 3,
      transformSource({ source }) {
        return {
          ...source,
          onSelect({ item }) {
            setInstantSearchUiState({
              query: item.label,
              category: item.category,
            });
          },
        };
      },
    });

    const querySuggestionsInCategory = createQuerySuggestionsPlugin({
      searchClient,
      indexName: INSTANT_SEARCH_QUERY_SUGGESTIONS,
      getSearchParams() {
        return recentSearches.data!.getAlgoliaSearchParams({
          hitsPerPage: 3,
          facetFilters: [
            `${INSTANT_SEARCH_INDEX_NAME}.facets.exact_matches.${INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES[0]}.value:${currentCategory}`,
          ],
        });
      },
      transformSource({ source }) {
        return {
          ...source,
          sourceId: 'querySuggestionsInCategoryPlugin',
          onSelect({ item }) {
            setInstantSearchUiState({
              query: item.query,
              category: item.__autocomplete_qsCategory,
            });
          },
          getItems(params) {
            if (!currentCategory) {
              return [];
            }

            return source.getItems(params);
          },
          templates: {
            ...source.templates,
            header({ items }) {
              if (items.length === 0) {
                return <Fragment />;
              }

              return (
                <Fragment>
                  <span className="aa-SourceHeaderTitle">
                    In {currentCategory}
                  </span>
                  <span className="aa-SourceHeaderLine" />
                </Fragment>
              );
            },
          },
        };
      },
    });

    const querySuggestions = createQuerySuggestionsPlugin({
      searchClient,
      indexName: INSTANT_SEARCH_QUERY_SUGGESTIONS,
      getSearchParams() {
        if (!currentCategory) {
          return recentSearches.data!.getAlgoliaSearchParams({
            hitsPerPage: 6,
          });
        }

        return recentSearches.data!.getAlgoliaSearchParams({
          hitsPerPage: 3,
          facetFilters: [
            `${INSTANT_SEARCH_INDEX_NAME}.facets.exact_matches.${INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES[0]}.value:-${currentCategory}`,
          ],
        });
      },
      categoryAttribute: [
        INSTANT_SEARCH_INDEX_NAME,
        'facets',
        'exact_matches',
        INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES[0],
      ],
      transformSource({ source }) {
        return {
          ...source,
          sourceId: 'querySuggestionsPlugin',
          onSelect({ item }) {
            setInstantSearchUiState({
              query: item.query,
              category: item.__autocomplete_qsCategory || '',
            });
          },
          getItems(params) {
            if (!params.state.query) {
              return [];
            }

            return source.getItems(params);
          },
          templates: {
            ...source.templates,
            header({ items }) {
              if (!currentCategory || items.length === 0) {
                return <Fragment />;
              }

              return (
                <Fragment>
                  <span className="aa-SourceHeaderTitle">
                    In other categories
                  </span>
                  <span className="aa-SourceHeaderLine" />
                </Fragment>
              );
            },
          },
        };
      },
    });

    return [recentSearches, querySuggestionsInCategory, querySuggestions];
  }, [currentCategory]);

  useEffect(() => {
    if (!autocompleteContainer.current) {
      return;
    }

    const autocompleteInstance = autocomplete({
      ...autocompleteProps,
      container: autocompleteContainer.current,
      initialState: { query },
      insights: true,
      plugins,
      onReset() {
        setInstantSearchUiState({ query: '', category: currentCategory });
      },
      onSubmit({ state }) {
        setInstantSearchUiState({ query: state.query });
      },
      onStateChange({ prevState, state }) {
        if (prevState.query !== state.query) {
          debouncedSetInstantSearchUiState({
            query: state.query,
          });
        }
      },
      renderer: { createElement, Fragment, render: () => {} },
      render({ children }, root) {
        if (!panelRootRef.current || rootRef.current !== root) {
          rootRef.current = root;

          panelRootRef.current?.unmount();
          panelRootRef.current = createRoot(root);
        }

        panelRootRef.current.render(children);
      },
    });

    return () => autocompleteInstance.destroy();
  }, [plugins]);

  return <div className={className} ref={autocompleteContainer} />;
}
