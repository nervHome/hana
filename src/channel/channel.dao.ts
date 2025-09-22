import { ConflictException, Injectable } from '@nestjs/common'
import { Prisma } from 'generated/prisma'
import { PrismaService } from '@/common'
import {
  CreateChannelDTO,
  QueryChannelsDTO,
  UpdateChannelDTO,
} from './channel.dto'

@Injectable()
export class ChannelDAO {
  constructor(private readonly prismaService: PrismaService) {}

  // 批量创建频道 - 使用事务
  async batchCreateChannels(channelList: CreateChannelDTO[]) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        // 检查重复的 channelId + epgId 组合
        const existingChannels = await tx.channel.findMany({
          where: {
            OR: channelList.map((channel) => ({
              channelId: channel.channelId,
              epgId: channel.epgId,
            })),
          },
          select: { channelId: true, epgId: true },
        })

        if (existingChannels.length > 0) {
          const duplicateIds = existingChannels
            .map((ch) => `${ch.channelId}@${ch.epgId}`)
            .join(', ')
          throw new ConflictException(`频道ID重复: ${duplicateIds}`)
        }

        // 批量创建
        const channelData: Prisma.ChannelCreateManyInput[] = channelList.map(
          (channel) => ({
            name: channel.name,
            channelId: channel.channelId,
            epgId: channel.epgId,
            logoUrl: channel.logoUrl || null,
            language: channel.language || null,
            country: channel.country || null,
            isActive: channel.isActive ?? true,
          }),
        )

        return await tx.channel.createManyAndReturn({
          data: channelData,
          select: {
            id: true,
            name: true,
            channelId: true,
            epgId: true,
            logoUrl: true,
            language: true,
            country: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        })
      })
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error
      }
      // 处理 Prisma 唯一约束错误
      if (error.code === 'P2002') {
        throw new ConflictException(
          '频道ID重复，请检查 channelId 和 epgId 组合',
        )
      }
      throw error
    }
  }

  // 分页查询频道
  async findChannelsWithPagination(query: QueryChannelsDTO) {
    const { page = 1, limit = 10, search, epgId, isActive } = query
    const skip = (page - 1) * limit

    const where: Prisma.ChannelWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { channelId: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (epgId) {
      where.epgId = epgId
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive
    }

    const [channels, total] = await Promise.all([
      this.prismaService.channel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          channelId: true,
          epgId: true,
          logoUrl: true,
          language: true,
          country: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prismaService.channel.count({ where }),
    ])

    return {
      data: channels,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // 根据ID查找频道
  async findChannelById(id: string) {
    return this.prismaService.channel.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        channelId: true,
        epgId: true,
        logoUrl: true,
        language: true,
        country: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  // 更新频道
  async updateChannel(id: string, data: UpdateChannelDTO) {
    return this.prismaService.channel.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        channelId: true,
        epgId: true,
        logoUrl: true,
        language: true,
        country: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  // 删除频道
  async deleteChannel(id: string) {
    return this.prismaService.channel.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        channelId: true,
      },
    })
  }
}
