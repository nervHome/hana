import {
  type ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { Request } from 'express'
import { JwtBlacklistService } from '../services/jwt-blacklist.service'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name)

  constructor(private readonly jwtBlacklistService: JwtBlacklistService) {
    super()
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context)
  }

  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    const request = context.switchToHttp().getRequest<Request>()
    const token = this.extractTokenFromHeader(request)

    this.logger.log(
      `JWT Auth Guard - user: ${JSON.stringify(user)}, info: ${info}`,
    )

    // 检查令牌是否在黑名单中
    if (token && this.jwtBlacklistService.isBlacklisted(token)) {
      this.logger.warn(
        { token: token.substring(0, 20) + '...' },
        'Rejected blacklisted token',
      )
      throw new UnauthorizedException('Token has been revoked')
    }

    if (err || !user) {
      throw err || new UnauthorizedException()
    }
    return user
  }

  /**
   * 从请求头中提取JWT令牌
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers.authorization
    if (authorization?.startsWith('Bearer ')) {
      return authorization.substring(7)
    }
    return undefined
  }
}
