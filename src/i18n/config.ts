import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { configService } from "../services/ConfigService";

import ptBR from "./locales/pt-BR.json";
import enUS from "./locales/en-US.json";
import esES from "./locales/es-ES.json";

const resources = {
  "pt-BR": { translation: ptBR },
  "en-US": { translation: enUS },
  "es-ES": { translation: esES }
};

i18n.use(initReactI18next).init({
  resources,
  lng: configService.getLanguage(), // Inicializa com o idioma salvo nas configurações
  fallbackLng: "pt-BR",
  interpolation: {
    escapeValue: false // O React já faz o escape contra XSS
  }
});

export default i18n;
