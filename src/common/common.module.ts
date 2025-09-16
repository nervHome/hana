import { PrismaService } from '@/common/prisma.service'
import { Global, Module } from '@nestjs/common'
import { CommonService } from './common.service'
@Module({
  providers: [CommonService, PrismaService],
  exports: [CommonService, PrismaService],
})
@Global()
export class CommonModule {}
