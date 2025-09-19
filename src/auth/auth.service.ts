import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { BusinessException } from '@/common'
import { UsersService } from '../users/users.service'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(user: { email: string; password: string }) {
    const userResult = await this.usersService.validateUser(
      user.email,
      user.password,
    )
    if (!userResult) {
      throw BusinessException.businessRuleViolation(
        '用户名或者密码错误, 请重新输入',
      )
    }
    const payload = {
      username: userResult.email,
      sub: {
        id: userResult.id,
        role: userResult.role,
      },
    }

    return {
      access_token: this.jwtService.sign(payload),
    }
  }
}
