import Telegraf from 'telegraf'
import Telegram from 'telegraf/telegram'

import { isCurrentlyLeet } from './util'
import { rootRedux, counterUpdate } from './redux'
import { sendReminderIfLeet } from './timeout'

let state

const bot = (token, config, telegramOptions) => {
  const tg = new Telegram(token)
  const chatId = config.chatId

  // check every minute if reminder needs to be sent
  setInterval(() => {
    sendReminderIfLeet(chatId, tg)
  }, 60000)

  const bot = new Telegraf(token, telegramOptions)

  bot.start(ctx => {
    ctx.reply('Hallo i bims, 1 LeetBot. I zaehl euere Leetposts vong Heaufigkiet hern.')
  })

  bot.command('debug', ctx => {
    // Fucking timezones.
    let debug = `Leet-Time is ${config.leetHours + 1}:${config.leetMinutes}.\n`
    if (state === undefined) {
      debug += 'State not initialized.'
    } else {
      debug += JSON.stringify(state)
    }
    ctx.reply(debug)
  })

  bot.hears(/.*/, ctx => {
    if (isCurrentlyLeet()) {
      state = rootRedux(counterUpdate(ctx), state)
    }
  })

  bot.startPolling()

  return bot
}

export default bot
