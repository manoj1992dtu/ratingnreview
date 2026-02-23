export interface Industry {
  id: string; // UUID
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  parent_industry_id?: string | null; // UUID
  search_volume: number;
  is_primary: boolean;
  display_order: number;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at: string;
  updated_at: string;
}
