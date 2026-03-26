export interface EsocialCertificate {
  id: string;
  serialNumber: string;
  issuer: string;
  subject: string;
  validFrom: string;
  validUntil: string;
  daysLeft: number;
  isExpired: boolean;
  createdAt: string;
}

export interface EsocialCertificateResponse {
  certificate: EsocialCertificate;
}
