import { Body, Controller, Post } from '@nestjs/common'
import { LoginUserDto } from '@/users/user.dto'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  login(@Body() loginInfo: LoginUserDto) {
    return this.authService.login(loginInfo)
  }
}
