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
import { CreateVariantUseCase } from '../../application/variant/create-variant.usecase';
import { ListVariantsUseCase } from '../../application/variant/list-variants.usecase';
import { GetVariantUseCase } from '../../application/variant/get-variant.usecase';
import { UpdateVariantUseCase } from '../../application/variant/update-variant.usecase';
import { DeleteVariantUseCase } from '../../application/variant/delete-variant.usecase';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { VariantResponse, toVariantResponse } from './dto/variant.response';
import { Roles } from './guards/roles.guard';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import type { PaginatedResult } from '../../common/pagination';

@ApiTags('Variants')
@ApiBearerAuth()
@Controller('hypotheses/:hypothesisId/variants')
export class VariantController {
  constructor(
    private readonly createVariant: CreateVariantUseCase,
    private readonly listVariants: ListVariantsUseCase,
    private readonly getVariant: GetVariantUseCase,
    private readonly updateVariant: UpdateVariantUseCase,
    private readonly deleteVariant: DeleteVariantUseCase,
  ) {}

  @Post()
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Create a variant for a hypothesis' })
  async create(
    @Param('hypothesisId') hypothesisId: string,
    @Body() body: CreateVariantDto,
  ): Promise<VariantResponse> {
    const variant = await this.createVariant.execute({
      hypothesisId,
      name: body.name,
      changeSummary: body.changeSummary,
      content: body.content,
      status: body.status as
        'draft' | 'shortlisted' | 'rejected' | 'tested' | undefined,
      expectedUplift: body.expectedUplift,
      successMetric: body.successMetric,
      risk: body.risk,
      notes: body.notes,
    });

    if (!variant) {
      throw new NotFoundException('Hypothesis not found');
    }

    return toVariantResponse(variant);
  }

  @Get()
  @Roles('admin', 'analyst', 'viewer')
  @ApiOperation({ summary: 'List variants for a hypothesis with pagination' })
  async list(
    @Param('hypothesisId') hypothesisId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResult<VariantResponse>> {
    const result = await this.listVariants.execute(hypothesisId, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
    if (!result) {
      throw new NotFoundException('Hypothesis not found');
    }

    return {
      ...result,
      data: result.data.map(toVariantResponse),
    };
  }

  @Get(':id')
  @Roles('admin', 'analyst', 'viewer')
  @ApiOperation({ summary: 'Get variant by ID' })
  @ApiResponse({ status: 404 })
  async get(
    @Param('hypothesisId') hypothesisId: string,
    @Param('id') id: string,
  ): Promise<VariantResponse> {
    const variant = await this.getVariant.execute(id);
    if (!variant || variant.hypothesisId !== hypothesisId) {
      throw new NotFoundException('Variant not found');
    }

    return toVariantResponse(variant);
  }

  @Patch(':id')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Update a variant' })
  @ApiResponse({ status: 404 })
  async update(
    @Param('hypothesisId') hypothesisId: string,
    @Param('id') id: string,
    @Body() body: UpdateVariantDto,
  ): Promise<VariantResponse> {
    const existing = await this.getVariant.execute(id);
    if (!existing || existing.hypothesisId !== hypothesisId) {
      throw new NotFoundException('Variant not found');
    }

    const variant = await this.updateVariant.execute(id, {
      name: body.name,
      changeSummary: body.changeSummary,
      content: body.content,
      status: body.status as
        'draft' | 'shortlisted' | 'rejected' | 'tested' | undefined,
      expectedUplift: body.expectedUplift,
      successMetric: body.successMetric,
      risk: body.risk,
      notes: body.notes,
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return toVariantResponse(variant);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Delete a variant' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  async delete(
    @Param('hypothesisId') hypothesisId: string,
    @Param('id') id: string,
  ): Promise<void> {
    const existing = await this.getVariant.execute(id);
    if (!existing || existing.hypothesisId !== hypothesisId) {
      throw new NotFoundException('Variant not found');
    }

    const deleted = await this.deleteVariant.execute(id);
    if (!deleted) {
      throw new NotFoundException('Variant not found');
    }
  }
}
