import express, { Express } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import modelRoutes from './routes/model'
import tagRoutes from './routes/tag'
import materialRoutes from './routes/material'
import searchRoutes from './routes/search'
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import { checkOrigin } from './middleware/checkOrigin'

const app: Express = express()

const isProd = process.env.ENVIRONMENT === 'prod'

const prodOrigins = [
  'https://heritage-hub.ca',
  'https://heritage-hub-7h45.onrender.com',
]

const devOrigins = ['http://localhost:5173', ...prodOrigins]

const allowedOrigins = isProd ? prodOrigins : devOrigins

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
}

// middleware
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use(checkOrigin(allowedOrigins))
app.use(morgan('dev'))

// routes
app.use('/api/models', modelRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api/materials', materialRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/cas', authRoutes)
app.use('/api/user', userRoutes)

export default app
