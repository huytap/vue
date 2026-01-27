export interface User {
    id: number;
    name: string;
    email: string;
    is_super_admin: boolean;
    permissions: string[],
    roles: string[];
    email_verified_at?: string;
    created_at: string;
}

export interface LoginResponse {
    user: User;
    access_token: string;
}

export interface UpdateUserRequest {
    name?: string;
    password?: string;
    password_confirmation?: string;
}