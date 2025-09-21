import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Logger } from 'nestjs-pino'
import { ExtractJwt, Strategy } from 'passport-jwt'

interface JwtPayload {
  sub: {
    id: string
    role: string
  }
  username: string
  iat?: number
  exp?: number
}

interface UserPayload {
  userId: string
  username: string
  role: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly logger: Logger,
    configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET') || ''
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    })
  }

  async validate(payload: JwtPayload): Promise<UserPayload> {
    const { id, role } = payload.sub
    this.logger.log(
      `JWT Validate - userId: ${id}, username: ${payload.username}, role: ${role}`,
    )
    return { userId: id, username: payload.username, role }
  }
}
