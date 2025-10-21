import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    });
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async set(key: string, value: any, ttl = 60) {
    return this.client.set(key, JSON.stringify(value), 'EX', ttl);
  }
}
