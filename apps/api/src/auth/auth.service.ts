import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Role } from '@serviceit-scanner/database';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateUserDto } from './dto/create-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Bootstrap-only registration (Docs2/12 Sprint 2 simplified for solo dev /
   * small team): the very first account becomes ADMIN. Once at least one
   * user exists, this endpoint is closed — further accounts should be
   * created by an ADMIN later (out of scope for this sprint).
   */
  async register(dto: RegisterDto) {
    const existingCount = await this.prisma.user.count();
    if (existingCount > 0) {
      throw new ForbiddenException(
        'Registration is closed — an account already exists. Ask an admin for access.',
      );
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash, role: Role.ADMIN },
    });

    return this.buildSession(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    return this.buildSession(user.id, user.email, user.role);
  }

  async hasAnyUser(): Promise<boolean> {
    return (await this.prisma.user.count()) > 0;
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, role: user.role };
  }

  /** ADMIN-only (Docs2 "authentification équipe") — invite additional team members. */
  async listUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    return users;
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash, role: dto.role ?? Role.MEMBER },
    });
    return { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt };
  }

  private buildSession(userId: string, email: string, role: Role) {
    const accessToken = this.jwtService.sign({ sub: userId, email, role });
    return { accessToken, user: { id: userId, email, role } };
  }
}
