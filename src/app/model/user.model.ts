export interface User {
  id?: string;
  name?: string;
  email?: string;
  role?: string[];
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
