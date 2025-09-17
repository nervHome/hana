import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { AppService } from './app.service'
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getHello(): string {
    return this.appService.getHello()
  }
  @Post('auth/logout')
  async logout(@Request() req) {
    return req.logout()
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    }
  }

  @Get('version')
  version() {
    return {
      version: process.env.npm_package_version || '1.0.0',
      node: process.version,
    }
  }
}
