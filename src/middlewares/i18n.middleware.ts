import { Request, Response, NextFunction } from "express";

export const parseAcceptLanguage = (header?: string): "tr" | "en" => {
    if (!header) return "tr";

    const parts = header
        .split(",")
        .map((part) => {
            const [lang, qPart] = part.trim().split(";");
            const q = qPart && qPart.startsWith("q=") ? parseFloat(qPart.slice(2)) : 1.0;
            return { lang: lang.trim().toLowerCase(), q: isNaN(q) ? 1.0 : q };
        })
        .sort((a, b) => b.q - a.q);

    for (const item of parts) {
        if (item.lang.startsWith("en")) return "en";
        if (item.lang.startsWith("tr")) return "tr";
    }

    return "tr";
};

export const i18nMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers["accept-language"]?.toString();
    const language = parseAcceptLanguage(header);
    (req as any).language = language;
    res.locals.language = language;
    next();
};
