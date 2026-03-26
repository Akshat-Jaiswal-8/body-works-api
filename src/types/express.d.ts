import 'express';

declare module 'express' {
  interface AuthenticatedRequest extends Request {
    userId: string;
  }
}
