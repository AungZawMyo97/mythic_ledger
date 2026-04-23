export const PUBLIC_PAYMENT_METHODS = ["KPAY", "AYA_PAY", "WAVE_PAY"] as const;

export type PublicPaymentMethod = (typeof PUBLIC_PAYMENT_METHODS)[number];

export function isPublicPaymentMethod(value: string): value is PublicPaymentMethod {
  return PUBLIC_PAYMENT_METHODS.includes(value as PublicPaymentMethod);
}

export const PUBLIC_PAYMENT_LABELS: Record<PublicPaymentMethod, string> = {
  KPAY: "KPay",
  AYA_PAY: "AYA Pay",
  WAVE_PAY: "Wave Pay",
};

export function getPublicPaymentNumbers() {
  return {
    KPAY: process.env.KPAY_NUMBER?.trim() ?? "",
    AYA_PAY: process.env.AYA_PAY_NUMBER?.trim() ?? "",
    WAVE_PAY: process.env.WAVE_PAY_NUMBER?.trim() ?? "",
  } satisfies Record<PublicPaymentMethod, string>;
}
