import express from 'express'
import runGraph from './ai/graph.ai.js'

const app = express()

app.get('/', async (req, res) => {
    try {
        const result = await runGraph('when is monaco gp gonna happen?')
        res.json(result)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'something exploded 💀' })
    }
})

export default app