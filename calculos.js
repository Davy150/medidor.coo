
const cfg = require('./config');

function consumoMensalKwh(aparelho) {
    const consumo = aparelho.potenciaW * aparelho.horasDia * aparelho.diasMes / 1000;

    return consumo;
}

function custoEnergia(kwh) {
    const custo = kwh * cfg.TARIFA_KWH;

    return custo;
}


function adicionalBandeira(kwh) {
    const valor = cfg.VALORES_BANDEIRA[cfg.BANDEIRA];
    const adicional = (kwh / 100) * valor;

    return adicional;
}


function paineisNecessarios(kwh) {
    const geracaoPainel = (cfg.POTENCIA_PAINEL_W / 1000) *
        cfg.HSP * 30 * cfg.EFICIENCIA;

    const quantidade = Math.ceil(kwh / geracaoPainel);

    return quantidade;
}


function simular(aparelhos) {
    let consumoTotal = 0;
    const detalhes = [];


    for (let i = 0; i < aparelhos.length; i++) {
        const aparelho = aparelhos[i];

        const consumo = consumoMensalKwh(aparelho);
        const custo = custoEnergia(consumo);

        consumoTotal = consumoTotal + consumo;

        detalhes.push({
            nome: aparelho.nome,
            kwhMes: consumo,
            custo: custo,
            percentual: 0
        });
    }

  
    for (let i = 0; i < detalhes.length; i++) {
        if (consumoTotal > 0) {
            detalhes[i].percentual =
                (detalhes[i].kwhMes / consumoTotal) * 100;
        } else {
            detalhes[i].percentual = 0;
        }
    }


    let aparelhoMaisCaro = null;

    if (detalhes.length > 0) {
        aparelhoMaisCaro = {
            nome: detalhes[0].nome,
            custo: detalhes[0].custo
        };

        for (let i = 1; i < detalhes.length; i++) {
            if (detalhes[i].custo > aparelhoMaisCaro.custo) {
                aparelhoMaisCaro = {
                    nome: detalhes[i].nome,
                    custo: detalhes[i].custo
                };
            }
        }
    }

    const valorEnergia = custoEnergia(consumoTotal);
    const valorBandeira = adicionalBandeira(consumoTotal);
    const total = valorEnergia + valorBandeira;

    return {
        consumoKwhMes: consumoTotal,
        custoEnergia: valorEnergia,
        adicionalBandeira: valorBandeira,
        totalMes: total,
        paineisNecessarios: paineisNecessarios(consumoTotal),
        aparelhoMaisCaro: aparelhoMaisCaro,
        detalhes: detalhes
    };
}


module.exports = {
    consumoMensalKwh,
    custoEnergia,
    adicionalBandeira,
    paineisNecessarios,
    simular
};