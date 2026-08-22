import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Response } from 'express';
import { CORRELATION_ID_HEADER } from './correlation.constants';
import { CorrelatedRequest } from './correlation.types';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: CorrelatedRequest, res: Response, next: NextFunction): void {
    const correlationId = req.header(CORRELATION_ID_HEADER) ?? randomUUID();

    req.correlationId = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    next();
  }
}
