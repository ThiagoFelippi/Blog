const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin')

router.get('/', eAdmin, (req,res) => {
    res.render("admin/index")
})

router.get('/posts', eAdmin, (req,res) => {
    res.send('Pagina de posts')
})

router.get('/categorias', eAdmin, (req,res) => {
    Categoria.find().lean().sort({date: 'desc'})
        .then(categorias => res.render('admin/categorias', {categorias}))
        .catch(err => res.flash("error_msg", "Ouve um erro ao listar as categorias"))
   
})

router.get('/categorias/add', eAdmin, (req,res) => {
    res.render('admin/addcategorias')
})

router.get('/categorias/edit/:id', eAdmin, (req,res) => {
    const id = req.params.id
    Categoria.findOne({_id: id}).lean()
        .then(categoria => {
            res.render('admin/editcategorias', {categoria})
        })
})

router.post('/categorias/edit', eAdmin, (req,res) => {
    const id = req.body.id
    const nome = req.body.nome
    const slug = req.body.slug
    Categoria.findOne({_id: id})
        .then(categoria => {
            categoria.nome = nome
            categoria.slug = slug
            categoria
                .save()
                .then(() => {
                    req.flash("success_msg", "Categoria cadastrada com sucesso")
                    res.redirect('/admin/categorias')
                })
        })
})

router.post('/categorias/deletar', eAdmin, (req,res) => {
    const id = req.body.id
    Categoria.remove({_id: id})
        .then(() => {
            req.flash("success_msg", "Categoria deletada com sucesso")
            res.redirect('/admin/categorias')
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro ao deleta a categoria")
            res.redirect('/admin/categorias')
        })
})

router.post('/categorias/nova', eAdmin, (req,res) => {
    const nome = req.body.nome
    const slug = req.body.slug
    const erros = []

    if(!nome || !slug){
        erros.push({texto: 'Por favor preencha todos os campos'})
    }else{
        if(nome.length < 3 || slug.length < 3){
            erros.push({texto: "Digite um nome ou slug maior"})
        }
    }

    if(erros.length != 0){
        res.render("admin/addcategorias", {erros})
    }else{
        const Dados = {
            nome,
            slug
        }
    
        new Categoria(Dados)
            .save()
            .then(() => {
                req.flash("success_msg", "Categoria registrada com suceso")
                res.redirect("/admin/categorias")
            })
            .catch(err => {
                req.flash("error_msg", "Erro ao registrar nova categoria")
                res.redirect('/admin')
            })
    }
})

router.get('/postagens', eAdmin, (req,res) => {
    Postagem.find().lean().sort({data: "desc"})
        .then(postagens => {
            res.render('admin/postagens', {postagens})
        })
        .catch(() => {
            req.flash("error_msg", "Houve um erro ao lsitar as postagens")
            res.redirect('/admin/postagens')
        })
})

router.get('/postagens/add', eAdmin, (req,res) => {
    Categoria.find().lean()
        .then(categorias => {res.render('admin/addpostagem', {categorias})})
})

router.post('/postagens/nova', eAdmin, (req,res) => {
    let erro = []

    const titulo = req.body.titulo
    const slug = req.body.slug
    const descricao = req.body.descricao
    const conteudo = req.body.conteudo
    const categoria = req.body.categoria

    if(categoria === 0){
        erros.push({texto: "Categoria inválida, por favor cadastre uma categoria antes de cadastrar uma postagem"})
    }

    if(erro.length > 0){
        res.render("admin/addpostagem", {erros: erro})
    }else{
        const novaPostagem = { titulo, slug, descricao, conteudo, categoria}
        new Postagem(novaPostagem)
            .save()
            .then(() => {
                req.flash("success_msg", "Postagem criada com sucesso")
                res.redirect("/admin/postagens")
            })
            .catch(err => {
                req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
                res.redirect('/admin/postagens')
            })
    }
})

router.get('/postagens/edit/:id', eAdmin, (req,res) => {
    const id = req.params.id
    Postagem.findOne({_id : id}).lean()
        .then(postagem => {
            Categoria.find().lean()
                .then(categorias => {
                    res.render("admin/editpostagens", {categorias, postagem})
                })
                .catch(err => {
                    req.flash("error_msg", "Houve um erro ao listar as categorias")
                    res.redirect("/admin/postagens")
                })
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
            res.redirect('/admin/postagens')
        }) 
})

router.post("/postagem/edit", eAdmin, (req,res) => {
    const id = req.body.id
    const nome = req.body.titulo
    const slug = req.body.slug
    const descricao = req.body.descricao
    const conteudo = req.body.conteudo
    const categoria = req.body.categoria

    Postagem.findOne({_id: id})
        .then(postagem => {
            postagem.titulo = nome
            postagem.slug = slug
            postagem.descricao = descricao
            postagem.nome = nome
            postagem.conteudo = conteudo
            postagem.categoria = categoria

            postagem
                .save()
                .then(() => {
                    req.flash("success_msg", "Postagem editada com sucesso")
                    res.redirect("/admin/postagens")
                })
                .catch(() => {
                    req.flash("error_msg", "Erro ao editar a postagem")
                    res.redirect("/admin/postagens")
                })
        })
        .catch(err => {
            req.flash(erro => {
                req.flash("error_msg", "Erro -> Postagem inválida")
                res.redirect("/admin/postagens")
            })
        })
})

router.get("/postagens/remover/:id", eAdmin, (req,res) => {
    const id = req.params.id
    Postagem.remove({_id: id})
        .then(() => {
            req.flash("success_msg", "Postagem removida com sucesso")
            res.redirect('/admin/postagens')
        })
        .catch(err => {
            req.flash("error_msg", "Erro ao deletar a postagem")
            res.redirect("/admin/postagens")
        })
})

module.exports = router

