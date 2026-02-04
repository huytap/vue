export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    merchant_id?: number;
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