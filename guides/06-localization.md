# Localization Guide

## Overview

We use **Paraglide JS** for internationalization. It provides type-safe message handling and efficient compilation.

## Structure

-   **Message Files**: Located in `messages/` (e.g., `en.json`, `es.json`).
-   **Configuration**: `project.inlang/settings.json`.
-   **Generated Code**: `src/lib/paraglide/` (do not edit manually).

## Adding Translations

1.  Open the relevant JSON file in `messages/` (e.g., `messages/en.json`).
2.  Add a new key-value pair:
    ```json
    {
        "hello_world": "Hello World",
        "welcome_user": "Welcome, {name}!"
    }
    ```
3.  The Paraglide compiler (running in Vite plugin) will automatically regenerate the types.

## Usage in Components

Import `m` from the generated paraglide folder.

```svelte
<script>
    import * as m from '$lib/paraglide/messages.js';
</script>

<h1>{m.hello_world()}</h1>
<p>{m.welcome_user({ name: 'Alice' })}</p>
```

## Language Switching

The `hooks.server.ts` handles the language context based on the URL or headers (configured in Paraglide middleware).
Links should generally be locale-aware if using route-based localization.
