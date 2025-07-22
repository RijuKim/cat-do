declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
    };
    accessToken?: string;
  }
}
