const express = require('express')
const app = express()
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const admin = require('./routes/admin')
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
require('./models/Postagem')
const Postagem = mongoose.model("postagens")
require('./models/Categoria')
const Categoria = mongoose.model("categorias")
const usuarios = require("./routes/usuario")
const passport = require('passport')
require('./config/auth')(passport)

const porta = 3000

app.use(session({
    secret: "cursoDeNode",
    resolve: true,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req,res,next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null
    next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

app.use(express.static(path.join(__dirname,"public")))

app.use('/admin', admin)
app.use('/usuarios', usuarios)

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/blogapp', {
    useNewUrlParser: true
})
    .then(() => console.log('Conectado ao mongo'))
    .catch(err => console.log(`Erro ao se conectar com o mongo -> ${err}`))

app.get('/', (req,res) => {
    Postagem.find().lean().sort({data: "desc"})
        .then(postagens => {res.render('index', {postagens}) })
        .catch(err => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
})

app.get('/postagem/:slug', (req,res) => {
    const slug = req.params.slug
    Postagem.findOne({slug})
        .then(postagem => {
            if(postagem){
                const post = {
                    titulo: postagem.titulo,
                    data: postagem.data,
                    conteudo: postagem.conteudo
                }
                res.render('postagem/index', post)
            }else{
                req.flash("error_msg", "Essa postagem nao existe")
                res.redirect("/")
            }
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
})

app.get("/404", (req,res) => {
    res.send("Erro 404")
})

app.get('/categorias/:slug', (req,res) => {
    const slug = req.params.slug
    Categoria.findOne({slug}).lean()
        .then(categoria => {
            if(categoria){
                Postagem.find({categoria}).lean()
                    .then(postagens => {
                        res.render("categorias/postagens",  {postagens, categoria})
                    })
                    .catch(err => {
                        req.flash("error_msg", "Houve um erro ao listar os posts")
                        res.redirect("/")
                    })
            }else{
                req.flash("error_msg", "Essa categoria não existe")
                res.redirect('/')
            }
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria")
            res.redirect("/")
        })
})


app.get('/categorias', (req,res) => {
    Categoria.find().lean()
    .then(categorias => {
        res.render('categorias/index', {categorias})
    })
    .catch(err => {
        req.flash("error_msg", "Houve um erro interno ao listar as categorias")
        res.redirect("/")
    })
})

app.listen(porta, () => {
    console.log(`Programa executando na porta ${porta}`)
})