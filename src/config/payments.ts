// Payment details for Pakistan. Never hardcode these in components.
export const PAYMENTS = {
  title: "Muhammad Hamza (Pixely Careers)",
  easypaisa: { number: "0370 6404900", copy: "03706404900", qr: "/payments/easypaisa-qr.png" },
  ubl: { bank: "UBL", number: "1036342767045", iban: "PK93UNIL0109000342767045" },
} as const;
