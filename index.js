const express = require('express');
const cors = require('cors');
const { pool } = require('./config');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const getLivros = async (request, response) => {
    try {
        const { rows } = await pool.query(`
        SELECT codigo, titulo, autor, estoque, valor, vendas
        FROM livros ORDER BY codigo
      `);
        return response.status(200).json(rows);
    } catch (err) {
        return response.status(400).json({ status: 'error', message: 'Erro ao consultar os livros: ' + err });
    }
};

const addLivro = async (request, response) => {
    try {
        const { titulo, autor, estoque, valor, vendas } = request.body;
        const results = await pool.query(`
            INSERT INTO livros (titulo, autor, estoque, valor, vendas) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING codigo, titulo, autor, estoque, valor, vendas
        `, [titulo, autor, estoque, valor, vendas]);
        const linhaInserida = results.rows[0];
        return response.status(201).json({ status: 'success', message: 'Livro adicionado com sucesso!', objeto: linhaInserida });
    } catch (err) {
        return response.status(400).json({ status: 'error', message: 'Erro ao adicionar o livro: ' + err });
    }
};

const updateLivro = async (request, response) => {
    try {
        const { codigo, titulo, autor, estoque, valor, vendas } = request.body;
        const results = await pool.query(`
        UPDATE livros
        SET titulo = $2, autor = $3, estoque = $4, valor = $5 , vendas = $6
        WHERE codigo = $1
        RETURNING codigo, titulo, autor, estoque, valor, vendas
      `, [codigo, titulo, autor, estoque, valor, vendas]);

        if (results.rowCount == 0) {
            return response.status(404).json({ status: 'error 404', message: `Livro com código ${codigo} não encontrado!` });
        } else {
            const livroAlterado = results.rows[0];
            return response.status(200).json({ status: 'success', message: 'Livro atualizado com sucesso!', objeto: livroAlterado });
        }
    } catch (err) {
        return response.status(400).json({ status: 'error', message: `Livro com código ${codigo} não encontrado!` + ' Erro ao atualizar o livro: ' + err });
    }
};

const deleteLivro = async (request, response) => {
    const codigo = request.params.codigo;
    try {

        const results = await pool.query(`DELETE FROM livros WHERE codigo = $1`, [codigo]);

        if (results.rowCount == 0) {
            return response.status(404).json({ status: 'error', message: `Livro com código ${codigo} não encontrado` });
        } else {
            return response.status(200).json({ status: 'success', message: `Livro com código ${codigo} deletado com sucesso!`});
        }
    } catch (err) {
        return response.status(400).json({ status: 'error', message: 'Erro ao deletar o livro: ' + err });
    }
};

const getLivrosPorCodigo = async (request, response) => {
    const codigo = request.params.codigo;
    try {
        const results = await pool.query(`
        SELECT codigo, titulo, autor, estoque, valor, vendas
        FROM livros WHERE codigo = $1 
      `, [codigo]);

        if (results.rowCount == 0) {
            return response.status(404).json({ status: 'error', message: `Livro com código ${codigo} não encontrado` });
        } else {
            const livroEncontrado = results.rows[0];
            return response.status(200).json({ status: 'success', message: 'Livro com encontrado!', objeto: livroEncontrado});
            
        }
    } catch (err) {
        return response.status(400).json({ status: 'error', message: 'Erro ao consultar o livro: ' + err });
    }
};

app.route('/livros')
    .get(getLivros)
    .post(addLivro)
    .put(updateLivro)

app.route('/livros/:codigo')
    .get(getLivrosPorCodigo)
    .delete(deleteLivro);

app.listen(process.env.PORT || 3002, () => {
    console.log('Servidor da API - Livraria rodando na porta 3002 ✅');
});