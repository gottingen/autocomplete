import { autocomplete } from '@kumoai/autocomplete-js';

import { createGitHubReposPlugin } from './createGitHubReposPlugin';

import '@kumoai/autocomplete-theme-classic';

const gitHubReposPlugin = createGitHubReposPlugin({
  // eslint-disable-next-line @typescript-eslint/camelcase
  per_page: 5,
});

autocomplete({
  container: '#autocomplete',
  placeholder: 'Search repositories',
  plugins: [gitHubReposPlugin],
});
