import { Module } from '@nestjs/common'
import { CommonModule } from '@/common'
import { ChannelController } from './channel.controller'
import { ChannelDAO } from './channel.dao'
import { ChannelService } from './channel.service'

@Module({
  imports: [CommonModule],
  controllers: [ChannelController],
  providers: [ChannelService, ChannelDAO],
  exports: [ChannelService, ChannelDAO],
})
export class ChannelModule {}
