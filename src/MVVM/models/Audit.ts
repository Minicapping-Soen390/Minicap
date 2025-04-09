export interface Audit {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

// This is the source of truth and should be reflected in all diagrams
