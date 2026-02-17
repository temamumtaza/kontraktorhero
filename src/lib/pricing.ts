// Centralized pricing configuration
// Update prices here and they will be reflected across the entire app

export const PRICING = {
    starter: {
        name: "Starter Pack",
        price: 99000,          // Harga promo saat ini
        originalPrice: 4000000, // Harga normal (courseTotal)
        label: "Starter",
        features: [
            "6 Modul Lengkap",
            "Akses selamanya + update gratis",
            "Garansi 7 hari uang kembali",
        ],
    },
    hero: {
        name: "Kontraktor Hero Membership",
        price: 149000,          // Harga promo saat ini
        originalPrice: 7482000, // Harga normal (grandTotal = courseTotal + bonusTotal)
        label: "Kontraktor Hero",
        features: [
            "6 Modul Lengkap",
            "80+ Template & Dokumen Kerja",
            "Akses selamanya + update gratis",
            "Garansi 7 hari uang kembali",
        ],
    },
} as const;

export type Tier = keyof typeof PRICING;
