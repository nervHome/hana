import { Injectable } from '@nestjs/common'
import { Logger } from 'nestjs-pino'
import { EpgDAO } from './epg.dao'
import {
  CreateEpgDTO,
  EpgStatsDTO,
  QueryEpgsDTO,
  UpdateEpgDTO,
} from './epg.dto'

@Injectable()
export class EpgService {
  constructor(
    private readonly epgDAO: EpgDAO,
    private readonly logger: Logger,
  ) {}

  /**
   * 批量新增 EPG
   */
  async addBatchEpgs(epgList: CreateEpgDTO[]) {
    this.logger.debug(`批量新增EPG，数量: ${epgList.length}`, EpgService.name)

    try {
      const result = await this.epgDAO.batchCreateEpgs(epgList)
      this.logger.log(`成功创建 ${result.length} 个EPG`, EpgService.name)
      return {
        success: true,
        message: `成功创建 ${result.length} 个EPG`,
        data: result,
      }
    } catch (error) {
      this.logger.error('批量创建EPG失败', error, EpgService.name)
      throw error
    }
  }

  /**
   * 创建单个 EPG
   */
  async createEpg(data: CreateEpgDTO) {
    this.logger.debug(`创建EPG: ${JSON.stringify(data)}`, EpgService.name)

    try {
      const result = await this.epgDAO.createEpg(data)
      this.logger.log(`成功创建EPG: ${data.epgId}`, EpgService.name)
      return {
        success: true,
        message: 'EPG创建成功',
        data: result,
      }
    } catch (error) {
      this.logger.error(`创建EPG失败: ${data.epgId}`, error, EpgService.name)
      throw error
    }
  }

  /**
   * 分页查询 EPG
   */
  async getEpgs(query: QueryEpgsDTO) {
    this.logger.debug(`分页查询EPG: ${JSON.stringify(query)}`, EpgService.name)
    const result = await this.epgDAO.findEpgsWithPagination(query)
    return result
  }

  /**
   * 根据ID获取 EPG 详情
   */
  async getEpgById(id: string) {
    const epg = await this.epgDAO.findEpgById(id)
    return {
      success: true,
      data: epg,
    }
  }

  /**
   * 根据 epgId 获取 EPG 详情
   */
  async getEpgByEpgId(epgId: string) {
    const epg = await this.epgDAO.findEpgByEpgId(epgId)
    return {
      success: true,
      data: epg,
    }
  }

  /**
   * 更新 EPG
   */
  async updateEpg(id: string, updateData: UpdateEpgDTO) {
    this.logger.debug(
      `更新EPG ${id}: ${JSON.stringify(updateData)}`,
      EpgService.name,
    )

    try {
      // 先检查 EPG 是否存在
      await this.getEpgById(id)

      const updatedEpg = await this.epgDAO.updateEpg(id, updateData)
      this.logger.log(`成功更新EPG: ${id}`, EpgService.name)

      return {
        success: true,
        message: 'EPG更新成功',
        data: updatedEpg,
      }
    } catch (error) {
      this.logger.error(`更新EPG失败: ${id}`, error, EpgService.name)
      throw error
    }
  }

  /**
   * 删除 EPG（安全删除 - 检查关联）
   */
  async deleteEpg(id: string) {
    this.logger.debug(`删除EPG: ${id}`, EpgService.name)

    try {
      // 先检查 EPG 是否存在
      await this.getEpgById(id)

      const deletedEpg = await this.epgDAO.deleteEpg(id)
      this.logger.log(`成功删除EPG: ${id}`, EpgService.name)

      return {
        success: true,
        message: 'EPG删除成功',
        data: deletedEpg,
      }
    } catch (error) {
      this.logger.error(`删除EPG失败: ${id}`, error, EpgService.name)
      throw error
    }
  }

  /**
   * 强制删除 EPG（删除所有关联数据）
   */
  async forceDeleteEpg(id: string) {
    this.logger.debug(`强制删除EPG: ${id}`, EpgService.name)

    try {
      // 先检查 EPG 是否存在
      await this.getEpgById(id)

      const deletedEpg = await this.epgDAO.forceDeleteEpg(id)
      this.logger.log(`成功强制删除EPG: ${id}`, EpgService.name)

      return {
        success: true,
        message: 'EPG及关联数据删除成功',
        data: deletedEpg,
      }
    } catch (error) {
      this.logger.error(`强制删除EPG失败: ${id}`, error, EpgService.name)
      throw error
    }
  }

  /**
   * 获取 EPG 统计信息
   */
  async getEpgStats(query: EpgStatsDTO) {
    this.logger.debug(
      `获取EPG统计信息: ${JSON.stringify(query)}`,
      EpgService.name,
    )

    const stats = await this.epgDAO.getEpgStats(query)
    return {
      success: true,
      data: stats,
    }
  }

  /**
   * 批量切换 EPG 状态
   */
  async toggleEpgStatus(ids: string[], isActive: boolean) {
    this.logger.debug(
      `批量切换EPG状态: ${ids.join(', ')} -> ${isActive}`,
      EpgService.name,
    )

    try {
      const results = await Promise.all(
        ids.map((id) => this.updateEpg(id, { isActive })),
      )

      this.logger.log(`成功切换 ${results.length} 个EPG状态`, EpgService.name)

      return {
        success: true,
        message: `成功切换 ${results.length} 个EPG状态`,
        data: results.map((r) => r.data),
      }
    } catch (error) {
      this.logger.error('批量切换EPG状态失败', error, EpgService.name)
      throw error
    }
  }
}
