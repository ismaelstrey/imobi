import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { UploadResponse } from '../types/index';
import multer from 'multer';
import express from 'express';

export class ImageProcessor {
  private uploadPath: string;
  private maxWidth: number;
  private maxHeight: number;
  private quality: number;

  constructor() {
    this.uploadPath = process.env.UPLOAD_PATH || './uploads/images';
    this.maxWidth = parseInt(process.env.MAX_IMAGE_WIDTH || '1920');
    this.maxHeight = parseInt(process.env.MAX_IMAGE_HEIGHT || '1080');
    this.quality = parseFloat(process.env.IMAGE_QUALITY || '0.8');
  }

  /**
   * Processa e salva uma imagem
   */
  async processAndSaveImage(file: Express.Multer.File): Promise<UploadResponse> {
    // Gerar nome único para o arquivo
    const fileExtension = path.extname(file.originalname);
    const hash = crypto.randomBytes(16).toString('hex');
    const filename = `${hash}${fileExtension}`;
    const filepath = path.join(this.uploadPath, filename);

    // Criar diretório se não existir
    await fs.mkdir(this.uploadPath, { recursive: true });

    // Processar imagem com Sharp
    const processedImage = await sharp(file.buffer)
      .resize(this.maxWidth, this.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: Math.round(this.quality * 100) })
      .toBuffer();

    // Salvar arquivo processado
    await fs.writeFile(filepath, processedImage);

    // Obter metadados da imagem processada
    const metadata = await sharp(processedImage).metadata();

    return {
      filename,
      url: `/uploads/images/${filename}`,
      size: processedImage.length,
      mimetype: 'image/jpeg',
      dimensions: {
        width: metadata.width || 0,
        height: metadata.height || 0
      }
    };
  }

  /**
   * Gera thumbnail de uma imagem
   */
  async generateThumbnail(imagePath: string, size: number = 300): Promise<string> {
    const filename = path.basename(imagePath, path.extname(imagePath));
    const thumbnailFilename = `${filename}_thumb_${size}.jpg`;
    const thumbnailDir = path.join(this.uploadPath, 'thumbnails');
    const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);

    // Criar diretório de thumbnails se não existir
    await fs.mkdir(thumbnailDir, { recursive: true });

    await sharp(imagePath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return `/uploads/images/thumbnails/${thumbnailFilename}`;
  }

  /**
   * Valida se o arquivo é uma imagem válida
   */
  async validateImage(file: Express.Multer.File): Promise<void> {
    const allowedTypes = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB

    // Verificar tipo
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Tipo de arquivo não permitido');
    }

    // Verificar tamanho
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande');
    }

    // Verificar se é realmente uma imagem
    try {
      const metadata = await sharp(file.buffer).metadata();
      if (!metadata.width || !metadata.height) {
        throw new Error('Arquivo de imagem inválido');
      }
    } catch (error) {
      throw new Error('Arquivo de imagem inválido');
    }
  }

  /**
   * Remove arquivos temporários antigos
   */
  async cleanupTempFiles(): Promise<void> {
    const tempDir = path.join(this.uploadPath, 'temp');
    
    try {
      const files = await fs.readdir(tempDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      // Diretório não existe ou erro de acesso
      console.error('Erro na limpeza de arquivos temporários:', error);
    }
  }
}