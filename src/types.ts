export interface Macro {
  id: string;
  creator_name: string;
  title: string;
  fruit?: string;
  sword?: string;
  melee?: string;
  gun?: string;
  macro_type: string;
  bounty_boost?: string;
  video_url?: string;
  macro_json: string;
  notes?: string;
  comment_count: number;
  view_count: number;
  views?: string[];
  likes?: string[];
  created_at: number;
  updated_at: number;
}

export interface Comment {
  id: string;
  macro_id: string;
  creator_name: string;
  creator_avatar?: string;
  content: string;
  created_at: number;
}


