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
import { CreateStudyUseCase } from '../../application/study/create-study.usecase';
import { ListStudiesUseCase } from '../../application/study/list-studies.usecase';
import { GetStudyUseCase } from '../../application/study/get-study.usecase';
import { UpdateStudyUseCase } from '../../application/study/update-study.usecase';
import { DeleteStudyUseCase } from '../../application/study/delete-study.usecase';
import { CreateStudyDto } from './dto/create-study.dto';
import { UpdateStudyDto } from './dto/update-study.dto';
import { StudyResponse, toStudyResponse } from './dto/study.response';
import { Roles } from './guards/roles.guard';
import {
  CurrentUser,
  type AuthUser,
} from './decorators/current-user.decorator';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import type { PaginatedResult } from '../../common/pagination';
import { StudyStatus } from '../../domain/study/study';

@ApiTags('Studies')
@ApiBearerAuth()
@Controller('studies')
export class StudyController {
  constructor(
    private readonly createStudy: CreateStudyUseCase,
    private readonly listStudies: ListStudiesUseCase,
    private readonly getStudy: GetStudyUseCase,
    private readonly updateStudy: UpdateStudyUseCase,
    private readonly deleteStudy: DeleteStudyUseCase,
  ) {}

  @Post()
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Create a new study' })
  async create(
    @Body() body: CreateStudyDto,
    @CurrentUser() user: AuthUser,
  ): Promise<StudyResponse> {
    const study = await this.createStudy.execute({
      workspaceId: user.workspaceId,
      name: body.name,
      objective: body.objective,
      status: body.status as StudyStatus | undefined,
      tags: body.tags,
    });

    return toStudyResponse(study);
  }

  @Get()
  @Roles('admin', 'analyst', 'viewer')
  @ApiOperation({ summary: 'List studies with pagination' })
  async list(
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: AuthUser,
  ): Promise<PaginatedResult<StudyResponse>> {
    const result = await this.listStudies.execute({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      workspaceId: user.workspaceId,
    });
    return {
      ...result,
      data: result.data.map(toStudyResponse),
    };
  }

  @Get(':id')
  @Roles('admin', 'analyst', 'viewer')
  @ApiOperation({ summary: 'Get study by ID' })
  @ApiResponse({ status: 404 })
  async get(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<StudyResponse> {
    const study = await this.getStudy.execute(id, user.workspaceId);
    if (!study) {
      throw new NotFoundException('Study not found');
    }

    return toStudyResponse(study);
  }

  @Patch(':id')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Update a study' })
  @ApiResponse({ status: 404 })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateStudyDto,
  ): Promise<StudyResponse> {
    const study = await this.updateStudy.execute(id, {
      name: body.name,
      objective: body.objective,
      status: body.status as StudyStatus | undefined,
      tags: body.tags,
    });

    if (!study) {
      throw new NotFoundException('Study not found');
    }

    return toStudyResponse(study);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Delete a study' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  async delete(@Param('id') id: string): Promise<void> {
    const deleted = await this.deleteStudy.execute(id);
    if (!deleted) {
      throw new NotFoundException('Study not found');
    }
  }
}
