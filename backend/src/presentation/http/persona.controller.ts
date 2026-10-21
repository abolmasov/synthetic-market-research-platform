import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  CurrentUser,
  type AuthUser,
} from './decorators/current-user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreatePersonaUseCase } from '../../application/persona/create-persona.usecase';
import { ListPersonasUseCase } from '../../application/persona/list-personas.usecase';
import { GetPersonaUseCase } from '../../application/persona/get-persona.usecase';
import { UpdatePersonaUseCase } from '../../application/persona/update-persona.usecase';
import { DeletePersonaUseCase } from '../../application/persona/delete-persona.usecase';
import { BulkImportPersonasUseCase } from '../../application/persona/bulk-import-personas.usecase';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { PersonaResponse, toPersonaResponse } from './dto/persona.response';
import { Roles } from './guards/roles.guard';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import type { PaginatedResult } from '../../common/pagination';

@ApiTags('Personas')
@ApiBearerAuth()
@Controller('personas')
export class PersonaController {
  constructor(
    private readonly createPersona: CreatePersonaUseCase,
    private readonly listPersonas: ListPersonasUseCase,
    private readonly getPersona: GetPersonaUseCase,
    private readonly updatePersona: UpdatePersonaUseCase,
    private readonly deletePersona: DeletePersonaUseCase,
    private readonly bulkImportPersonas: BulkImportPersonasUseCase,
  ) {}

  @Post()
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Create a new persona with psychological profile' })
  @ApiResponse({ status: 201, description: 'Persona created' })
  async create(
    @Body() body: CreatePersonaDto,
    @CurrentUser() user: AuthUser,
  ): Promise<PersonaResponse> {
    const persona = await this.createPersona.execute({
      workspaceId: user.workspaceId,
      name: body.name,
      segment: body.segment,
      segmentId: body.segmentId,
      motivations: body.motivations,
      barriers: body.barriers,
      trustChannel: body.trustChannel,
      purchaseTriggers: body.purchaseTriggers,
      budgetRange: body.budgetRange,
      contextNotes: body.contextNotes,
      age: body.age,
      location: body.location,
      income: body.income,
      // Extended fields
      gender: body.gender,
      occupation: body.occupation,
      personality: body.personality,
      healthProfile: body.healthProfile,
      cognitiveProfile: body.cognitiveProfile,
      decisionStyle: body.decisionStyle,
    });

    return toPersonaResponse(persona);
  }

  @Get()
  @Roles('admin', 'analyst', 'viewer')
  @ApiOperation({ summary: 'List personas with pagination' })
  async list(
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: AuthUser,
  ): Promise<PaginatedResult<PersonaResponse>> {
    const result = await this.listPersonas.execute({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      workspaceId: user.workspaceId,
    });
    return {
      ...result,
      data: result.data.map(toPersonaResponse),
    };
  }

  @Get(':id')
  @Roles('admin', 'analyst', 'viewer')
  @ApiOperation({ summary: 'Get persona by ID' })
  @ApiResponse({ status: 404, description: 'Persona not found' })
  async get(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<PersonaResponse> {
    const persona = await this.getPersona.execute(id, user.workspaceId);
    if (!persona) {
      throw new NotFoundException('Persona not found');
    }

    return toPersonaResponse(persona);
  }

  @Patch(':id')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Update an existing persona' })
  @ApiResponse({ status: 404, description: 'Persona not found' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdatePersonaDto,
  ): Promise<PersonaResponse> {
    const persona = await this.updatePersona.execute(id, {
      name: body.name,
      segment: body.segment,
      segmentId: body.segmentId,
      motivations: body.motivations,
      barriers: body.barriers,
      trustChannel: body.trustChannel,
      purchaseTriggers: body.purchaseTriggers,
      budgetRange: body.budgetRange,
      contextNotes: body.contextNotes,
      age: body.age,
      location: body.location,
      income: body.income,
      // Extended fields
      gender: body.gender,
      occupation: body.occupation,
      personality: body.personality,
      healthProfile: body.healthProfile,
      cognitiveProfile: body.cognitiveProfile,
      decisionStyle: body.decisionStyle,
    });

    if (!persona) {
      throw new NotFoundException('Persona not found');
    }

    return toPersonaResponse(persona);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Delete a persona' })
  @ApiResponse({ status: 204, description: 'Persona deleted' })
  @ApiResponse({ status: 404, description: 'Persona not found' })
  async delete(@Param('id') id: string): Promise<void> {
    const deleted = await this.deletePersona.execute(id);
    if (!deleted) {
      throw new NotFoundException('Persona not found');
    }
  }

  @Post('bulk-import')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Bulk import personas from CSV content' })
  async bulkImport(@Body('csvContent') csvContent: string) {
    const result = await this.bulkImportPersonas.execute({ csvContent });
    return {
      success: result.success,
      failed: result.failed,
      errors: result.errors,
      personas: result.personas.map(toPersonaResponse),
    };
  }

  @Get('template/csv')
  @Roles('admin', 'analyst', 'viewer')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="persona-template.csv"')
  @ApiOperation({ summary: 'Download CSV template for persona bulk import' })
  getTemplate(): string {
    const headers = [
      // Required fields
      'name',
      'segment',
      'segment_id',
      'motivations',
      'barriers',
      'trust_channel',
      'purchase_triggers',
      'budget_range',
      // Optional basic fields
      'context_notes',
      'age',
      'location',
      'income',
      'gender',
      'occupation',
      // Personality (OCEAN)
      'personality_openness',
      'personality_conscientiousness',
      'personality_extraversion',
      'personality_agreeableness',
      'personality_neuroticism',
      // Health profile
      'health_insomnia_severity',
      'health_anxiety_level',
      'health_chronic_pain',
      'health_current_supplements',
      // Cognitive biases
      'cognitive_loss_aversion',
      'cognitive_authority_bias',
      'cognitive_social_proof',
      'cognitive_status_quo_bias',
      'cognitive_anchoring',
      'cognitive_confirmation_bias',
      // Decision style
      'decision_system1_weight',
      'decision_price_anchor',
      'decision_risk_tolerance',
    ];

    const example = [
      'Olena Kovalenko',
      'Urban Tech Workers',
      '', // segment_id (optional, use UUID if linking to a segment)
      'quality products|work efficiency|health optimization',
      'currency volatility|shipping costs|trust in new brands',
      'Ukrainian tech communities',
      'local payment options|UAH pricing|delivery guarantees',
      '500-1500 UAH/month',
      'Tech professional in Kyiv',
      '32',
      'Kyiv, Ukraine',
      '800',
      'female',
      'Software Developer',
      '75',
      '85',
      '60',
      '55',
      '45',
      '6',
      '5',
      '1',
      'multivitamin|vitamin D',
      '0.4',
      '0.7',
      '0.6',
      '0.3',
      '0.5',
      '0.4',
      '0.3',
      '75',
      '0.6',
    ];

    return headers.join(',') + '\n' + example.join(',');
  }
}
