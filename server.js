const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');

const app = express();
const port = 8080;

const pool = new Pool({
    user: 'postgres',
    host: 'node-js-db',
    database: 'library',
    password: 'password',
    port: 5432,
});

app.get('/some-endpoint', (req, res) => {
    const number = req.query.number || 3;

    axios.get('https://dog-api.kinduff.com/api/facts', { params: { number: number } })
        .then(response => {
            if(response.data.success) {
                response.data.facts.forEach(fact => {
                    pool.query('INSERT INTO dog_facts (fact) VALUES ($1) ON CONFLICT DO NOTHING', [fact], (error, results) => {
                        if (error) {
                            console.log('Error occurred when inserting:', error);
                        }
                    });
                });
                res.json(response.data.facts);
            } else {
                res.status(500).send('Error retrieving the facts');
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error occurred');
        });
});

app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}`);
});