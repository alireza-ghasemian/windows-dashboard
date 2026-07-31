import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
    // Simply delegate to UsersService
    return this.usersService.create(registerDto);
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    const { username, password } = loginDto;

    // Check by username first
    let user = await this.usersService.findByUsername(username);

    // If not found, check by email (making username input accept email as well)
    if (!user && username.includes('@')) {
      user = await this.usersService.findByEmail(username);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Generate JWT token
    const payload = { sub: user.id, username: user.username };
    const accessToken = await this.jwtService.signAsync(payload);

    // Remove password from returned user profile
    const { password: _, ...userProfile } = user;

    return {
      accessToken,
      user: userProfile,
    };
  }
}
