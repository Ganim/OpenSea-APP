export interface UserTenant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  status: string;
  role: string;
  joinedAt: Date;
}

export interface SelectTenantResponse {
  token: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
}
