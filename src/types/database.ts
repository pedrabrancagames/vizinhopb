export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type UserRole = 'user' | 'moderator' | 'admin'
export type RequestStatus = 'open' | 'negotiating' | 'in_progress' | 'completed' | 'cancelled' | 'expired'
export type Urgency = 'low' | 'medium' | 'high'
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'borrowed' | 'returned' | 'cancelled'
export type ReviewType = 'requester_to_helper' | 'helper_to_requester'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    name: string | null
                    avatar_url: string | null
                    bio: string | null
                    neighborhood: string | null
                    city: string | null
                    latitude: number | null
                    longitude: number | null
                    rating_as_requester: number
                    rating_as_helper: number
                    total_requests: number
                    total_helps: number
                    role: UserRole
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    neighborhood?: string | null
                    city?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    rating_as_requester?: number
                    rating_as_helper?: number
                    total_requests?: number
                    total_helps?: number
                    role?: UserRole
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    neighborhood?: string | null
                    city?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    rating_as_requester?: number
                    rating_as_helper?: number
                    total_requests?: number
                    total_helps?: number
                    role?: UserRole
                    created_at?: string
                }
            }
            requests: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string | null
                    category: string
                    urgency: Urgency
                    status: RequestStatus
                    needed_until: string | null
                    created_at: string
                    updated_at: string
                    closed_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description?: string | null
                    category: string
                    urgency?: Urgency
                    status?: RequestStatus
                    needed_until?: string | null
                    created_at?: string
                    updated_at?: string
                    closed_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    category?: string
                    urgency?: Urgency
                    status?: RequestStatus
                    needed_until?: string | null
                    created_at?: string
                    updated_at?: string
                    closed_at?: string | null
                }
            }
            request_images: {
                Row: {
                    id: string
                    request_id: string
                    url: string
                    order: number
                }
                Insert: {
                    id?: string
                    request_id: string
                    url: string
                    order?: number
                }
                Update: {
                    id?: string
                    request_id?: string
                    url?: string
                    order?: number
                }
            }
            offers: {
                Row: {
                    id: string
                    request_id: string
                    helper_id: string
                    message: string | null
                    status: OfferStatus
                    created_at: string
                    accepted_at: string | null
                    borrowed_at: string | null
                    returned_at: string | null
                }
                Insert: {
                    id?: string
                    request_id: string
                    helper_id: string
                    message?: string | null
                    status?: OfferStatus
                    created_at?: string
                    accepted_at?: string | null
                    borrowed_at?: string | null
                    returned_at?: string | null
                }
                Update: {
                    id?: string
                    request_id?: string
                    helper_id?: string
                    message?: string | null
                    status?: OfferStatus
                    created_at?: string
                    accepted_at?: string | null
                    borrowed_at?: string | null
                    returned_at?: string | null
                }
            }
            reviews: {
                Row: {
                    id: string
                    offer_id: string
                    reviewer_id: string
                    reviewed_id: string
                    review_type: ReviewType
                    rating: number
                    comment: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    offer_id: string
                    reviewer_id: string
                    reviewed_id: string
                    review_type: ReviewType
                    rating: number
                    comment?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    offer_id?: string
                    reviewer_id?: string
                    reviewed_id?: string
                    review_type?: ReviewType
                    rating?: number
                    comment?: string | null
                    created_at?: string
                }
            }
            conversations: {
                Row: {
                    id: string
                    request_id: string
                    requester_id: string
                    helper_id: string
                    created_at: string
                    last_message_at: string
                }
                Insert: {
                    id?: string
                    request_id: string
                    requester_id: string
                    helper_id: string
                    created_at?: string
                    last_message_at?: string
                }
                Update: {
                    id?: string
                    request_id?: string
                    requester_id?: string
                    helper_id?: string
                    created_at?: string
                    last_message_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    conversation_id: string
                    sender_id: string
                    content: string
                    read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    conversation_id: string
                    sender_id: string
                    content: string
                    read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    conversation_id?: string
                    sender_id?: string
                    content?: string
                    read?: boolean
                    created_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    type: string
                    title: string
                    message: string | null
                    data: Json | null
                    read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: string
                    title: string
                    message?: string | null
                    data?: Json | null
                    read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: string
                    title?: string
                    message?: string | null
                    data?: Json | null
                    read?: boolean
                    created_at?: string
                }
            }
            business_categories: {
                Row: {
                    id: string
                    name: string
                    icon: string
                    slug: string
                    order: number
                }
                Insert: {
                    id?: string
                    name: string
                    icon: string
                    slug: string
                    order?: number
                }
                Update: {
                    id?: string
                    name?: string
                    icon?: string
                    slug?: string
                    order?: number
                }
            }
            businesses: {
                Row: {
                    id: string
                    category_id: string
                    created_by: string
                    approved_by: string | null
                    name: string
                    description: string | null
                    phone: string | null
                    whatsapp: string | null
                    email: string | null
                    address: string | null
                    neighborhood: string | null
                    latitude: number | null
                    longitude: number | null
                    logo_url: string | null
                    cover_url: string | null
                    working_hours: string | null
                    approval_status: ApprovalStatus
                    rejection_reason: string | null
                    verified: boolean
                    rating: number
                    total_reviews: number
                    created_at: string
                    updated_at: string
                    approved_at: string | null
                }
                Insert: {
                    id?: string
                    category_id: string
                    created_by: string
                    approved_by?: string | null
                    name: string
                    description?: string | null
                    phone?: string | null
                    whatsapp?: string | null
                    email?: string | null
                    address?: string | null
                    neighborhood?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    logo_url?: string | null
                    cover_url?: string | null
                    working_hours?: string | null
                    approval_status?: ApprovalStatus
                    rejection_reason?: string | null
                    verified?: boolean
                    rating?: number
                    total_reviews?: number
                    created_at?: string
                    updated_at?: string
                    approved_at?: string | null
                }
                Update: {
                    id?: string
                    category_id?: string
                    created_by?: string
                    approved_by?: string | null
                    name?: string
                    description?: string | null
                    phone?: string | null
                    whatsapp?: string | null
                    email?: string | null
                    address?: string | null
                    neighborhood?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    logo_url?: string | null
                    cover_url?: string | null
                    working_hours?: string | null
                    approval_status?: ApprovalStatus
                    rejection_reason?: string | null
                    verified?: boolean
                    rating?: number
                    total_reviews?: number
                    created_at?: string
                    updated_at?: string
                    approved_at?: string | null
                }
            }
            business_reviews: {
                Row: {
                    id: string
                    business_id: string
                    user_id: string
                    rating: number
                    comment: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    business_id: string
                    user_id: string
                    rating: number
                    comment?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    business_id?: string
                    user_id?: string
                    rating?: number
                    comment?: string | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: UserRole
            request_status: RequestStatus
            urgency: Urgency
            offer_status: OfferStatus
            review_type: ReviewType
            approval_status: ApprovalStatus
        }
    }
}
