// =========== notes-app/backend/src/notes/notes.service.ts ============
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { Counter, Histogram } from 'prom-client';

const CACHE_TTL = 30; // seconds

// Prometheus metrics
const cacheHits = new Counter({ name: 'cache_hits_total', help: 'Cache hits' });
const cacheMisses = new Counter({ name: 'cache_misses_total', help: 'Cache misses' });
const requestDur = new Histogram({ name: 'request_duration_seconds', help: 'Request duration in seconds' });

@Injectable()
export class NotesService {
  private redis: Redis;

  constructor(@InjectRepository(Note) private repo: Repository<Note>) {
    // ✅ Safe Redis initialization with fallback to localhost
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        retryStrategy: (times) => Math.min(times * 50, 2000), // reconnect attempts
      });

      this.redis.on('connect', () => console.log('✅ Redis connected'));
      this.redis.on('error', (err) =>
        console.warn('⚠️ Redis connection error:', err.message),
      );
    } catch (err) {
      console.warn('⚠️ Redis not initialized:', err.message);
    }
  }

  // 🔹 Utility: Generate cache key per user and tags
  private cacheKey(userId: string, tags?: string) {
    return `user:${userId}:tags:${tags || ''}`;
  }

  // 🔹 Create Note
  async create(userId: string, dto: any) {
    const t0 = requestDur.startTimer();
    const note = this.repo.create({
      title: dto.title,
      content: dto.content,
      tags: (dto.tags || []).join(','),
      user: { id: userId } as any,
    });
    const saved = await this.repo.save(note);

    if (this.redis) await this.redis.del(this.cacheKey(userId)); // invalidate cache
    t0();
    return saved;
  }

  // 🔹 Update Note
  async update(userId: string, id: string, dto: any) {
    const t0 = requestDur.startTimer();
    const note = await this.repo.findOne({
      where: { id: Number(id) },
      relations: ['user'],
    });

    if (!note || (note.user as any).id !== userId) throw new Error('Not found');

    note.title = dto.title ?? note.title;
    note.content = dto.content ?? note.content;
    note.tags = dto.tags || note.tags || [];

    const saved = await this.repo.save(note);
    if (this.redis) await this.redis.del(this.cacheKey(userId));
    t0();
    return saved;
  }

  // 🔹 Delete Note
  async remove(userId: string, id: string) {
    const t0 = requestDur.startTimer();
    const note = await this.repo.findOne({
      where: { id: Number(id) },
      relations: ['user'],
    });

    if (!note || (note.user as any).id !== userId) throw new Error('Not found');

    await this.repo.remove(note);
    if (this.redis) await this.redis.del(this.cacheKey(userId));
    t0();
    return { success: true };
  }

  // 🔹 Find All Notes (with caching)
  async findAll(userId: string, tags?: string) {
    const t0 = requestDur.startTimer();
    const key = this.cacheKey(userId, tags || '');

    try {
      if (this.redis) {
        const cached = await this.redis.get(key);
        if (cached) {
          cacheHits.inc();
          t0();
          return JSON.parse(cached);
        }
      }
    } catch (err) {
      console.warn('⚠️ Redis read failed:', err.message);
    }

    cacheMisses.inc();

    const qb = this.repo
      .createQueryBuilder('note')
      .where('note.userId = :userId', { userId });

    if (tags) {
      const tagArr = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      tagArr.forEach((t, idx) => {
        qb.andWhere(`note.tags LIKE :t${idx}`, { [`t${idx}`]: `%${t}%` });
      });
    }

    const rows = await qb.getMany();

    try {
      if (this.redis)
        await this.redis.setex(key, CACHE_TTL, JSON.stringify(rows));
    } catch (err) {
      console.warn('⚠️ Redis write failed:', err.message);
    }

    t0();
    return rows;
  }
}
