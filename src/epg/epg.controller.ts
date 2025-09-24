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
  CreateEpgDTO,
  EpgStatsDTO,
  QueryEpgsDTO,
  UpdateEpgDTO,
} from './epg.dto'
import { EpgService } from './epg.service'

@Controller('epg')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class EpgController {
  constructor(private readonly epgService: EpgService) {}

  /**
   * 批量新增 EPG
   * POST /epgs/batch
   */
  @Post('batch')
  async batchAddEpgs(@Body() epgList: CreateEpgDTO[]) {
    return this.epgService.addBatchEpgs(epgList)
  }

  /**
   * 创建单个 EPG
   * POST /epgs
   */
  @Post()
  async createEpg(@Body() data: CreateEpgDTO) {
    return this.epgService.createEpg(data)
  }

  /**
   * 分页查询 EPG
   * GET /epgs
   */
  @Get()
  async getEpgs(@Query() query: QueryEpgsDTO) {
    return this.epgService.getEpgs(query)
  }

  /**
   * 获取 EPG 统计信息
   * GET /epgs/stats
   */
  @Get('stats')
  async getEpgStats(@Query() query: EpgStatsDTO) {
    return this.epgService.getEpgStats(query)
  }

  /**
   * 根据 epgId 获取 EPG 详情
   * GET /epgs/by-epg-id/:epgId
   */
  @Get('by-epg-id/:epgId')
  async getEpgByEpgId(@Param('epgId') epgId: string) {
    return this.epgService.getEpgByEpgId(epgId)
  }

  /**
   * 根据ID获取 EPG 详情
   * GET /epgs/:id
   */
  @Get(':id')
  async getEpgById(@Param('id', ParseUUIDPipe) id: string) {
    return this.epgService.getEpgById(id)
  }

  /**
   * 更新 EPG 信息
   * PUT /epgs/:id
   */
  @Put(':id')
  async updateEpg(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: UpdateEpgDTO,
  ) {
    return this.epgService.updateEpg(id, updateData)
  }

  /**
   * 批量切换 EPG 状态
   * PUT /epgs/toggle-status
   */
  @Put('toggle-status')
  async toggleEpgStatus(@Body() data: { ids: string[]; isActive: boolean }) {
    return this.epgService.toggleEpgStatus(data.ids, data.isActive)
  }

  /**
   * 删除 EPG（安全删除）
   * DELETE /epgs/:id
   */
  @Delete(':id')
  async deleteEpg(@Param('id', ParseUUIDPipe) id: string) {
    return this.epgService.deleteEpg(id)
  }

  /**
   * 强制删除 EPG（删除所有关联数据）
   * DELETE /epgs/:id/force
   */
  @Delete(':id/force')
  async forceDeleteEpg(@Param('id', ParseUUIDPipe) id: string) {
    return this.epgService.forceDeleteEpg(id)
  }
}
