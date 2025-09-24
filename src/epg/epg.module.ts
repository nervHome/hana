import { Module } from '@nestjs/common'
import { CommonModule } from '@/common'
import { EpgController } from './epg.controller'
import { EpgDAO } from './epg.dao'
import { EpgService } from './epg.service'

@Module({
  imports: [CommonModule],
  controllers: [EpgController],
  providers: [EpgService, EpgDAO],
  exports: [EpgService, EpgDAO],
})
export class EpgModule {}
