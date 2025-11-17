import { apiURL } from './utils';

const withAPI = (url: string) => `${apiURL}/v1/${url}`;
const withAdmin = (url: string) => `${apiURL}/admin/v1/${url}`;

export const API_AUTH_URL = withAPI('auth/login');
export const API_LOGIN_URL = withAPI('auth/confirm-login');
export const API_LOGOUT_URL = withAPI('auth/logout');
export const API_REFRESH_URL = withAPI('auth/refresh');
export const API_CHECK_ADMIN_URL = withAdmin('admins/privileges');
