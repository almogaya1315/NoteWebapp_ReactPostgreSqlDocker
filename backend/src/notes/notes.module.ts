// =========== notes-app/backend/src/notes/notes.module.ts ============
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './note.entity';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Note]), UsersModule, AuthModule],
  providers: [NotesService],
  controllers: [NotesController],
})
export class NotesModule {}
