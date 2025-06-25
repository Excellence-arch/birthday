import { Request } from 'express';
import { UploadedFile } from 'express-fileupload';

export interface RequestWithFile extends Request {
  files?: {
    csv?: UploadedFile | UploadedFile[]
  };
}
