import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mongoose from 'mongoose'
import { IncomingMessage, ServerResponse } from 'http'
import type { Plugin } from 'vite'
import type { RequestHandler } from 'express'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// For debugging - remove after fixing
console.log('MongoDB URI:', process.env.VITE_MONGODB_URI)

// MongoDB Schema
const TodoSchema = new mongoose.Schema({
  text: String,
  completed: Boolean,
  createdAt: { type: Date, default: Date.now }
})

type TodoDocument = mongoose.Document & {
  text: string;
  completed: boolean;
  createdAt: Date;
}

// MongoDB connection
const connectDB = async () => {
  const uri = process.env.VITE_MONGODB_URI
  if (!uri) {
    throw new Error('MongoDB URI is not defined in environment variables')
  }
  
  try {
    await mongoose.connect(uri)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  }
}

// Custom plugin for MongoDB middleware (development only)
const mongoMiddleware = (): Plugin => ({
  name: 'mongo-middleware',
  configureServer(server) {
    // Connect to MongoDB only in development
    connectDB()

    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
      // Set permissive CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', '*')
      res.setHeader('Access-Control-Allow-Headers', '*')
      res.setHeader('Access-Control-Allow-Private-Network', 'true')
      res.setHeader('Access-Control-Allow-Credentials', 'true')

      // Handle preflight
      if (req.method === 'OPTIONS') {
        res.writeHead(200)
        res.end()
        return
      }

      if (req.url?.startsWith('/api/todos')) {
        const Todo = (mongoose.models.Todo || mongoose.model('Todo', TodoSchema)) as mongoose.Model<TodoDocument>

        try {
          if (req.method === 'GET') {
            const todos = await Todo.find().sort({ createdAt: -1 }).exec()
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(todos))
            return
          }

          if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk: Buffer) => {
              body += chunk.toString()
            })
            req.on('end', async () => {
              try {
                const { text } = JSON.parse(body)
                const todo = new Todo({ text })
                const savedTodo = await todo.save()
                res.setHeader('Content-Type', 'application/json')
                res.writeHead(201)
                res.end(JSON.stringify(savedTodo))
              } catch (parseError) {
                res.writeHead(400)
                res.end(JSON.stringify({ error: 'Invalid request body' }))
              }
            })
            return
          }

          if (req.method === 'PUT') {
            const id = req.url.split('/').pop()
            const todo = await Todo.findByIdAndUpdate(
              id,
              { $set: { completed: { $not: '$completed' } } },
              { new: true }
            ).exec()
            
            if (todo) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(todo))
            } else {
              res.statusCode = 404
              res.end(JSON.stringify({ error: 'Todo not found' }))
            }
            return
          }

          if (req.method === 'DELETE') {
            const id = req.url.split('/').pop()
            const todo = await Todo.findByIdAndDelete(id).exec()
            if (todo) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(todo))
            } else {
              res.statusCode = 404
              res.end(JSON.stringify({ error: 'Todo not found' }))
            }
            return
          }

          // Method not allowed
          res.writeHead(405)
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        } catch (error) {
          console.error('API Error:', error)
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Internal server error' }))
          return
        }
      }
      next()
    })
  }
})

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [
    react(),
    // Only add mongoMiddleware in development mode
    command === 'serve' ? mongoMiddleware() : null
  ].filter(Boolean),
  server: {
    port: 5173,
    strictPort: true,
    cors: {
      origin: '*',
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', '*'],
      exposedHeaders: ['*'],
      preflightContinue: true,
      optionsSuccessStatus: 200
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5173',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  },
  preview: {
    port: 5173,
    strictPort: true,
    cors: true
  }
}))

