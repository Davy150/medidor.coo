const express = require('express');
const calculos = require('./calculos');

const app = express();
const PORTA = 3000;


app.use(express.json());


app.use(express.static('public'));


app.post('/api/simular', (req, res) => {
    const aparelhos = req.body.aparelhos;


    if (!Array.isArray(aparelhos) || aparelhos.length === 0) {
        return res.status(400).json({
            erro: 'Adicione pelo menos um aparelho.'
        });
    }

   
    for (let i = 0; i < aparelhos.length; i++) {
        const aparelho = aparelhos[i];

        if (!aparelho.nome || typeof aparelho.nome !== 'string' || aparelho.nome.trim() === '') {
            return res.status(400).json({
                erro: `O nome do aparelho ${i + 1} é obrigatório.`
            });
        }

        if (typeof aparelho.potenciaW !== 'number' || aparelho.potenciaW < 1 || aparelho.potenciaW > 10000) {
            return res.status(400).json({
                erro: `A potência do aparelho ${i + 1} deve ser um número entre 1 e 10000.`
            });
        }

        if (typeof aparelho.horasDia !== 'number' || aparelho.horasDia < 0 || aparelho.horasDia > 24) {
            return res.status(400).json({
                erro: `As horas de uso do aparelho ${i + 1} devem ficar entre 0 e 24.`
            });
        }

        if (!Number.isInteger(aparelho.diasMes) || aparelho.diasMes < 1 || aparelho.diasMes > 31) {
            return res.status(400).json({
                erro: `Os dias de uso do aparelho ${i + 1} devem ser um número inteiro entre 1 e 31.`
            });
        }
    }


    const resultado = calculos.simular(aparelhos);

    
    resultado.consumoKwhMes = arredondar(resultado.consumoKwhMes);
    resultado.custoEnergia = arredondar(resultado.custoEnergia);
    resultado.adicionalBandeira = arredondar(resultado.adicionalBandeira);
    resultado.totalMes = arredondar(resultado.totalMes);

    if (resultado.aparelhoMaisCaro !== null) {
        resultado.aparelhoMaisCaro.custo = arredondar(resultado.aparelhoMaisCaro.custo);
    }

    for (let i = 0; i < resultado.detalhes.length; i++) {
        resultado.detalhes[i].kwhMes = arredondar(resultado.detalhes[i].kwhMes);
        resultado.detalhes[i].custo = arredondar(resultado.detalhes[i].custo);
        resultado.detalhes[i].percentual = arredondar(resultado.detalhes[i].percentual);
    }


    res.json(resultado);
});

function arredondar(numero) {
    return Math.round(numero * 100) / 100;
}

app.listen(PORTA, () => {
    console.log(`Servidor funcionando em http://localhost:${PORTA}`);
});