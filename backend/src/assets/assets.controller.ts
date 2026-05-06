import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, UseInterceptors, UploadedFiles, Res, StreamableFile } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10, { 
    storage: diskStorage({
      destination: uploadsDir,
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      },
    }),
    limits: { fileSize: 1024 * 1024 * 200 },
  }))
  async upload(@UploadedFiles() files: Express.Multer.File[], @Request() req) {
    const results = [];
    try {
      const body = req.body || {};
      console.log('Upload request - userId:', req.user?.userId, 'files:', files?.length, 'body:', body);
      
      if (!files || files.length === 0) {
        throw new Error('No files uploaded');
      }
      
      for (const file of files) {
        console.log('Processing file:', file.originalname, 'size:', file.size);
        const asset = await this.assetsService.create(
          {
            name: body.name,
            tags: body.tags ? String(body.tags).split(',').map((t: string) => t.trim()) : [],
            category: body.category,
          },
          req.user.userId,
          file,
        );
        results.push(asset);
      }
      return results;
    } catch (error) {
      console.error('Upload error details:', error.message, error.stack);
      throw error;
    }
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('ownerId') ownerId?: number,
    @Query('dateFrom') dateFrom?: Date,
    @Query('dateTo') dateTo?: Date,
  ) {
    return this.assetsService.findAll(req.user.userId, req.user.role, page, limit, {
      search,
      category,
      ownerId,
      dateFrom,
      dateTo,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.assetsService.findOne(+id, req.user.userId, req.user.role);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Request() req, @Body() updateDto: any) {
    return this.assetsService.update(+id, req.user.userId, req.user.role, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.assetsService.remove(+id, req.user.userId, req.user.role);
    return { message: 'Asset deleted successfully' };
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getStorageStats() {
    return this.assetsService.getStorageStats();
  }

  @Get(':id/file')
  async getFile(@Param('id') id: string, @Request() req, @Res({ passthrough: true }) res: Response) {
    const asset = await this.assetsService.findOne(+id, req.user.userId, req.user.role);
    const filePath = path.join(process.cwd(), 'uploads', asset.filePath);
    
    if (!fs.existsSync(filePath)) {
      return { error: 'File not found' };
    }

    const file = fs.createReadStream(filePath);
    res.set({
      'Content-Type': asset.mimeType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(asset.originalName)}"; filename*=UTF-8''${encodeURIComponent(asset.originalName)}`,
    });
    
    return new StreamableFile(file);
  }

  @Get(':id/download')
  async downloadFile(@Param('id') id: string, @Request() req, @Res({ passthrough: true }) res: Response) {
    const asset = await this.assetsService.findOne(+id, req.user.userId, req.user.role);
    const filePath = path.join(process.cwd(), 'uploads', asset.filePath);
    
    if (!fs.existsSync(filePath)) {
      return { error: 'File not found' };
    }

    const file = fs.createReadStream(filePath);
    res.set({
      'Content-Type': asset.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(asset.originalName)}"`,
    });
    
    return new StreamableFile(file);
  }
}
