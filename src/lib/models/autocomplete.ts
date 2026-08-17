/**
 * Suggestion entry for the free-text autocomplete inputs.
 *
 * Replaces Skeleton v2's `AutocompleteOption`, which was removed along with
 * the `Autocomplete` component in v3.
 */
export interface AutocompleteOption<T = string> {
  label: string;
  value: T;
  keywords?: string;
}

export function matchesAutocompleteOption(option: AutocompleteOption<unknown>, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }

  return (
    option.label.toLowerCase().includes(needle) ||
    (option.keywords?.toLowerCase().includes(needle) ?? false)
  );
}
