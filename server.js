// use your .env file this time
require('dotenv').config()
const port = process.env.PORT || 4040

const express = require("express")
const app = express()

const jwt = require('jsonwebtoken')

// use middelware 
// to make our app work with json bodies that get send to it
app.use(express.json())

const posts = [
    {
        username: 'Alen',
        title: 'Blogpost 1'
    },
    {
       username: 'John',
       title: 'Blogpost 2' 
    },
    {
        username: 'Alen',
        title: 'Blogpost 2'
    },
]

app.get('/posts', authenticateToken, (req, res) => {
    console.log('loggedinUser: ', req.user.name)
    // res.json({ok: true, message: `hello ${req.user.name}`, posts})

    const filteredBlogPosts = posts.filter(post => post.username === req.user.name)
    res.json(filteredBlogPosts)
})

app.post('/login', (req, res) => {
    // we are gonna assume the user is properly authenticated here (credentials checked)
    // so we skip the authentication part (ignore)
    const username = req.body.username // normally you would authenticate first

    const user = { name: username }
    const accesstoken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)

    // res.json({ accesstoken: accesstoken }) // same as below
    res.json({ accesstoken })
})

// create a middleware (function) which authenticates the token for us
function authenticateToken(req, res, next) {
    // -> get the token that they send us (they: postman, browser, any client.. )
    // -> verify that the token is valid

    // our header will look like: Bearer eyJh.... (Postman token)
    const authHeader = req.headers['authorization']
    console.log('authHeader: ', authHeader)
    const token = authHeader && authHeader.split(' ')[1] // saves undefinded or the token
    console.log('token: ', token)
    if (token == null) return res.sendStatus(401)

    // if we make to this part here, we know we have a token
    // -> verify that token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userPayload) => {
        if (err) return res.status(403).json({ok: false, message: 'token is invalid'})

        // if we make it to this part here, we know we have a VALID token
        req.user = userPayload
        console.log("VALID req.user: ", req.user)
        next()
    }) 
    
}  

app.listen(port, () => console.log(`running on port ${port}`))