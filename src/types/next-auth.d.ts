import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'mentor' | 'donor' | 'admin';
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: 'mentor' | 'donor' | 'admin';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'mentor' | 'donor' | 'admin';
  }
}
