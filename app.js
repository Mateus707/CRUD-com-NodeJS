// console.log('hello world')

//importar modulo express 
const express = require('express');

//importar modulo fileupload
const fileupload = require('express-fileupload')
//importar modulo express-handlebars
const {engine} = require('express-handlebars')

//importar modulo mysql
const mysql = require('mysql2');

const fs = require('fs');
//app
const app = express();

//habilitanto o upload de arquivos 
app.use(fileupload());
//adicionando bootstrap
app.use('/bootstrap',express.static('./node_modules/bootstrap/dist'))

//adicionando css
app.use('/css',express.static('./css'))

//refereciano a pasta de imagens
app.use('/img',express.static('./img'))

//configurando o express-handlebars
app.engine('handlebars', engine({
    helpers : {
        //função para verificar se os parametros são iguais em valor e tipo
        condicionaligualdade:function(p1,p2,options){
           return p1 === p2 ? options.fn(this) : options.inverse(this);
        }
     }//docker run -d --name node_app --network bridge -p 8080:8080 nome_da_imagemdocker
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

//manipulação de dados via rotas
app.use(express.json());
app.use(express.urlencoded({extended:false}));
//conexao banco de dados
const conexao = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'2552',
    database:'dbcrud_nodejs',
    port: 3306
});

//testando conexão
conexao.connect((erro)=>{
    if(erro) throw erro;
    console.log('conexao realizada com sucesso e voce é gay')
});

//criando uma rota
// app.get('/',function(req,res){
//     res.write('Hello World!');
//     res.end();
// });

app.get('/',function(req,res){
    let sql = `SELECT * from produtos`;
    conexao.query(sql,function(erro,retorno){
        res.render('formulario',{produtos:retorno,situacao:req.query.situacao})
});
});


app.post('/cadastrar',function(req,res){
    try {
        let nomeProduto = req.body.nomeProduto;
        let valorProduto = req.body.valorProduto;
        let imagemProduto = req.files['imagemProduto'].name;
        
        if(!nomeProduto  || !valorProduto  || isNaN(valorProduto) || valorProduto.includes('e')){
            res.redirect('/?situacao=erro');
            
        }
        else{
              //sql 
        let sql = `INSERT INTO produtos (nomeProduto,valorProduto,imagemProduto) VALUES('${nomeProduto}','${valorProduto}','${imagemProduto}')`;
        //executar comando sql
        conexao.query(sql,function(erro,retorno){
            //caso erro
            if(erro) throw erro;
            //caso certo      
        try {
            if(req.files){
                req.files['imagemProduto'].mv(__dirname+'/img/'+req.files['imagemProduto'].name);
                console.log(retorno)
                }
            res.redirect(`/?situacao=Sucesso`)
        } catch (error) {
            res.write('imagem pae')
        }
    });
        }
    } catch (error) {
        res.redirect('/?situacao=erroCadastro');
        console.log(error);
    }
});


app.get('/remover/:idProduto&:imagemProduto',function(req,res){
 try {
    console.log(req.params.idProduto);
    console.log(req.params.imagemProduto);
    let sql = `DELETE FROM produtos WHERE idProduto = ${req.params.idProduto}`;
    conexao.query(sql,function(erro,retorno){
        if(erro) throw erro;

        console.log('deletado com sucesso')
        fs.unlink(__dirname+'/img/'+req.params.imagemProduto,(penis_imagem)=>{
            console.log('erro na remoção da img')
        });

        res.redirect('/?situacao=removido');
    }); 
 } catch (error) {
    res.redirect('/?situacao=erro');
 }   
});

app.get('/formularioEditar/:idProduto',function(req,res){
    console.log(req.params.idProduto);
    let sql = `SELECT * from produtos where idProduto = ${req.params.idProduto}`;
    conexao.query(sql,function(erro,retorno){
        if(erro) throw erro;

        res.render('formularioEditar',{produtos:retorno[0]});
});
  
});
app.post('/atualizar',function(req,res){

    let idProduto = req.body.idProduto;
    let nomeProduto = req.body.nomeProduto;
    let valorProduto = req.body.valorProduto;
    let nomeImagem = req.body.imagemProduto;

    if(!nomeProduto  || !valorProduto  || isNaN(valorProduto) || valorProduto.includes('e')){
        res.redirect('/?situacao=erroeditar');
    }  
    else{
    try {
            let imagemProduto = req.files['imagemProduto'];
            let sql =  `UPDATE produtos SET nomeProduto = '${nomeProduto}', valorProduto = '${valorProduto}',imagemProduto = '${imagemProduto.name}' where idProduto='${idProduto}'`;

            conexao.query(sql,function(erro,retorno){
                if(erro) throw erro;
                console.log('erro no try')
                fs.unlink(__dirname+'/img/'+nomeImagem,(erro_img)=>{
                    console.log('erro na remoção da img')
                });
                imagemProduto.mv(__dirname+'/img/'+imagemProduto.name);
                
            });  
           } catch (error) {
            let sql =  `UPDATE produtos SET nomeProduto = '${nomeProduto}', valorProduto = '${valorProduto}' where idProduto='${idProduto}'`;
            conexao.query(sql,function(erro,retorno){ 
                if(erro) throw erro;
                console.log('erro antes do redirect')
            });  
        }
        res.redirect('/?situacao=atualizado');
    }   
        
});

//criando servidor
app.listen(8080);
