const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require("bcryptjs")
const passport = require('passport')

router.get("/registro", (req,res) => {
    res.render("usuarios/registro")
})

router.post("/registro", (req,res) => {
    let erros = []

    const nome = req.body.nome
    const email = req.body.email
    const senha = req.body.senha
    const senha2 = req.body.senha2

    if(!nome){
        erros.push({texto: "Nome inválido"})

    }else if(!email){
        erros.push({texto: "Email inválido"})
    }else if(!senha){
        erros.push({texto: "Senha inválida"})
    }else if(senha.length < 4){
        erros.push({texto: "Senha muito curta"})
    }else if(senha !== senha2){
        erros.push({texto: "As senhas são diferentes, digite duas senhas iguais"})
    }

    if(erros.length > 0){
        res.render("usuarios/registro", {erros})
    }else{
        Usuario.findOne({email: req.body.email}).lean()
            .then(usuario => {
                if(usuario){
                    req.flash("error_msg", "Já existe uma conta cadastrada com esse email")
                    res.redirect("/usuarios/registro")
                }
                else{
                    const novoUsuario = new Usuario({nome, email, senha})
            bcrypt.genSalt(10,(erro, salt) => {
                bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                    if(erro){
                        req.flash("error_msg", "Houve um erro durante o salvamento do usuario")
                        res.redirect("/")
                    }

                    novoUsuario.senha = hash
                    novoUsuario
                        .save()
                        .then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso")
                            res.redirect("/")
                        })
                        .catch(err => {
                            req.flash("error_msg", "Houve um erro durante o cadastro do usuario")
                            res.redirect("/")
                        })
                })
            })
                }
            })
            .catch(err => {
                req.flash("error_msg", "Ocorreu um erro tente novamente")
                res.redirect('/')
            })
    }
})

router.get("/login", (req,res) => {
    res.render("usuarios/login")
})

router.post("/login", (req,res,next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
       
    })(req,res,next)
})

router.get("/logout", (req,res) => {
    req.logout()
    req.flash("success_msg", "Deslogado com sucesso")
    res.redirect("/")
})

module.exports = router