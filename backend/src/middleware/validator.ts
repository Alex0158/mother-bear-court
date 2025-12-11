import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Errors } from '../utils/errors';

export const validate = (schema: {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    
    // 驗證請求體
    if (schema.body) {
      const { error } = schema.body.validate(req.body, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map(d => d.message));
      }
    }
    
    // 驗證路徑參數
    if (schema.params) {
      const { error } = schema.params.validate(req.params, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map(d => d.message));
      }
    }
    
    // 驗證查詢參數
    if (schema.query) {
      const { error } = schema.query.validate(req.query, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map(d => d.message));
      }
    }
    
    if (errors.length > 0) {
      next(Errors.VALIDATION_ERROR(errors.join('; ')));
      return;
    }
    
    next();
  };
};

