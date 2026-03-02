export interface User {
  id: number
  login: string
  password_hash: string
  role: 'admin' | 'coordinator'
  full_name: string
  direction: string
  group_name: string
  phone: string
  residence: string
  created_at: string
}

export interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  location: string
  participant_limit: number
  status: 'planned' | 'active' | 'completed' | 'cancelled'
  created_at: string
}

export interface Application {
  id: number
  event_id: number
  user_id: number
  status: 'pending' | 'approved' | 'rejected'
  reject_reason: string
  created_at: string
  // Joined fields
  event_title?: string
  event_date?: string
  event_time?: string
  event_location?: string
  user_full_name?: string
  user_direction?: string
  user_group_name?: string
  user_phone?: string
  user_residence?: string
}

export interface Rating {
  id: number
  event_id: number
  user_id: number
  admin_id: number
  score: number
  created_at: string
  // Joined fields
  event_title?: string
  user_full_name?: string
  admin_full_name?: string
}

export interface FeedbackTemplate {
  id: number
  event_id: number
  name: string
  is_active: number
  created_at: string
  // Joined
  event_title?: string
  fields?: FeedbackField[]
}

export interface FeedbackField {
  id: number
  template_id: number
  field_type: 'number' | 'string' | 'text'
  label: string
  required: number
  sort_order: number
}

export interface FeedbackResponse {
  id: number
  user_id: number
  field_id: number
  event_id: number
  value: string
  created_at: string
  // Joined
  user_full_name?: string
}
