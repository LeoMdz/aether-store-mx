export const storeConfig = Object.freeze({
  discordUrl: "https://discord.gg/KGnEsCutW",
  // International digits only. Empty opens WhatsApp's recipient selector.
  whatsappNumber: (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, ""),
  name: "Aether Store MX",
});
