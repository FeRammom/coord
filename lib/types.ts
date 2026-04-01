export interface User {
  id: number
  login: string
  password_hash: string
  role: 'admin' | 'coordinator'
  is_super: number // 1 = главный админ, 0 = младший админ
  full_name: string
  email: string | null
  phone: string | null
  organization: string | null
  created_at: string
}

export interface Event {
  id: number
  title: string
  description: string | null
  event_date: string | null
  location: string | null
  max_coordinators: number | null
  status: 'planned' | 'active' | 'completed' | 'cancelled'
  created_at: string
}

export interface Application {
  id: number
  event_id: number
  user_id: number
  status: 'pending' | 'approved' | 'rejected'
  comment: string | null
  created_at: string
  // Joined fields
  event_title?: string
  user_full_name?: string
  user_email?: string
  user_phone?: string
  user_organization?: string
}

export interface Rating {
  id: number
  event_id: number
  user_id: number
  score: number
  comment: string | null
  rated_by: number
  created_at: string
  // Joined fields
  event_title?: string
  user_full_name?: string
  rated_by_name?: string
}

export interface FeedbackTemplate {
  id: number
  event_id: number
  title: string
  is_active: number
  created_at: string
  // Joined
  event_title?: string
  fields?: FeedbackField[]
}

export interface FeedbackField {
  id: number
  template_id: number
  field_type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'rating'
  label: string
  options: string | null
  is_required: number
  sort_order: number
}

export interface FeedbackResponse {
  id: number
  template_id: number
  user_id: number
  answers: string
  created_at: string
  // Joined
  user_full_name?: string
  template_title?: string
}
