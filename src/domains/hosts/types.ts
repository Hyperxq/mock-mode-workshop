export type Host = {
  id: number;
  name: string;
  username: string;
  email: string;
  /**
   * Present ONLY in mocked data. The real JSONPlaceholder /users
   * response never has this field — use it to prove the swap.
   */
  isSuperhost?: boolean;
  /** Present ONLY in mocked data (Picsum URL). */
  avatarUrl?: string;
};
