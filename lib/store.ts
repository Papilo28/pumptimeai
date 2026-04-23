// In-memory stores for call and lead records.
// NOTE: These reset on every Railway redeploy/restart.
// Replace with Airtable API calls for persistent storage.

export interface CallRecord {
  id: string; userId: string; from?: string; duration?: number;
  status?: string; summary?: string; transcript?: string;
  sentiment?: string; outcome?: string; createdAt: string;
}

export interface LeadRecord {
  id: string; userId: string; name?: string; email?: string;
  phone?: string; status?: string; notes?: string; createdAt: string;
}

export const callStore: CallRecord[] = [];
export const leadStore: LeadRecord[] = [];
