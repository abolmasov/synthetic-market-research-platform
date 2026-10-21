import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateArtifactUseCase } from '../../application/study/create-artifact.usecase';
import { ListArtifactsUseCase } from '../../application/study/list-artifacts.usecase';
import { DeleteArtifactUseCase } from '../../application/study/delete-artifact.usecase';
import { CreateArtifactDto } from './dto/create-artifact.dto';
import { ArtifactResponse, toArtifactResponse } from './dto/artifact.response';
import { Roles } from './guards/roles.guard';

@ApiTags('Artifacts')
@ApiBearerAuth()
@Controller('artifacts')
export class ArtifactController {
  constructor(
    private readonly createArtifact: CreateArtifactUseCase,
    private readonly listArtifacts: ListArtifactsUseCase,
    private readonly deleteArtifact: DeleteArtifactUseCase,
  ) {}

  @Post()
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Create a new artifact' })
  async create(@Body() body: CreateArtifactDto): Promise<ArtifactResponse> {
    const artifact = await this.createArtifact.execute({
      runId: body.runId,
      stage: body.stage,
      type: body.type,
      payload: body.payload,
    });
    return toArtifactResponse(artifact);
  }

  @Get()
  @Roles('admin', 'analyst', 'viewer')
  @ApiOperation({ summary: 'List artifacts by run ID' })
  async list(@Query('runId') runId: string): Promise<ArtifactResponse[]> {
    if (!runId) {
      return [];
    }
    const artifacts = await this.listArtifacts.execute(runId);
    return artifacts.map(toArtifactResponse);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Delete an artifact' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteArtifact.execute(id);
  }
}
