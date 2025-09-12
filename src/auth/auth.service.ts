import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import * as bcrypt from 'bcryptjs';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private rolesService: RolesService,
  ) {}
  hashPassword(password: string) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  }
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      const isValid = this.usersService.isValidPassword(password, user.password);
      if (isValid) {
        // get user role casting data (ObjectId -> {_id: string, name: string})
        const userRole = user.role as unknown as { _id: string; name: string };
        const tempRole = await this.rolesService.findOne(userRole._id);
        const objectUser = {
          ...user.toObject(),
          permissions: tempRole.permissions ?? [],
        };
        return objectUser;
      }
    }
    return null;
  }

  async register(user: RegisterUserDto) {
    let newUser = await this.usersService.register(user);
    return {
      _id: newUser?._id,
      createAt: newUser?.createdAt,
    };
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role, permissions } = user;
    const payload = { sub: 'token login', iss: 'from server', _id, name, email, role };
    const refresh_token = this.createRefreshToken(payload);

    // update user with refresh token
    this.usersService.updateUserToken(_id, refresh_token);

    // set refresh token as cookies
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN')),
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: { _id, name, email, role, permissions },
    };
  }

  createRefreshToken(payload: any) {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: ms(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN')) / 1000,
    });
    return refresh_token;
  }

  async refreshAccessToken(refreshToken: string, response: Response) {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      const user = await this.usersService.findUserByRefreshToken(refreshToken);

      if (!user) {
        throw new BadRequestException('Refresh token không hợp lệ. Vui lòng đăng nhập lại');
      } else {
        const { _id, name, email, role } = user;
        const payload = { sub: 'token refresh', iss: 'from server', _id, name, email, role };
        const refresh_token = this.createRefreshToken(payload);

        // update user with refresh token
        this.usersService.updateUserToken(_id.toString(), refresh_token);

        // get user role casting data (ObjectId -> {_id: string, name: string})
        const userRole = user.role as unknown as { _id: string; name: string };
        const tempRole = await this.rolesService.findOne(userRole._id);

        // delete old refresh token
        response.clearCookie('refresh_token');

        // set refresh token as cookies
        response.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN')),
        });

        return {
          access_token: this.jwtService.sign(payload),
          user: { _id, name, email, role, permissions: tempRole.permissions },
        };
      }
    } catch (error) {
      throw new BadRequestException('Refresh token không hợp lệ. Vui lòng đăng nhập lại');
    }
  }

  async logout(response: Response, user: IUser) {
    // update refresh token
    await this.usersService.updateUserToken(user._id, '');
    // delete refresh token in cookies
    response.clearCookie('refresh_token');
    return 'ok';
  }
}
