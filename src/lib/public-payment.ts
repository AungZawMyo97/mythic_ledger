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

export type PublicPaymentAccountInfo = {
  name: string;
  number: string;
};

export const EMPTY_PUBLIC_PAYMENT_ACCOUNTS: Record<PublicPaymentMethod, PublicPaymentAccountInfo> =
  {
    KPAY: { name: "", number: "" },
    AYA_PAY: { name: "", number: "" },
    WAVE_PAY: { name: "", number: "" },
  };
