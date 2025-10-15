export const BASE_URL = "http://127.0.0.1:8000";

export const API_PATH = {
    AUTH:{
        LOGIN:"/api/auth/login/",
        INFO:'/api/auth/info/'
    },
    TASK:{
        DASHBOARD:'/api/dashboard/',
        ALL:'/api/tasks/',
        DETAIL:(id) => `/api/tasks/${id}/`,
        CREATE:'/api/tasks/create/',
        PDF:'/api/tasks/generate-pdf/'
    }
}