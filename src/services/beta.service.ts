import pool from "@/config/db";
import { betaQueries } from "@/queries/beta.queries";
import { sendBetaWaitlistEmail } from "@/utils/email";

export const betaService = {
    applyBeta: async (email: string, platform: "android" | "ios", firstname?: string) => {
        const result = await pool.query(betaQueries.applyBeta, [firstname, email, platform]);

        const text = `*Yeni Beta Kaydı!*\n\n*Email:* \`${email}\`\n*Tarih:* ${new Date().toLocaleString("tr-TR")}`;

        if (result.rows.length > 0) {
            const token = process.env.TELEGRAM_BOT_TOKEN;
            const chatId = process.env.TELEGRAM_CHAT_ID;

            fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: "Markdown",
                }),
            }).catch((e) => console.error("Telegram notification failed", e));

            sendBetaWaitlistEmail(email).catch((e) => console.error("Beta email failed", e));
        }
    },
};
