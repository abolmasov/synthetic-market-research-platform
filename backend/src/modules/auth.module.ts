import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { StringValue } from 'ms';
import { USER_REPOSITORY } from '../common/tokens';
import { RegisterUseCase } from '../application/auth/register.usecase';
import { LoginUseCase } from '../application/auth/login.usecase';
import { EnsureDefaultAdminService } from '../application/auth/ensure-default-admin.service';
import { GetBootstrapStatusUseCase } from '../application/auth/get-bootstrap-status.usecase';
import { AuthController } from '../presentation/http/auth.controller';
import { JwtStrategy } from '../presentation/http/guards/jwt.strategy';
import { UserOrmEntity } from '../infrastructure/persistence/typeorm/user.orm-entity';
import { TypeormUserRepository } from '../infrastructure/persistence/typeorm/user.repository';
import { isDatabaseEnabled } from '../common/runtime-config';
import { InMemoryUserRepository } from '../infrastructure/persistence/in-memory-user.repository';

const userRepositoryProvider = {
  provide: USER_REPOSITORY,
  useClass: isDatabaseEnabled ? TypeormUserRepository : InMemoryUserRepository,
};

const typeormImports = isDatabaseEnabled
  ? [TypeOrmModule.forFeature([UserOrmEntity])]
  : [];

@Module({
  imports: [
    ...typeormImports,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error(
            'JWT_SECRET environment variable is required but not configured',
          );
        }
        const expiresIn = configService.get<StringValue>(
          'JWT_EXPIRES_IN',
          '24h',
        );

        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    userRepositoryProvider,
    RegisterUseCase,
    LoginUseCase,
    GetBootstrapStatusUseCase,
    EnsureDefaultAdminService,
    JwtStrategy,
  ],
  exports: [USER_REPOSITORY, JwtStrategy, PassportModule],
})
export class AuthModule {}
