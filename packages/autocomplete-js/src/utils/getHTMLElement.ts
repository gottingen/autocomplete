import { AutocompleteEnvironment } from '@kumoai/autocomplete-core';
import { invariant } from '@kumoai/autocomplete-shared';

export function getHTMLElement(
  environment: AutocompleteEnvironment,
  value: string | HTMLElement
): HTMLElement {
  if (typeof value === 'string') {
    const element = environment.document.querySelector<HTMLElement>(value);

    invariant(
      element !== null,
      `The element ${JSON.stringify(value)} is not in the document.`
    );

    return element!;
  }

  return value;
}
