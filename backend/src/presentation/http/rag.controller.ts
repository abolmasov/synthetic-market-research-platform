import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Optional,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueryRagUseCase } from '../../application/rag/query-rag.usecase';
import {
  DocumentIngestionService,
  type RagDocumentSummary,
} from '../../infrastructure/rag/document-ingestion.service';
import { RagQueryDto } from './dto/rag-query.dto';
import { IngestFileDto } from './dto/ingest-file.dto';
import { IngestTextDto } from './dto/ingest-text.dto';
import { RagQueryResponse } from './dto/rag.response';
import { Roles } from './guards/roles.guard';

type UploadedRagFile = {
  originalname: string;
  buffer: Buffer;
};

@ApiTags('RAG')
@ApiBearerAuth()
@Controller('rag')
export class RagController {
  constructor(
    private readonly queryRag: QueryRagUseCase,
    @Optional()
    @Inject(DocumentIngestionService)
    private readonly ingestionService?: DocumentIngestionService,
  ) {}

  @Post('query')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Query RAG knowledge base for hypothesis context' })
  async query(@Body() body: RagQueryDto): Promise<RagQueryResponse> {
    const sources = await this.queryRag.execute({
      hypothesis: body.hypothesis,
    });

    return {
      hypothesis: body.hypothesis,
      sources,
    };
  }

  @Post('ingest/text')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Ingest text document into RAG' })
  async ingestText(
    @Body() body: IngestTextDto,
  ): Promise<{ chunksCreated: number }> {
    const ingestionService = this.getIngestionService();

    const chunksCreated = await ingestionService.ingestText(body.text, {
      title: body.title,
      sourceType: body.sourceType,
      url: body.url,
      industry: body.industry,
    });

    return { chunksCreated };
  }

  @Post('ingest/file')
  @Roles('admin', 'analyst')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Ingest file into RAG (PDF, TXT, MD, CSV, JSON)' })
  async ingestFile(
    @UploadedFile() file: UploadedRagFile | undefined,
    @Body() body: IngestFileDto,
  ): Promise<{ chunksCreated: number; fileName: string }> {
    const ingestionService = this.getIngestionService();

    if (!file) {
      throw new BadRequestException('No file uploaded. Use field name "file".');
    }

    let chunksCreated = 0;
    try {
      chunksCreated = await ingestionService.ingestBuffer(
        file.originalname,
        file.buffer,
        {
          title: body.title?.trim() || file.originalname,
          sourceType: body.sourceType,
          url: body.url,
          industry: body.industry,
        },
      );
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to ingest file.',
      );
    }

    return {
      chunksCreated,
      fileName: file.originalname,
    };
  }

  @Get('stats')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Get RAG document statistics' })
  async stats(): Promise<{
    totalChunks: number;
    bySourceType: Record<string, number>;
    byIndustry: Record<string, number>;
  }> {
    if (!this.ingestionService) {
      return { totalChunks: 0, bySourceType: {}, byIndustry: {} };
    }
    return this.ingestionService.getStats();
  }

  @Get('documents')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'List uploaded RAG documents' })
  async documents(): Promise<RagDocumentSummary[]> {
    if (!this.ingestionService) {
      return [];
    }

    return this.ingestionService.getDocuments();
  }

  @Delete('documents/:documentKey')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Delete one uploaded RAG document' })
  async deleteDocument(
    @Param('documentKey') documentKey: string,
  ): Promise<{ deletedChunks: number }> {
    if (!this.ingestionService) {
      return { deletedChunks: 0 };
    }

    const deletedChunks =
      await this.ingestionService.deleteDocument(documentKey);
    return { deletedChunks };
  }

  @Delete('documents')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete all RAG documents' })
  async deleteAll(): Promise<{ deletedChunks: number }> {
    if (!this.ingestionService) {
      return { deletedChunks: 0 };
    }
    const deletedChunks = await this.ingestionService.deleteAll();
    return { deletedChunks };
  }

  private getIngestionService(): DocumentIngestionService {
    if (!this.ingestionService) {
      throw new BadRequestException(
        'RAG ingestion is unavailable. Set RAG_PROVIDER=pgvector and DB_ENABLED=true.',
      );
    }

    return this.ingestionService;
  }
}
