import * as fs from 'node:fs'
import { readFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { XMLParser } from 'fast-xml-parser'
import { ensureDirSync } from 'fs-extra'
import { Logger } from 'nestjs-pino'
import type { EPG_XML } from '@/type/epg'

// 扩展 dayjs 插件
dayjs.extend(utc)
dayjs.extend(timezone)

@Injectable()
export class CommonService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}
  getTargetFileName(url: string, ...path: string[]) {
    const urlFileName = basename(url)

    const dateStr = dayjs().format('YYYY-MM-DD_HH-mm-ss')

    const filePath = join(
      this.configService.get('ASSETS_PATH') as string,
      ...path,
      `${dateStr}_${urlFileName}`,
    )
    this.logger.debug(`full file path = ${filePath}`)
    return filePath
  }

  async downloadFile(url: string, destination: string): Promise<void> {
    this.logger.log(
      `Downloading file from ${url} to ${destination}`,
      'DownloadService',
    )
    const filePath = dirname(destination)
    const fileName = basename(destination)

    // 动态导入 got
    const { default: got } = await import('got')

    // 尝试多种不同的 User-Agent 和头部配置
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'curl/7.68.0',
      'wget/1.20.3',
    ]

    const fullPathName = join(filePath, fileName)
    ensureDirSync(filePath)

    for (let attempt = 0; attempt < userAgents.length; attempt++) {
      try {
        this.logger.debug(
          `Attempt ${attempt + 1} with User-Agent: ${userAgents[attempt]}`,
        )

        await pipeline(
          got.stream(url, {
            headers: {
              'User-Agent': userAgents[attempt],
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate, br',
              Connection: 'keep-alive',
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
              Referer: 'https://iptv.b2og.com/',
              Accept: 'application/xml,text/xml,*/*',
            },
            timeout: {
              request: 30000,
              connect: 10000,
            },
            followRedirect: true,
          }),
          fs.createWriteStream(fullPathName),
        )

        this.logger.log(
          `File downloaded successfully to ${destination} on attempt ${attempt + 1}`,
          'DownloadService',
        )
        return
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        this.logger.warn(
          `Attempt ${attempt + 1} failed: ${errorMessage}`,
          'DownloadService',
        )

        // 如果是最后一次尝试，抛出错误
        if (attempt === userAgents.length - 1) {
          this.logger.error(
            `All download attempts failed for ${url}: ${errorMessage}`,
            'DownloadService',
          )
          throw new Error(
            `Download failed after ${userAgents.length} attempts: ${errorMessage}`,
          )
        }

        // 等待一段时间后重试
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1)),
        )
      }
    }
  }

  async xml2json(xmlUrl: string): Promise<EPG_XML | null> {
    const options = {
      attributeNamePrefix: '',
      ignoreAttributes: false,
      parseNodeValue: true,
      parseAttributeValue: true,
      trimValues: true,
      parseTrueNumberOnly: false,
      arrayMode: false,
      stopNodes: ['parse-me-as-string'],
    }
    const xmlContent = await readFile(xmlUrl, {
      encoding: 'utf-8',
    }).catch((error) => {
      this.logger.error(`Error reading file: ${xmlUrl}, ${error}`)
    })
    if (xmlContent) {
      try {
        const xmlParser = new XMLParser(options)
        return xmlParser.parse(xmlContent) as EPG_XML
      } catch (error) {
        this.logger.error(`Error parsing xml: ${xmlUrl}, ${error}`)
        return null
      }
    }
    return null
  }
  chunk<T>(array: T[], size: number): T[][] {
    const result: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size))
    }
    return result
  }

  /**
   * 解析 EPG 时间格式 (yyyyMMddHHmmss +ZZZZ)
   * 例如: "20250709004500 +0800"
   */
  parseEpgTime(timeStr: string): Date {
    try {
      // 分割时间字符串和时区
      const [dateTimeStr, timezoneStr] = timeStr.split(' ')

      // 解析 yyyyMMddHHmmss 格式
      const year = dateTimeStr.substring(0, 4)
      const month = dateTimeStr.substring(4, 6)
      const day = dateTimeStr.substring(6, 8)
      const hour = dateTimeStr.substring(8, 10)
      const minute = dateTimeStr.substring(10, 12)
      const second = dateTimeStr.substring(12, 14)

      // 格式化时区字符串 (+0800 -> +08:00)
      const formattedTimezone = timezoneStr.replace(
        /(\+|-)(\d{2})(\d{2})/,
        '$1$2:$3',
      )

      // 格式化为 ISO 字符串格式
      const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}${formattedTimezone}`

      // 使用 dayjs 解析并转换为 Date 对象
      const date = dayjs(isoString).toDate()

      // 验证日期是否有效
      if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${timeStr}`)
      }

      return date
    } catch (error) {
      console.error(`Failed to parse EPG time: ${timeStr}`, error)
      // 返回当前时间作为后备方案
      return new Date()
    }
  }
}
