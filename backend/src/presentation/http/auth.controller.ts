import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { RegisterUseCase } from '../../application/auth/register.usecase';
import { LoginUseCase } from '../../application/auth/login.usecase';
import { GetBootstrapStatusUseCase } from '../../application/auth/get-bootstrap-status.usecase';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { Roles } from './guards/roles.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getBootstrapStatusUseCase: GetBootstrapStatusUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() body: RegisterDto) {
    const user = await this.registerUseCase.execute({
      email: body.email,
      password: body.password,
      name: body.name,
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate and get JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT token',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: LoginDto) {
    return this.loginUseCase.execute({
      email: body.email,
      password: body.password,
    });
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user info' })
  @ApiResponse({ status: 200, description: 'Current user details' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  @ApiBearerAuth()
  @Roles('admin')
  @Get('bootstrap-status')
  @ApiOperation({
    summary:
      'Get bootstrap/admin provisioning status (admin-only operational check)',
  })
  @ApiResponse({
    status: 200,
    description: 'Bootstrap status payload',
  })
  @ApiResponse({ status: 403, description: 'Forbidden (admin role required)' })
  async bootstrapStatus() {
    return this.getBootstrapStatusUseCase.execute();
  }

  @Public()
  @Post('bootstrap-admin')
  @ApiOperation({ summary: 'Create initial admin user with bootstrap key' })
  @ApiResponse({ status: 201, description: 'Admin user created' })
  @ApiResponse({
    status: 403,
    description: 'Bootstrap disabled or invalid key',
  })
  async bootstrapAdmin(@Body() body: BootstrapAdminDto) {
    const expectedBootstrapKey = this.configService.get<string>(
      'ADMIN_BOOTSTRAP_KEY',
    );

    if (!expectedBootstrapKey) {
      throw new ForbiddenException(
        'Admin bootstrap is disabled. Set ADMIN_BOOTSTRAP_KEY to enable it.',
      );
    }

    if (body.bootstrapKey !== expectedBootstrapKey) {
      throw new UnauthorizedException('Invalid bootstrap key');
    }

    const user = await this.registerUseCase.execute({
      email: body.email,
      password: body.password,
      name: body.name,
      role: 'admin',
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
