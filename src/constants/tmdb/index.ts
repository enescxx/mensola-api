import { genres as trGenres } from "./tr";
import { genres as enGenres } from "./en";

export const genreDictionaries = {
    tr: trGenres,
    en: enGenres,
};

export type SupportedLanguage = keyof typeof genreDictionaries;

export const mapGenreIdsToNames = (genreIds: number[], lang: string = "tr"): string[] => {
    const selectedLang = (lang.toLowerCase().startsWith("en") ? "en" : "tr") as SupportedLanguage;
    const dict = genreDictionaries[selectedLang] || genreDictionaries.tr;

    return (genreIds || []).map((id) => dict[id]).filter(Boolean);
};
