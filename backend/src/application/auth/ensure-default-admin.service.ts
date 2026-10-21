import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import type { UserRepository } from '../../domain/user/user.repository';
import { User } from '../../domain/user/user';
import { USER_REPOSITORY } from '../../common/tokens';

@Injectable()
export class EnsureDefaultAdminService implements OnApplicationBootstrap {
  private readonly logger = new Logger(EnsureDefaultAdminService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.ensureDefaultAdmin();
  }

  async ensureDefaultAdmin(): Promise<void> {
    const email = this.configService
      .get<string>('ADMIN_DEFAULT_EMAIL')
      ?.trim()
      .toLowerCase();
    const password = this.configService.get<string>('ADMIN_DEFAULT_PASSWORD');
    const name =
      this.configService.get<string>('ADMIN_DEFAULT_NAME')?.trim() ||
      'Platform Admin';
    const workspaceId = this.configService
      .get<string>('ADMIN_DEFAULT_WORKSPACE_ID')
      ?.trim();

    if (!email && !password) {
      return;
    }

    if (!email || !password) {
      this.logger.warn(
        'Skipping default admin bootstrap: ADMIN_DEFAULT_EMAIL and ADMIN_DEFAULT_PASSWORD must both be provided.',
      );
      return;
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      if (existing.role !== 'admin') {
        this.logger.warn(
          `User ${email} exists but is not admin. Use /auth/bootstrap-admin with ADMIN_BOOTSTRAP_KEY to create an admin user.`,
        );
      }
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = User.create({
      email,
      passwordHash,
      name,
      role: 'admin',
      workspaceId,
    });

    await this.userRepository.create(admin);
    this.logger.log(`Default admin user provisioned: ${email}`);
  }
}
