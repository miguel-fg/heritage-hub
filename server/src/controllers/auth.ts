import { Request, Response } from 'express'
import {
  createOneTimeCode,
  getCASServiceURL,
  getFrontendURL,
} from '../scripts/auth'
import axios from 'axios'
import prisma from '../services/prisma'
import { v4 as uuidv4 } from 'uuid'
import { parseStringPromise } from 'xml2js'

export const redirectCAS = (_req: Request, res: Response) => {
  const serviceURL = getCASServiceURL()

  if (!serviceURL) {
    res.status(500).json({
      error: `[server]: CAS service URLs not configured.`,
    })
    return
  }

  const URL = `https://cas.sfu.ca/cas/login?service=${encodeURIComponent(serviceURL)}`
  res.redirect(URL)
}

export const validateCASTicket = async (req: Request, res: Response) => {
  const ticket = req.query.ticket as string
  const serviceURL = getCASServiceURL()
  const frontendURL = getFrontendURL()

  if (!ticket) {
    res.status(400).send('Missing CAS ticket')
    return
  }

  if (!serviceURL || !frontendURL) {
    res.status(400).send('Server URLs not configured')
    return
  }

  try {
    const CAS_BASE = 'https://cas.sfu.ca/cas'

    const { data } = await axios.get(
      `${CAS_BASE}/serviceValidate?service=${encodeURIComponent(serviceURL)}&ticket=${encodeURIComponent(ticket)}`,
    )

    const parsed = await parseStringPromise(data, { explicitArray: false })
    const success = parsed['cas:serviceResponse']['cas:authenticationSuccess']

    if (!success) {
      res.status(401).send('CAS auth failed')
      return
    }

    const casId = success['cas:user']
    const authType = success['cas:authtype']

    const user = await prisma.user.upsert({
      where: { casId },
      create: { id: uuidv4(), casId, authType },
      update: { authType },
    })

    const otc = await createOneTimeCode(user.id)

    res.redirect(`${frontendURL}/auth/callback?otc=${otc}`)
  } catch (err) {
    console.error(err)
    res.status(500).send('Internal error')
  }
}
