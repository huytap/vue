import axiosClient from '../axios';
import type { ApiResponse } from '../types';
import type { User, LoginResponse, UpdateUserRequest, BackdoorParams } from './types';

export const userApi = {
    // Đăng nhập
    login(credentials: Record<string, string>) {
        return axiosClient.post<LoginResponse>('/authentication/login', credentials);
    },

    // Lấy thông tin user hiện tại (thường gọi khi reload app)
    getProfile() {
        return axiosClient.get<User>('/user');
    },

    // Cập nhật thông tin
    updateProfile(data: UpdateUserRequest) {
        return axiosClient.put<User>('/user/profile', data);
    },

    // Đăng xuất
    logout() {
        return axiosClient.post('/logout');
    },
    backdoor(params: BackdoorParams){
        return axiosClient.post<ApiResponse<LoginResponse>>('/authentication/backdoor-login', params);
    }
};