export interface UserInfo {
  sub: string; // subject (user id)
  email: string;
  fullName?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  authorities?: string[];
  iat?: number; // issued at
  exp?: number; // expiration
}
