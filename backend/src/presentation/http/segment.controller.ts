import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateSegmentUseCase } from '../../application/segment/create-segment.usecase';
import { ListSegmentsUseCase } from '../../application/segment/list-segments.usecase';
import { GetSegmentUseCase } from '../../application/segment/get-segment.usecase';
import { UpdateSegmentUseCase } from '../../application/segment/update-segment.usecase';
import { DeleteSegmentUseCase } from '../../application/segment/delete-segment.usecase';
import { GeneratePersonasFromSegmentUseCase } from '../../application/segment/generate-personas-from-segment.usecase';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';
import { GeneratePersonasDto } from './dto/generate-personas.dto';
import { SegmentResponse, toSegmentResponse } from './dto/segment.response';
import { toPersonaResponse } from './dto/persona.response';
import { Roles } from './guards/roles.guard';
import {
  CurrentUser,
  type AuthUser,
} from './decorators/current-user.decorator';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import type { PaginatedResult } from '../../common/pagination';

@ApiTags('Segments')
@ApiBearerAuth()
@Controller('segments')
export class SegmentController {
  constructor(
    private readonly createSegment: CreateSegmentUseCase,
    private readonly listSegments: ListSegmentsUseCase,
    private readonly getSegment: GetSegmentUseCase,
    private readonly updateSegment: UpdateSegmentUseCase,
    private readonly deleteSegment: DeleteSegmentUseCase,
    private readonly generatePersonas: GeneratePersonasFromSegmentUseCase,
  ) {}

  @Post()
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Create a new market segment' })
  async create(
    @Body() body: CreateSegmentDto,
    @CurrentUser() user: AuthUser,
  ): Promise<SegmentResponse> {
    const segment = await this.createSegment.execute({
      workspaceId: user.workspaceId,
      name: body.name,
      description: body.description,
      demographicCriteria: body.demographicCriteria,
      psychographicTraits: body.psychographicTraits,
      behavioralPatterns: body.behavioralPatterns,
    });

    return toSegmentResponse(segment);
  }

  @Get()
  @Roles('admin', 'analyst', 'viewer')
  @ApiOperation({ summary: 'List segments with pagination' })
  async list(
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: AuthUser,
  ): Promise<PaginatedResult<SegmentResponse>> {
    const result = await this.listSegments.execute({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      workspaceId: user.workspaceId,
    });
    return {
      ...result,
      data: result.data.map(toSegmentResponse),
    };
  }

  @Get(':id')
  @Roles('admin', 'analyst', 'viewer')
  @ApiOperation({ summary: 'Get segment by ID' })
  @ApiResponse({ status: 404 })
  async get(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<SegmentResponse> {
    const segment = await this.getSegment.execute(id, user.workspaceId);
    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    return toSegmentResponse(segment);
  }

  @Patch(':id')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Update a segment' })
  @ApiResponse({ status: 404 })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateSegmentDto,
  ): Promise<SegmentResponse> {
    const segment = await this.updateSegment.execute(id, {
      name: body.name,
      description: body.description,
      demographicCriteria: body.demographicCriteria,
      psychographicTraits: body.psychographicTraits,
      behavioralPatterns: body.behavioralPatterns,
    });

    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    return toSegmentResponse(segment);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Delete a segment' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  async delete(@Param('id') id: string): Promise<void> {
    const deleted = await this.deleteSegment.execute(id);
    if (!deleted) {
      throw new NotFoundException('Segment not found');
    }
  }

  @Post(':id/generate-personas')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Generate AI personas from segment definition' })
  async generatePersonasFromSegment(
    @Param('id') id: string,
    @Body() body: GeneratePersonasDto,
  ) {
    const result = await this.generatePersonas.execute({
      segmentId: id,
      count: body.count,
      diversityLevel: body.diversityLevel,
    });

    return {
      segmentId: result.segmentId,
      segmentName: result.segmentName,
      generatedCount: result.generatedCount,
      personas: result.personas.map(toPersonaResponse),
    };
  }
}
