# Theme Creation Guide for Revolution Player

Welcome to the visual customization guide for **Revolution Player**!
We believe the community is the key to creating the best possible experience. This document explains how you can build and distribute your own custom themes for the application.

---

## 1. Theme Structure

For Revolution Player to recognize your theme correctly, you will need to package your files into a `.zip` archive. Inside the root of the `.zip`, the structure must be exactly as follows:

```text
my-awesome-theme/
├── manifest.json
└── theme.css
```

> **Important Notice**: The files must be at the **root** of the `.zip` archive. If you zip the entire folder (e.g., `my-theme.zip` containing a folder `my-theme/` which inside has `manifest.json`), the installer will fail to read it. Select the `manifest.json` and `theme.css` files directly and compress them.

---

## 2. The `manifest.json` File

The `manifest.json` file provides the essential information about your theme so that Revolution Player can display it properly in the settings.

**Example of `manifest.json`:**

```json
{
  "id": "com.your-name.dark-neon-theme",
  "name": "Dark Neon Vibe",
  "version": "1.0.0",
  "author": "Your Name or Nickname",
  "description": "A theme description."
}
```

### Field Details:
- **`id`**: A unique identifier (we recommend the *reverse-domain* format). It must not contain spaces.
- **`name`**: The friendly name of your theme that will appear in the settings.
- **`version`**: Semantic versioning (e.g., `1.0.0`, `1.1.2`).
- **`author`**: Name of the developer or creating team.
- **`description`**: A short sentence describing the style of the theme.

---

## 3. The `theme.css` File

This is the core of your theme. Revolution Player uses CSS Variables on the `:root` element to manage almost all colors, spacings, and borders of the interface.

To create your theme, you simply override these global variables.
This is the core of your theme. Revolution Player uses CSS Variables on the `:root` element to manage almost all colors, spacings, and borders of the interface. Note that all global variables are now unificated under the `:root` selector for better accessibility.

**Example of `theme.css`:**

```css
/* theme.css */
:root {
  /* Fundo (Backgrounds) */
  --bg-dark: #09090b;           /* Fundo principal do app */
  --bg-panel: #121214;          /* Fundo da barra lateral / painéis */
  --bg-surface: #18181b;        /* Fundo de cards, inputs e listas */
  --bg-surface-hover: #27272a;  /* Fundo de elementos com hover (mouse em cima) */
  --bg-surface-active: #3f3f46; /* Fundo de elementos ativos/clicados */
  
  /* Textos (Typography) */
  --text-light: #f8fafc;        /* Texto principal brilhante (Títulos) */
  --text-main: #e2e8f0;         /* Texto secundário (Corpo) */
  --text-muted: #94a3b8;        /* Texto desativado/suave (Legendas) */
  --text-inverse: #000000;      /* Texto invertido (usado em cima de fundos claros/accent) */
  
  /* Cores de Destaque (Accent) */
  --accent-primary: #8b5cf6;    /* Cor principal da sua marca (Botões, Barras) */
  --accent-hover: #7c3aed;      /* Cor de destaque ao passar o mouse */
  
  /* Bordas, Divisórias e Efeitos */
  --border-subtle: rgba(139, 92, 246, 0.15); /* Cor das linhas divisórias e bordas */
  --glass-bg: rgba(18, 18, 20, 0.7);         /* Cor de fundo transparente para Navbar/Player */
  
  /* Barra de Rolagem (Scrollbar) */
  --scrollbar: #5a5a5a;
  --scrollbar-hover: #a7a7a7;
}

/* You can also customize specific classes if necessary,
   although we recommend focusing on global CSS variables for better compatibility. */
.btn-primary {
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}
```

*Tip: You can inspect the source code (DevTools) or look at the main `index.css` file of the project to discover all available variables you can modify.*

---

## 4. Testing and Installing the Theme

1. With the `manifest.json` and `theme.css` finished, select both files in your preferred file explorer.
2. Compress them into a `.zip` format.
3. Open **Revolution Player**.
4. Navigate to the **Settings** tab.
5. Go to the **Themes** section and click the **Import Theme (.zip)** button (or drag and drop the file if enabled).
6. The application will extract, validate the manifest, and inject your CSS dynamically.
7. Select your new theme from the dropdown menu to see the magic happen!

---

## 5. Design Tips

- **Accessibility:** Ensure the contrast between the background and text (e.g., `--bg-panel` vs `--text-main`) is sufficient for comfortable reading.
- **Glassmorphism:** Take advantage of transparent backgrounds (`rgba`) in the `--glass-bg` variables to highlight the blur effect present in the Revolution Player interface.
- **Animations:** Avoid overwriting the standard CSS transition durations of the app unless there's a specific reason, to maintain the original smoothness.

Enjoy creating and be sure to share your theme with the community!
