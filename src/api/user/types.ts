export interface User {
    id: number;
    fullName:string,
    userName: string;
    role: string;
    userTypeId:number,
    userTypeName:string
}

export interface LoginResponse {
    user: User;
    accessToken: string;    
    refreshToken: string;
}

export interface UpdateUserRequest {
    name?: string;
    password?: string;
    password_confirmation?: string;
}
export interface BackdoorParams {
    t: string; // Token là string
    u: number; // UserId là number
}