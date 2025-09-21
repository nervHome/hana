import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { BusinessException } from '@/common'
import { UsersService } from '@/users/users.service'
import { JwtBlacklistService } from './jwt-blacklist.service'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private jwtBlacklistService: JwtBlacklistService,
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

  /**
   * 注销 - 将JWT令牌加入黑名单
   */
  async logout(token: string): Promise<void> {
    this.jwtBlacklistService.addToBlacklist(token)
  }
}
