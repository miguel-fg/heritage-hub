import { ENV } from '../env'
import app from './app'

const PORT = ENV.PORT

app.listen(PORT, () => {
  console.log(`[server]: Server is running on PORT: ${PORT}`)
})
