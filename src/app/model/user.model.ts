export interface User {
  id?: string;
  name?: string;
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
