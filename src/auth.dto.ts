/**
 * Cognito tokens for the frontend's server, which keeps them in http-only
 * cookies. Response of `POST /auth/token` and `POST /auth/refresh`.
 */
export interface AuthTokensDto {
  accessToken: string;
  /**
   * Present after the code exchange; after a refresh only when the user
   * pool rotates refresh tokens. Otherwise keep the one already held.
   */
  refreshToken: string | null;
  /** Lifetime of `accessToken` in seconds. */
  expiresIn: number;
}

/** The signed-in user. */
export interface AuthUserDto {
  /** Cognito user id, stable for the account. */
  sub: string;
  email: string | null;
  name: string | null;
}

/** Response of `GET /auth/check` for a valid access token (otherwise 401). */
export interface AuthCheckDto {
  user: AuthUserDto;
  /** When the access token expires, ISO 8601. */
  expiresAt: string;
}
