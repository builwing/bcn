// types/api.ts - API関連の型定義
export interface Post {
    id: number;
    title: string;
    category: string;
    content: string;
    rating: number;
    images: string[];
    user?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface PostCreateData {
    title: string;
    category: string;
    content: string;
    rating: number;
    images: File[];
}

export interface PostUpdateData extends Partial<PostCreateData> {
    id: number;
}