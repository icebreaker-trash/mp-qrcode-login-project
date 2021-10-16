import { Router } from 'express'
import axios from 'axios'

import { db } from './tcb/database.js'
const router = Router()

const tokenCol = db.collection('accessToken')

const appid = ''
const secret = ''
async function getAccessTokenByHttp() {
  const { data } = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`)
  return data
}
async function getAccessToken() {
  const { data } = await tokenCol.where({
    appid
  }).limit(1).get()
  const ts = Date.now()
  if (data.length) {
    const hit = data[0]

    if (ts < hit.expiresIn) {
      return hit.accessToken
    } else {
      const data = await getAccessTokenByHttp()

      await tokenCol.doc(hit._id).update({
        appid,
        accessToken: data.access_token,
        expiresIn: ts + data.expires_in * 1000
      })
      return data.access_token
    }
  } else {
    const data = await getAccessTokenByHttp()

    await tokenCol.add({
      appid,
      accessToken: data.access_token,
      expiresIn: ts + data.expires_in * 1000
    })
    return data.access_token
  }
}

router.post('/blog-mp', async (req, res) => {
  const { scene = '', page } = req.body
  const accessToken = await getAccessToken()
  const res1 = await axios.post('https://api.weixin.qq.com/wxa/getwxacodeunlimit', {
    scene,
    page: page || 'pages/index/wsLogin'
  }, {
    params: {
      access_token: accessToken
    },
    responseType: 'arraybuffer'
  })
  const buf = res1.data
  res.send('data:' + res1.headers['content-type'] + ';base64,' + buf.toString('base64'))
})

export default router
