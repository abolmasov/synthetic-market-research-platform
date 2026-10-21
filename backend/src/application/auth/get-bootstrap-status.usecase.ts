import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { USER_REPOSITORY } from '../../common/tokens';
import type { UserRepository } from '../../domain/user/user.repository';

export type BootstrapStatus = {
  hasAdminUser: boolean;
  bootstrapKeyConfigured: boolean;
  defaultAdminConfigured: boolean;
};

@Injectable()
export class GetBootstrapStatusUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(): Promise<BootstrapStatus> {
    const hasAdminUser = await this.userRepository.hasAnyAdmin();
    const bootstrapKeyConfigured = Boolean(
      this.configService.get<string>('ADMIN_BOOTSTRAP_KEY')?.trim(),
    );
    const defaultAdminConfigured = Boolean(
      this.configService.get<string>('ADMIN_DEFAULT_EMAIL')?.trim() &&
      this.configService.get<string>('ADMIN_DEFAULT_PASSWORD')?.trim(),
    );

    return {
      hasAdminUser,
      bootstrapKeyConfigured,
      defaultAdminConfigured,
    };
  }
}
