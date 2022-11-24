export interface User {
  id?: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  roles?: string[];
}
export interface Role {
  id?: string;
  name?: string;
}
export interface ResponseObject {
  status?: string;
  message?: string;
  data?: Object;
}
export interface ChangePasswordResquest {
  email: string;
  password: string;
  newPassword: string;
}
