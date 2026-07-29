import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role } from '@serviceit-scanner/database';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from './public.decorator';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { CurrentUser, type RequestUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('bootstrap-status')
  async bootstrapStatus() {
    return { registrationOpen: !(await this.authService.hasAnyUser()) };
  }

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  me(@CurrentUser() user: RequestUser) {
    return this.authService.me(user.userId);
  }

  // Docs2 "authentification équipe" — an ADMIN invites teammates once
  // bootstrap registration (above) is closed.
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('users')
  listUsers() {
    return this.authService.listUsers();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.authService.createUser(dto);
  }
}
