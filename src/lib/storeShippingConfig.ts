export const storeShippingConfig: Record<string, { fee: number; freeThreshold: number }> = {
    free: { fee: 0, freeThreshold: 0 },
    GRL: { fee: 0, freeThreshold: 0 },
    ZOZOTOWN: { fee: 660, freeThreshold: Infinity },
    ROJITA: { fee: 650, freeThreshold: 10000 },
    axesFemme: { fee: 410, freeThreshold: 10000 },
    amavel: { fee: 715, freeThreshold: 10000 },
    dreamvs: { fee: 580, freeThreshold: 8000 },
    INGNI: { fee: 550, freeThreshold: 4900 },
    default: { fee: 800, freeThreshold: Infinity },
};