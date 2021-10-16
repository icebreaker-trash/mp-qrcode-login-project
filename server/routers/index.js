
import { Router } from 'express'
import bodyParser from 'body-parser'

import qrcode from './qrcode.js'
const { json } = bodyParser
const router = Router()
router.use(json())

router.use('/qrcode', qrcode)
export default router
