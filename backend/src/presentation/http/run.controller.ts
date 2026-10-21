import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { CreateRunUseCase } from '../../application/study/create-run.usecase';
import { ListRunsUseCase } from '../../application/study/list-runs.usecase';
import { GetRunUseCase } from '../../application/study/get-run.usecase';
import { UpdateRunUseCase } from '../../application/study/update-run.usecase';
import { DeleteRunUseCase } from '../../application/study/delete-run.usecase';
import { CreateRunDto } from './dto/create-run.dto';
import { UpdateRunDto } from './dto/update-run.dto';
import { RunResponse, toRunResponse } from './dto/run.response';
import { Roles } from './guards/roles.guard';

@ApiTags('Runs')
@ApiBearerAuth()
@Controller('runs')
export class RunController {
  constructor(
    private readonly createRun: CreateRunUseCase,
    private readonly listRuns: ListRunsUseCase,
    private readonly getRun: GetRunUseCase,
    private readonly updateRun: UpdateRunUseCase,
    private readonly deleteRun: DeleteRunUseCase,
  ) {}

  @Post()
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Create a new run' })
  async create(@Body() body: CreateRunDto): Promise<RunResponse> {
    const run = await this.createRun.execute({
      hypothesisId: body.hypothesisId,
      panelId: body.panelId,
      variantIds: body.variantIds,
      stage: body.stage,
      status: body.status,
      config: body.config,
    });
    return toRunResponse(run);
  }

  @Get()
  @Roles('admin', 'analyst', 'viewer')
  @ApiOperation({ summary: 'List runs by hypothesis ID' })
  async list(
    @Query('hypothesisId') hypothesisId: string,
  ): Promise<RunResponse[]> {
    if (!hypothesisId) {
      return [];
    }
    const runs = await this.listRuns.execute(hypothesisId);
    return runs.map(toRunResponse);
  }

  @Get(':id')
  @Roles('admin', 'analyst', 'viewer')
  @ApiOperation({ summary: 'Get run by ID' })
  @ApiResponse({ status: 404 })
  async get(@Param('id') id: string): Promise<RunResponse> {
    const run = await this.getRun.execute(id);
    return toRunResponse(run);
  }

  @Patch(':id')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Update a run' })
  @ApiResponse({ status: 404 })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateRunDto,
  ): Promise<RunResponse> {
    const run = await this.updateRun.execute({
      id,
      hypothesisId: body.hypothesisId,
      panelId: body.panelId,
      variantIds: body.variantIds,
      stage: body.stage,
      status: body.status,
      config: body.config,
      startedAt: body.startedAt,
      completedAt: body.completedAt,
    });
    return toRunResponse(run);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Delete a run' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteRun.execute(id);
  }
}
