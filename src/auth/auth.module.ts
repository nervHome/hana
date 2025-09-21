import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ExtractJwt } from 'passport-jwt'
import { UsersModule } from '@/users/users.module'
import { AuthController } from './auth.controller'
import { AuthService } from './services/auth.service'
import { JwtBlacklistService } from './services/jwt-blacklist.service'
import { JwtStrategy } from './strategy/jwt.strategy'
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || '',
        signOptions: { expiresIn: '2h' },
        ignoreExpiration: false,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtBlacklistService],
  exports: [AuthService, JwtBlacklistService],
  controllers: [AuthController],
})
export class AuthModule {}
