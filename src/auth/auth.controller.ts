import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { IUser } from 'src/users/users.interface';
import { LocalAuthGuard } from './local-auth.guard';
import { RolesService } from 'src/roles/roles.service';
import { LoginUserDto, RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private rolesService: RolesService) {}
  @Public()
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @ApiBody({ type: LoginUserDto })
  @Post('/login')
  @ResponseMessage('Login')
  handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @Public()
  @Post('/register')
  @ResponseMessage('Register a new user')
  handleRegister(@Body() RegisterUserDto: RegisterUserDto) {
    return this.authService.register(RegisterUserDto);
  }

  @Get('/account')
  @ResponseMessage('Get user information')
  async handleGetAccount(@User() user: IUser) {
    // query database to get permissions
    const tempRole = (await this.rolesService.findOne(user.role._id)) as any;
    user.permissions = tempRole.permissions;
    return { user };
  }

  @Public()
  @Get('/refresh')
  @ResponseMessage('Get new access token, refresh token')
  handleRefreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies['refresh_token'];
    return this.authService.refreshAccessToken(refreshToken, response);
  }

  @Post('/logout')
  @ResponseMessage('Logout')
  handleLogout(@Res({ passthrough: true }) response: Response, @User() user: IUser) {
    return this.authService.logout(response, user);
  }
}
