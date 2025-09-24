import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from 'generated/prisma'
import { PrismaService } from '@/common'
import {
  CreateEpgDTO,
  EpgStatsDTO,
  QueryEpgsDTO,
  UpdateEpgDTO,
} from './epg.dto'

@Injectable()
export class EpgDAO {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 批量创建 EPG - 使用事务
   */
  async batchCreateEpgs(epgList: CreateEpgDTO[]) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        // 检查重复的 epgId
        const existingEpgs = await tx.epg.findMany({
          where: {
            epgId: {
              in: epgList.map((epg) => epg.epgId),
            },
          },
          select: { epgId: true },
        })

        if (existingEpgs.length > 0) {
          const duplicateIds = existingEpgs.map((epg) => epg.epgId).join(', ')
          throw new ConflictException(`EPG ID重复: ${duplicateIds}`)
        }

        // 批量创建
        const epgData: Prisma.EpgCreateManyInput[] = epgList.map((epg) => ({
          epgId: epg.epgId,
          name: epg.name,
          xmlUrl: epg.xmlUrl || null,
          language: epg.language || null,
          isActive: epg.isActive ?? true,
          remark: epg.remark || null,
        }))

        return await tx.epg.createManyAndReturn({
          data: epgData,
          select: {
            id: true,
            epgId: true,
            name: true,
            xmlUrl: true,
            language: true,
            isActive: true,
            remark: true,
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
        throw new ConflictException('EPG ID重复，请检查 epgId')
      }
      throw error
    }
  }

  /**
   * 创建单个 EPG
   */
  async createEpg(data: CreateEpgDTO) {
    try {
      return await this.prismaService.epg.create({
        data: {
          epgId: data.epgId,
          name: data.name,
          xmlUrl: data.xmlUrl || null,
          language: data.language || null,
          isActive: data.isActive ?? true,
          remark: data.remark || null,
        },
        select: {
          id: true,
          epgId: true,
          name: true,
          xmlUrl: true,
          language: true,
          isActive: true,
          remark: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`EPG ID已存在: ${data.epgId}`)
      }
      throw error
    }
  }

  /**
   * 分页查询 EPG
   */
  async findEpgsWithPagination(query: QueryEpgsDTO) {
    const {
      current = 1,
      pageSize = 10,
      keyword,
      language,
      isActive,
      epgId,
    } = query
    const skip = (current - 1) * pageSize

    const where: Prisma.EpgWhereInput = {}

    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { epgId: { contains: keyword, mode: 'insensitive' } },
        { remark: { contains: keyword, mode: 'insensitive' } },
      ]
    }

    if (epgId) {
      where.epgId = { contains: epgId, mode: 'insensitive' }
    }

    if (language) {
      where.language = language
    }
    if (typeof isActive === 'boolean') {
      where.isActive = isActive
    }

    const [epgs, total] = await Promise.all([
      this.prismaService.epg.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          epgId: true,
          name: true,
          xmlUrl: true,
          language: true,
          isActive: true,
          remark: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              channels: true,
              programmes: true,
            },
          },
        },
      }),
      this.prismaService.epg.count({ where }),
    ])

    return {
      data: epgs,
      pagination: {
        current,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }

  /**
   * 根据ID查找 EPG
   */
  async findEpgById(id: string) {
    const epg = await this.prismaService.epg.findUnique({
      where: { id },
      select: {
        id: true,
        epgId: true,
        name: true,
        xmlUrl: true,
        language: true,
        isActive: true,
        remark: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            channels: true,
            programmes: true,
            channelSources: true,
          },
        },
      },
    })

    if (!epg) {
      throw new NotFoundException(`EPG不存在: ${id}`)
    }

    return epg
  }

  /**
   * 根据 epgId 查找 EPG
   */
  async findEpgByEpgId(epgId: string) {
    const epg = await this.prismaService.epg.findUnique({
      where: { epgId },
      select: {
        id: true,
        epgId: true,
        name: true,
        xmlUrl: true,
        language: true,
        isActive: true,
        remark: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            channels: true,
            programmes: true,
            channelSources: true,
          },
        },
      },
    })

    if (!epg) {
      throw new NotFoundException(`EPG不存在: ${epgId}`)
    }

    return epg
  }

  /**
   * 更新 EPG
   */
  async updateEpg(id: string, data: UpdateEpgDTO) {
    try {
      return await this.prismaService.epg.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          epgId: true,
          name: true,
          xmlUrl: true,
          language: true,
          isActive: true,
          remark: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`EPG不存在: ${id}`)
      }
      throw error
    }
  }

  /**
   * 删除 EPG - 需要检查关联数据
   */
  async deleteEpg(id: string) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        // 检查是否有关联的频道
        const channelCount = await tx.channel.count({
          where: { epg: { id } },
        })

        if (channelCount > 0) {
          throw new ConflictException(
            `该EPG下还有 ${channelCount} 个频道，无法删除`,
          )
        }

        // 检查是否有关联的节目
        const programmeCount = await tx.programme.count({
          where: { epg: { id } },
        })

        if (programmeCount > 0) {
          throw new ConflictException(
            `该EPG下还有 ${programmeCount} 个节目，无法删除`,
          )
        }

        return await tx.epg.delete({
          where: { id },
          select: {
            id: true,
            epgId: true,
            name: true,
          },
        })
      })
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`EPG不存在: ${id}`)
      }
      throw error
    }
  }

  /**
   * 强制删除 EPG - 同时删除关联数据
   */
  async forceDeleteEpg(id: string) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        // 删除关联的节目
        await tx.programme.deleteMany({
          where: { epg: { id } },
        })

        // 删除关联的频道源
        await tx.channelSource.deleteMany({
          where: { epg: { id } },
        })

        // 删除关联的频道
        await tx.channel.deleteMany({
          where: { epg: { id } },
        })

        // 删除 EPG
        return await tx.epg.delete({
          where: { id },
          select: {
            id: true,
            epgId: true,
            name: true,
          },
        })
      })
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`EPG不存在: ${id}`)
      }
      throw error
    }
  }

  /**
   * 获取 EPG 统计信息
   */
  async getEpgStats(query: EpgStatsDTO) {
    const { epgId, dateRange } = query

    let dateFilter: Prisma.DateTimeFilter | undefined
    if (dateRange) {
      const days = parseInt(dateRange.replace('d', ''))
      if (!Number.isNaN(days)) {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        dateFilter = { gte: startDate }
      }
    }

    const where: Prisma.EpgWhereInput = {}
    if (epgId) {
      where.epgId = epgId
    }

    const [totalEpgs, activeEpgs, totalChannels, totalProgrammes, recentEpgs] =
      await Promise.all([
        this.prismaService.epg.count({ where }),
        this.prismaService.epg.count({
          where: { ...where, isActive: true },
        }),
        this.prismaService.channel.count({
          where: epgId ? { epgId } : {},
        }),
        this.prismaService.programme.count({
          where: epgId ? { epgId } : {},
        }),
        this.prismaService.epg.findMany({
          where: {
            ...where,
            ...(dateFilter && { createdAt: dateFilter }),
          },
          select: {
            id: true,
            epgId: true,
            name: true,
            createdAt: true,
            _count: {
              select: {
                channels: true,
                programmes: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
      ])

    return {
      summary: {
        totalEpgs,
        activeEpgs,
        inactiveEpgs: totalEpgs - activeEpgs,
        totalChannels,
        totalProgrammes,
      },
      recentEpgs,
    }
  }
}
