import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard'
import { JwtBlacklistService } from '@/auth/services/jwt-blacklist.service'
import { CommonService } from './common.service'
import { PrismaService } from './prisma.service'

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || '',
        signOptions: { expiresIn: '2h' },
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
  ],
  providers: [CommonService, PrismaService, JwtBlacklistService, JwtAuthGuard],
  exports: [CommonService, PrismaService, JwtBlacklistService, JwtAuthGuard],
})
@Global()
export class CommonModule {}
