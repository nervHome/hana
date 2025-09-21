import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'
import type { Request as ExpressRequest } from 'express'
import { LoginUserDto } from '@/users/user.dto'
import { JwtAuthGuard } from './guard/jwt-auth.guard'
import { AuthService } from './services/auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginInfo: LoginUserDto) {
    return this.authService.login(loginInfo)
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: ExpressRequest) {
    // 从请求头中提取JWT令牌
    const authorization = req.headers.authorization
    if (authorization?.startsWith('Bearer ')) {
      const token = authorization.substring(7)
      await this.authService.logout(token)
    }

    return {
      message: '退出登录成功',
    }
  }
}
