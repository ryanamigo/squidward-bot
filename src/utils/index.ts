import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

export const saveMessage = async <T>(wxid?: string, message?: Array<T>) => {
  if (!wxid || !message) {
    return
  }
  // 将文件保存到../../session-data/qwen/${wxid}.json
  const pathUrl = path.resolve(__dirname, `../../session-data/qwen/${wxid}.json`)
  // 如果文件不存在，会自动创建
  await fs.writeFile(pathUrl, JSON.stringify(message))
}

export const getSavedMessage = async <T>(wxid?: string) => {
  if (!wxid) {
    return []
  }
  const pathUrl = path.resolve(__dirname, `../../session-data/qwen/${wxid}.json`)
  try {
    const data = await fs.readFile(pathUrl, 'utf-8')
    return JSON.parse(data) as Array<T>
  } catch (error) {
    // 如果文件不存在，返回空数组
    return []
  }
}
