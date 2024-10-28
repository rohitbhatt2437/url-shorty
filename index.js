const express = require('express')
const app = express()
const path = require('path')

const PORT = 8000

const urlRoute = require('./routes/url')
const {connectToMongodb} = require('./connect')
const URL = require('./models/url')
const staticRoute = require('./routes/staticRouter')


connectToMongodb('mongodb://localhost:27017/short-url').
then(()=>console.log("mongodb connected"))

app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.set('view engine', 'ejs')
app.set('views', path.resolve('./views'))

app.use('/', staticRoute)

app.get('/test', async (req, res)=>{
    const allUrls = await URL.find({})
    return res.render('home', {
        urls:allUrls,
    })
})

app.use('/url', urlRoute)
app.get('/url/:shortId', async (req,res)=>{
    const shortId = req.params.shortId
    const entry = await URL.findOneAndUpdate({
        shortId
    }, {$push:{
        visitHistory: {
            timestamp: Date.now()
        }
    }})
    res.redirect(entry.redirectURL)
})

app.listen(PORT, ()=> console.log(`Server started on port: ${PORT}`))