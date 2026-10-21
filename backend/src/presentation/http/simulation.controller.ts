import {
  Body,
  Controller,
  Header,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { RunSimulationUseCase } from '../../application/simulation/run-simulation.usecase';
import { ListSimulationsUseCase } from '../../application/simulation/list-simulations.usecase';
import { GetSimulationUseCase } from '../../application/simulation/get-simulation.usecase';
import { RunSimulationDto } from './dto/run-simulation.dto';
import {
  SimulationResponse,
  toSimulationResponse,
} from './dto/simulation.response';
import { Roles } from './guards/roles.guard';
import {
  CurrentUser,
  type AuthUser,
} from './decorators/current-user.decorator';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import type { PaginatedResult } from '../../common/pagination';
import {
  buildSimulationCsv,
  buildSimulationPdf,
  createSimulationReportMetadata,
  type SimulationReportMetadata,
} from './simulation-report.builder';

@ApiTags('Simulations')
@ApiBearerAuth()
@Controller('simulations')
export class SimulationController {
  constructor(
    private readonly runSimulation: RunSimulationUseCase,
    private readonly listSimulations: ListSimulationsUseCase,
    private readonly getSimulation: GetSimulationUseCase,
  ) {}

  @Post()
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Run a new AI simulation' })
  @ApiResponse({ status: 201 })
  async create(
    @Body() body: RunSimulationDto,
    @CurrentUser() user: AuthUser,
  ): Promise<SimulationResponse> {
    const simulation = await this.runSimulation.execute({
      workspaceId: user.workspaceId,
      hypothesis: body.hypothesis,
      hypothesisId: body.hypothesisId,
      personaIds: body.personaIds,
      maxIterations: body.maxIterations,
    });

    return toSimulationResponse(simulation);
  }

  @Get()
  @Roles('admin', 'analyst', 'viewer')
  @ApiOperation({ summary: 'List simulations with pagination' })
  async list(
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: AuthUser,
  ): Promise<PaginatedResult<SimulationResponse>> {
    const result = await this.listSimulations.execute({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      workspaceId: user.workspaceId,
    });
    return {
      ...result,
      data: result.data.map(toSimulationResponse),
    };
  }

  @Get(':id/export/csv')
  @Roles('admin', 'analyst', 'viewer')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @ApiOperation({ summary: 'Export simulation results as CSV' })
  @ApiResponse({ status: 404 })
  async exportCsv(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: AuthUser,
  ): Promise<StreamableFile> {
    const simulation = await this.getSimulation.execute(id, user.workspaceId);
    if (!simulation) {
      throw new NotFoundException('Simulation not found');
    }

    const metadata = createSimulationReportMetadata(simulation);
    this.attachReportHeaders(response, metadata);

    response.setHeader(
      'Content-Disposition',
      `attachment; filename="simulation-${id}.csv"`,
    );

    return new StreamableFile(
      Buffer.from(buildSimulationCsv(simulation, metadata)),
      {
        type: 'text/csv',
      },
    );
  }

  @Get(':id/report/pdf')
  @Roles('admin', 'analyst', 'viewer')
  @Header('Content-Type', 'application/pdf')
  @ApiOperation({ summary: 'Export simulation report as PDF' })
  @ApiResponse({ status: 404 })
  async exportPdf(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: AuthUser,
  ): Promise<StreamableFile> {
    const simulation = await this.getSimulation.execute(id, user.workspaceId);
    if (!simulation) {
      throw new NotFoundException('Simulation not found');
    }

    const metadata = createSimulationReportMetadata(simulation);
    this.attachReportHeaders(response, metadata);

    response.setHeader(
      'Content-Disposition',
      `attachment; filename="simulation-${id}-report.pdf"`,
    );

    const pdfBuffer = await buildSimulationPdf(simulation, metadata);
    return new StreamableFile(pdfBuffer, {
      type: 'application/pdf',
    });
  }

  @Get(':id/report/metadata')
  @Roles('admin', 'analyst', 'viewer')
  @ApiOperation({ summary: 'Get simulation report metadata' })
  @ApiResponse({ status: 404 })
  async reportMetadata(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<SimulationReportMetadata> {
    const simulation = await this.getSimulation.execute(id, user.workspaceId);
    if (!simulation) {
      throw new NotFoundException('Simulation not found');
    }

    return createSimulationReportMetadata(simulation);
  }

  @Get(':id')
  @Roles('admin', 'analyst', 'viewer')
  @ApiOperation({ summary: 'Get simulation by ID' })
  @ApiResponse({ status: 404 })
  async get(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<SimulationResponse> {
    const simulation = await this.getSimulation.execute(id, user.workspaceId);
    if (!simulation) {
      throw new NotFoundException('Simulation not found');
    }

    return toSimulationResponse(simulation);
  }

  private attachReportHeaders(
    response: Response,
    metadata: SimulationReportMetadata,
  ): void {
    response.setHeader('X-Report-Id', metadata.reportId);
    response.setHeader('X-Report-Schema-Version', metadata.schemaVersion);
    response.setHeader('X-Report-Template-Version', metadata.templateVersion);
    response.setHeader('X-Report-Generated-At', metadata.generatedAt);
    response.setHeader(
      'X-Report-Snapshot-Hash',
      metadata.simulationSnapshotHash,
    );
  }
}
