# Add global translation and custom brand colours

## Scope
- Expand the language selector to 100+ languages with search.
- Translate the rendered page when a language is selected, including content loaded after navigation.
- Keep English as the original language and support restoring it instantly.
- Show all existing light and dark themes in the theme selector.
- Add saved custom primary and accent colour controls without exposing unsafe background/text combinations.

## Implementation
1. Replace the six-language list with a searchable global language catalogue, including right-to-left metadata and speech-language mappings.
2. Add a site-wide translation layer that translates visible page text on selection, preserves forms/code/brand names, handles route changes, and reports loading or failure states accessibly.
3. Keep interface preference labels translated locally, while using automatic translation for the full page and dynamic content.
4. Extend the theme provider with a custom brand-colour preference, persisted in the browser and synced to the signed-in profile when supported.
5. Add primary/accent colour pickers, accessible text inputs, reset controls, and live contrast safeguards to the theme menu.
6. Ensure all 11 current preset themes remain visible regardless of light/dark mode.
7. Validate language direction, translation, theme switching, custom colours, mobile layout, keyboard access, and page navigation.
8. Repair the existing case-study page build error encountered during validation.

## Technical details
- Automatic translation will be loaded only after a non-English language is selected; English remains first-party content.
- Custom colours override semantic brand tokens, so buttons, links, focus rings, gradients, and accents update consistently.
- User content, code samples, email addresses, URLs, and elements marked as non-translatable remain unchanged.
- Page metadata remains in the authored language; this update changes the visible page experience rather than creating separate indexed translations.
