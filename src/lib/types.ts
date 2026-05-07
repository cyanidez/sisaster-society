export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface PointCategory {
  id: string;
  name: string;
  name_th: string;
  icon: string | null;
  color: string | null;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  category_id: string | null;
  points: number;
  description: string;
  description_th: string | null;
  reference_id: string | null;
  created_at: string;
  point_categories?: PointCategory;
}

export interface Member {
  id: string;
  name: string;
  nickname: string;
  nickname_th: string | null;
  generation: number;
  team: string | null;
  birthday: string | null;
  birthplace: string | null;
  height_cm: number | null;
  bio: string | null;
  bio_th: string | null;
  image_url: string | null;
  color: string | null;
  is_active: boolean;
  join_date: string | null;
  graduate_date: string | null;
  instagram: string | null;
  twitter: string | null;
}

export interface TimelineEvent {
  id: string;
  title: string;
  title_th: string;
  description: string | null;
  description_th: string | null;
  event_date: string;
  event_type: string;
  image_url: string | null;
  is_major: boolean;
}
