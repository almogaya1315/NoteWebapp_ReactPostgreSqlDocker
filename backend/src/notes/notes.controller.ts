// =========== notes-app/backend/src/notes/notes.controller.ts ============
import { Controller, Post, Body, UseGuards, Req, Get, Query, Param, Put, Delete } from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtGuard } from '../common/auth.guard';

@Controller('notes')
export class NotesController {
  constructor(private notes: NotesService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.notes.create(req.user.sub, body);
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.notes.update(req.user.sub, id, body);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.notes.remove(req.user.sub, id);
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll(@Req() req: any, @Query('tags') tags?: string) {
    return this.notes.findAll(req.user.sub, tags);
  }
}
