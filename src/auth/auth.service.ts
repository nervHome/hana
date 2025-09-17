import { BusinessException } from '@/common'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
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
        'user or password is invalid',
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
