export const BASE_URL = "http://127.0.0.1:8000";

export const API_PATH = {
    AUTH:{
        LOGIN:"/api/auth/login/",
        INFO:'/api/auth/info/'
    },
    USER:{
        ALL:'/api/auth/users/',
        UPDATE:(id)=>`/api/auth/users/${id}/update/`,
        DELETE:(id)=>`/api/auth/users/${id}/delete/`,
        CREATE:'/api/auth/users/create/'
    },
    TASK:{
        DASHBOARD:'/api/dashboard/',
        ALL:'/api/tasks/',
        DETAIL:(id) => `/api/tasks/${id}/`,
        CREATE:'/api/tasks/create/',
        PDF:'/api/tasks/generate-pdf/',
        HISTORY:'/api/tasks/history/'
    }
}