import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  CreateChannelDTO,
  QueryChannelsDTO,
  UpdateChannelDTO,
} from './channel.dto'
import { ChannelService } from './channel.service'

@Controller('channel')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  /**
   * 批量新增频道
   * POST /channels/batch
   */
  @Post('batch')
  async batchAddChannels(@Body() channelList: CreateChannelDTO[]) {
    return this.channelService.addBatchChannels(channelList)
  }

  /**
   * 分页查询频道
   * GET /channels
   */
  @Get()
  async getChannels(@Query() query: QueryChannelsDTO) {
    return this.channelService.getChannels(query)
  }

  /**
   * 根据ID获取频道详情
   * GET /channels/:id
   */
  @Get(':id')
  async getChannelById(@Param('id', ParseUUIDPipe) id: string) {
    return this.channelService.getChannelById(id)
  }

  /**
   * 更新频道信息
   * PUT /channels/:id
   */
  @Put(':id')
  async updateChannel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: UpdateChannelDTO,
  ) {
    return this.channelService.updateChannel(id, updateData)
  }

  /**
   * 删除频道
   * DELETE /channels/:id
   */
  @Delete(':id')
  async deleteChannel(@Param('id', ParseUUIDPipe) id: string) {
    return this.channelService.deleteChannel(id)
  }
}
