import express from 'express'
import useGraph from './services/grap.ai.service.js'

const app = express()

//health check
app.get('/health',(req,res)=>{
    res.status(200).json({status : 'ok'})
})

//useGraph
app.post('/use-graph',async (req,res)=>{
    await useGraph('who is charles leclerc?')
})

export default app