export interface Post {
    id: number
    title: string
    category: string
    rating: number
    content: string
    images?: PostImage[]
    created_at?: string
    updated_at?: string
}

export interface PostImage {
    id: number
    url: string
    filename: string
    post_id: number
}

export interface FormState {
    title: string
    category: string
    rating: number
    content: string
    images: File[]
}

export interface FormErrors {
    title?: string
    category?: string
    rating?: string
    content?: string
    images?: string
}

export interface APIResponse<T = any> {
    data?: T
    error?: Error
}