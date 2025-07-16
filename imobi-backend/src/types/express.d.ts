import { Request } from 'express';
import multer from 'multer';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
    
    namespace Multer {
      interface File extends multer.File {}
    }
  }
}

export {};