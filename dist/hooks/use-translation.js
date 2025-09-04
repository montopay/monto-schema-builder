import { useContext } from "react";
import { en } from "../i18n/locales/en.js";
import { TranslationContext } from "../i18n/translation-context.js";
function useTranslation() {
    const translation = useContext(TranslationContext);
    return translation ?? en;
}
function formatTranslation(template, values) {
    return template.replace(/\{(\w+)\}/g, (_, key)=>{
        const value = values[key];
        return void 0 !== value ? String(value) : `{${key}}`;
    });
}
export { formatTranslation, useTranslation };
