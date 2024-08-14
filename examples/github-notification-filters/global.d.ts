import { TagsApi } from '@kumoai/autocomplete-plugin-tags';

import { NotificationFilter } from './types';

declare module '@kumoai/autocomplete-core' {
  interface AutocompleteContext {
    tagsPlugin: TagsApi<NotificationFilter>;
  }
}
