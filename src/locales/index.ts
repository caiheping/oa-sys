import { App } from "vue";
import { I18n, I18nOptions, createI18n } from "vue-i18n";
import { LocaleType } from 'types/locale'

export let i18n: ReturnType<typeof createI18n>;

const availableLocales = ["zh-cn", "en"];

async function createI18nOptions(): Promise<I18nOptions> {
  let locale: LocaleType = "zh-cn";
  if (availableLocales.includes(localStorage.getItem("locale") as string)) {
    locale = localStorage.getItem("locale") as LocaleType;
  }
  console.log(locale)
  const defaultLocal = await import(`./langs/${locale}.ts`);
  const message = defaultLocal.default?.message ?? {};

  return {
    locale,
    messages: {
      [locale as string]: message,
    },
    availableLocales,
    sync: true, // If you don’t want to inherit locale from global scope, you need to set sync of i18n component option to false.
    silentTranslationWarn: true, // true - warning off
    silentFallbackWarn: true,
  };
}

// setup i18n instance with glob
export async function setupI18n(app: App) {
  const options = await createI18nOptions();
  i18n = createI18n(options) as I18n;
  app.use(i18n);
}
