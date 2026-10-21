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
import { CreateHypothesisUseCase } from '../../application/hypothesis/create-hypothesis.usecase';
import { ListHypothesesUseCase } from '../../application/hypothesis/list-hypotheses.usecase';
import { GetHypothesisUseCase } from '../../application/hypothesis/get-hypothesis.usecase';
import { UpdateHypothesisUseCase } from '../../application/hypothesis/update-hypothesis.usecase';
import { DeleteHypothesisUseCase } from '../../application/hypothesis/delete-hypothesis.usecase';
import { CreateHypothesisDto } from './dto/create-hypothesis.dto';
import { UpdateHypothesisDto } from './dto/update-hypothesis.dto';
import {
  HypothesisResponse,
  toHypothesisResponse,
} from './dto/hypothesis.response';
import { Roles } from './guards/roles.guard';
import {
  CurrentUser,
  type AuthUser,
} from './decorators/current-user.decorator';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import type { PaginatedResult } from '../../common/pagination';
import type {
  HypothesisGuardrail,
  HypothesisMetric,
  VerificationDecisionOutcome,
  VerificationDirection,
} from '../../domain/hypothesis/hypothesis';

@ApiTags('Hypotheses')
@ApiBearerAuth()
@Controller('hypotheses')
export class HypothesisController {
  constructor(
    private readonly createHypothesis: CreateHypothesisUseCase,
    private readonly listHypotheses: ListHypothesesUseCase,
    private readonly getHypothesis: GetHypothesisUseCase,
    private readonly updateHypothesis: UpdateHypothesisUseCase,
    private readonly deleteHypothesis: DeleteHypothesisUseCase,
  ) {}

  @Post()
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Create a new hypothesis' })
  async create(
    @Body() body: CreateHypothesisDto,
    @CurrentUser() user: AuthUser,
  ): Promise<HypothesisResponse> {
    const hypothesis = await this.createHypothesis.execute({
      workspaceId: user.workspaceId,
      studyId: body.studyId ?? null,
      stage: body.stage as 'H1' | 'H2' | 'H3' | undefined,
      title: body.title,
      statement: body.statement,
      status: body.status as
        | 'draft'
        | 'ready'
        | 'running'
        | 'completed'
        | 'canceled'
        | 'active'
        | 'archived'
        | undefined,
      successCriteria: body.successCriteria,
      protocolId: body.protocolId,
      primaryMetric: body.primaryMetric as HypothesisMetric | undefined,
      primaryMetricDirection: body.primaryMetricDirection as
        VerificationDirection | undefined,
      primaryMetricThreshold: body.primaryMetricThreshold,
      guardrails: body.guardrails as HypothesisGuardrail[] | undefined,
      falsificationRule: body.falsificationRule,
      sampleSize: body.sampleSize,
      testDurationDays: body.testDurationDays,
      decisionOutcome: body.decisionOutcome as
        VerificationDecisionOutcome | undefined,
      decisionReason: body.decisionReason,
      notes: body.notes,
    });

    return toHypothesisResponse(hypothesis);
  }

  @Get()
  @Roles('admin', 'analyst', 'viewer')
  @ApiOperation({ summary: 'List hypotheses with pagination' })
  async list(
    @CurrentUser() user: AuthUser,
    @Query('studyId') studyId?: string,
    @Query() query?: PaginationQueryDto,
  ): Promise<PaginatedResult<HypothesisResponse>> {
    const result = await this.listHypotheses.execute(studyId, {
      page: query?.page ?? 1,
      limit: query?.limit ?? 20,
      workspaceId: user.workspaceId,
    });
    return {
      ...result,
      data: result.data.map(toHypothesisResponse),
    };
  }

  @Get(':id')
  @Roles('admin', 'analyst', 'viewer')
  @ApiOperation({ summary: 'Get hypothesis by ID' })
  @ApiResponse({ status: 404 })
  async get(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<HypothesisResponse> {
    const hypothesis = await this.getHypothesis.execute(id, user.workspaceId);
    if (!hypothesis) {
      throw new NotFoundException('Hypothesis not found');
    }

    return toHypothesisResponse(hypothesis);
  }

  @Patch(':id')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Update a hypothesis' })
  @ApiResponse({ status: 404 })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateHypothesisDto,
  ): Promise<HypothesisResponse> {
    const hypothesis = await this.updateHypothesis.execute(id, {
      studyId: body.studyId ?? null,
      stage: body.stage as 'H1' | 'H2' | 'H3' | undefined,
      title: body.title,
      statement: body.statement,
      status: body.status as
        | 'draft'
        | 'ready'
        | 'running'
        | 'completed'
        | 'canceled'
        | 'active'
        | 'archived'
        | undefined,
      successCriteria: body.successCriteria,
      protocolId: body.protocolId,
      primaryMetric: body.primaryMetric as HypothesisMetric | undefined,
      primaryMetricDirection: body.primaryMetricDirection as
        VerificationDirection | undefined,
      primaryMetricThreshold: body.primaryMetricThreshold,
      guardrails: body.guardrails as HypothesisGuardrail[] | undefined,
      falsificationRule: body.falsificationRule,
      sampleSize: body.sampleSize,
      testDurationDays: body.testDurationDays,
      decisionOutcome: body.decisionOutcome as
        VerificationDecisionOutcome | undefined,
      decisionReason: body.decisionReason,
      notes: body.notes,
    });

    if (!hypothesis) {
      throw new NotFoundException('Hypothesis not found');
    }

    return toHypothesisResponse(hypothesis);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Delete a hypothesis' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  async delete(@Param('id') id: string): Promise<void> {
    const deleted = await this.deleteHypothesis.execute(id);
    if (!deleted) {
      throw new NotFoundException('Hypothesis not found');
    }
  }
}
