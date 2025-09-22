import { Injectable, NotFoundException } from '@nestjs/common'
import { Logger } from 'nestjs-pino'
import { ChannelDAO } from './channel.dao'
import {
  CreateChannelDTO,
  QueryChannelsDTO,
  UpdateChannelDTO,
} from './channel.dto'

@Injectable()
export class ChannelService {
  constructor(
    private readonly channelDAO: ChannelDAO,
    private readonly logger: Logger,
  ) {}

  // 批量新增频道
  async addBatchChannels(channelList: CreateChannelDTO[]) {
    this.logger.debug(
      `批量新增频道，数量: ${channelList.length}`,
      ChannelService.name,
    )

    try {
      const result = await this.channelDAO.batchCreateChannels(channelList)
      this.logger.log(`成功创建 ${result.length} 个频道`, ChannelService.name)
      return {
        success: true,
        message: `成功创建 ${result.length} 个频道`,
        data: result,
      }
    } catch (error) {
      this.logger.error('批量创建频道失败', error, ChannelService.name)
      throw error
    }
  }

  // 分页查询频道
  async getChannels(query: QueryChannelsDTO) {
    this.logger.debug(
      `分页查询频道: ${JSON.stringify(query)}`,
      ChannelService.name,
    )

    const result = await this.channelDAO.findChannelsWithPagination(query)
    return {
      success: true,
      ...result,
    }
  }

  // 根据ID获取频道详情
  async getChannelById(id: string) {
    const channel = await this.channelDAO.findChannelById(id)
    if (!channel) {
      throw new NotFoundException(`频道不存在: ${id}`)
    }
    return {
      success: true,
      data: channel,
    }
  }

  // 更新频道
  async updateChannel(id: string, updateData: UpdateChannelDTO) {
    this.logger.debug(
      `更新频道 ${id}: ${JSON.stringify(updateData)}`,
      ChannelService.name,
    )

    try {
      // 先检查频道是否存在
      await this.getChannelById(id)

      const updatedChannel = await this.channelDAO.updateChannel(id, updateData)
      this.logger.log(`成功更新频道: ${id}`, ChannelService.name)

      return {
        success: true,
        message: '频道更新成功',
        data: updatedChannel,
      }
    } catch (error) {
      this.logger.error(`更新频道失败: ${id}`, error, ChannelService.name)
      throw error
    }
  }

  // 删除频道
  async deleteChannel(id: string) {
    this.logger.debug(`删除频道: ${id}`, ChannelService.name)

    try {
      // 先检查频道是否存在
      await this.getChannelById(id)

      const deletedChannel = await this.channelDAO.deleteChannel(id)
      this.logger.log(`成功删除频道: ${id}`, ChannelService.name)

      return {
        success: true,
        message: '频道删除成功',
        data: deletedChannel,
      }
    } catch (error) {
      this.logger.error(`删除频道失败: ${id}`, error, ChannelService.name)
      throw error
    }
  }
}
