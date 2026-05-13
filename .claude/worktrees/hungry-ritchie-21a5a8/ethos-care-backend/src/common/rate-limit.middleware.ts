import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly windowMs = 60_000; // 1 minute
  private readonly maxRequests = 30;   // 30 requests per minute per IP

  use(req: Request, _res: Response, next: NextFunction) {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let entry = this.store.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + this.windowMs };
      this.store.set(key, entry);
    }

    entry.count++;

    if (entry.count > this.maxRequests) {
      throw new HttpException(
        'تم تجاوز الحد المسموح من الطلبات. الرجاء المحاولة لاحقاً.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    next();
  }
}

/**
 * Stricter rate limit for auth endpoints (login).
 * 5 attempts per minute per IP.
 */
@Injectable()
export class AuthRateLimitMiddleware implements NestMiddleware {
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly windowMs = 60_000;
  private readonly maxRequests = 5;

  use(req: Request, _res: Response, next: NextFunction) {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let entry = this.store.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + this.windowMs };
      this.store.set(key, entry);
    }

    entry.count++;

    if (entry.count > this.maxRequests) {
      throw new HttpException(
        'تم تجاوز الحد المسموح من محاولات الدخول. الرجاء المحاولة بعد دقيقة.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    next();
  }
}
