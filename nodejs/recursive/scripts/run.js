'use strict'

import axios from 'axios'

import logger from './../common/helpers/logger.js'
import { sleep } from './../common/helpers/sleep.js'

const URL = 'http://localhost:1203'

async function getData(id, name) {
  debugger
  logger.info(`params: ${id}, ${name}`)
  return axios.get(`${URL}/data`)
}

async function postData(body) {
  debugger
  logger.info(`body: ${JSON.stringify(body)}`)
  return axios.post(`${URL}/data`, body)
}

async function recursiveFn(callback, tries, ...params) {
  if (tries === 0) {
    throw new Error('All request tries failed');
  }

  const res = await callback.apply(this, params)
  logger.info(`response: ${JSON.stringify(res.data)}`)

  await sleep(500)

  await recursiveFn(callback, tries - 1, params)

  logger.info(tries - 1)
}

;(async () => {
  const body = { name: 'Balu', age: 27 }

  return Promise.all([
   recursiveFn(getData, 3, 1, 'balu'),
   recursiveFn(postData, 3, body)
  ])
})()

