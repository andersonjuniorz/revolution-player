export interface ThemeConfig {
  [key: string]: string;
}

/**
 * Aplica um tema lendo as chaves de um objeto JSON e injetando como
 * CSS Custom Properties no :root da aplicação.
 * 
 * Exemplo de uso:
 * applyTheme({ "--color-accent": "#ff0055", "--color-bg-app": "#111" })
 */
export const applyTheme = (theme: ThemeConfig) => {
  const root = document.documentElement;
  
  Object.entries(theme).forEach(([property, value]) => {
    // Garante que a propriedade comece com '--'
    const cssVar = property.startsWith('--') ? property : `--${property}`;
    root.style.setProperty(cssVar, value);
  });
};

