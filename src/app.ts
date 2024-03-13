/* eslint-disable import/extensions */
import 'dotenv/config.js'

import {
  Contact,
  Message,
  ScanStatus,
  WechatyBuilder,
  log,
}                  from 'wechaty'

import qrcodeTerminal from 'qrcode-terminal'
import { getFixedAnswer } from './utils/fixed-answers.js'
import { askQwen, type QwenMessage } from './utils/ai.js'
import { getSavedMessage, saveMessage } from './utils/index.js'

function onScan (qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(qrcode),
    ].join('')
    log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)

    qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console

  } else {
    log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
  }
}

function onLogin (user: Contact) {
  log.info('StarterBot', '%s login', user)
}

function onLogout (user: Contact) {
  log.info('StarterBot', '%s logout', user)
}

async function getQwenAnswer (question: string, wxid: string) {
  if (!question) {
    return '你说什么？我听不懂'
  }
  // 如果用户输入的是固定回答的关键词，直接回复
  const fixedAnswer = getFixedAnswer(question)
  if (fixedAnswer) {
    return fixedAnswer
  }
  // 获取用户之前的对话记录，然后调用AI接口进行对话
  const savedMessage = await getSavedMessage<QwenMessage>(wxid)
  // 拼接用户的新消息
  const newMessage: QwenMessage[] =  [ ...savedMessage, { content: question, role: 'user' } ]
  // 调用AI接口
  const { content, error, role } = await askQwen(newMessage)
  if (!error) {
    // 保存用户的对话记录
    await saveMessage(wxid, [ ...newMessage, { content, role } ])
  }
  // 给用户发送消息
  return content
}

async function onMessage (msg: Message) {
  let message = msg.text().trim()
  log.info('收到消息：', message)
  let wxid: string | undefined
  log.info('是否群消息：', msg.room())
  if (msg.room()) {
    const isMention = await msg.mentionSelf()
    log.info('是否@我', isMention)
    if (isMention) {
      wxid = msg.room()?.id
      const spliter = ' '
      message = (message.split(spliter)[1] || '').trim()
    }
  } else {
    wxid = msg.talker().id
  }
  if (wxid && !wxid.includes('weixin') && message) {
    const answer = await getQwenAnswer(message, wxid)
    // 给用户发送消息
    await msg.say(answer)
  }
}

const bot = WechatyBuilder.build({
  name: 'ding-dong-bot',
  /**
   * You can specific `puppet` and `puppetOptions` here with hard coding:
   *
  puppet: 'wechaty-puppet-wechat',
  puppetOptions: {
    uos: true,
  },
   */
  /**
   * How to set Wechaty Puppet Provider:
   *
   *  1. Specify a `puppet` option when instantiating Wechaty. (like `{ puppet: 'wechaty-puppet-whatsapp' }`, see below)
   *  1. Set the `WECHATY_PUPPET` environment variable to the puppet NPM module name. (like `wechaty-puppet-whatsapp`)
   *
   * You can use the following providers locally:
   *  - wechaty-puppet-wechat (web protocol, no token required)
   *  - wechaty-puppet-whatsapp (web protocol, no token required)
   *  - wechaty-puppet-padlocal (pad protocol, token required)
   *  - etc. see: <https://wechaty.js.org/docs/puppet-providers/>
   */
  // puppet: 'wechaty-puppet-whatsapp'

  /**
   * You can use wechaty puppet provider 'wechaty-puppet-service'
   *   which can connect to remote Wechaty Puppet Services
   *   for using more powerful protocol.
   * Learn more about services (and TOKEN) from https://wechaty.js.org/docs/puppet-services/
   */
  // puppet: 'wechaty-puppet-service'
  // puppetOptions: {
  //   token: 'xxx',
  // }
})

bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('logout',  onLogout)
bot.on('message', onMessage)

bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))
