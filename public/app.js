const formulario = document.getElementById('formulario-aparelhos');
const listaAparelhos = document.getElementById('lista-aparelhos');
const botaoAdicionar = document.getElementById('adicionar-aparelho');
const secaoResultados = document.getElementById('resultados');
const mensagem = document.getElementById('mensagem');

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function formatarNumero(valor) {
    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function adicionarAparelho() {
    let quantidade = listaAparelhos.children.length + 1;

    let novoAparelho = document.createElement('div');
    novoAparelho.className = 'aparelho';

    novoAparelho.innerHTML = `
        <div class="aparelho-cabecalho">
            <div class="aparelho-titulo">
                <span class="numero-aparelho">${String(quantidade).padStart(2, '0')}</span>

                <div>
                    <h4>Aparelho ${quantidade}</h4>
                    <p>Dados do equipamento</p>
                </div>
            </div>
        </div>

        <div class="campos-aparelho">
            <div class="campo campo-nome">
                <label for="nome-${quantidade}">Nome do aparelho</label>
                <input type="text" id="nome-${quantidade}" name="nome"
                    placeholder="Ex.: Televisão" maxlength="100" required>
            </div>

            <div class="campo">
                <label for="potencia-${quantidade}">Potência (W)</label>
                <div class="campo-unidade">
                    <input type="number" id="potencia-${quantidade}" name="potenciaW"
                        min="1" max="10000" step="any" placeholder="150" required>
                    <span>W</span>
                </div>
            </div>

            <div class="campo">
                <label for="horas-${quantidade}">Horas por dia</label>
                <div class="campo-unidade">
                    <input type="number" id="horas-${quantidade}" name="horasDia"
                        min="0" max="24" step="any" placeholder="8" required>
                    <span>h/dia</span>
                </div>
            </div>

            <div class="campo">
                <label for="dias-${quantidade}">Dias por mês</label>
                <div class="campo-unidade">
                    <input type="number" id="dias-${quantidade}" name="diasMes"
                        min="1" max="31" step="1" placeholder="30" required>
                    <span>dias</span>
                </div>
            </div>
        </div>
    `;

    listaAparelhos.appendChild(novoAparelho);
}

botaoAdicionar.addEventListener('click', adicionarAparelho);

function pegarAparelhos() {
    let aparelhos = listaAparelhos.children;
    let lista = [];

    for (let i = 0; i < aparelhos.length; i++) {
        let aparelho = aparelhos[i];

        let nome = aparelho.querySelector('[name="nome"]').value;
        let potencia = Number(aparelho.querySelector('[name="potenciaW"]').value);
        let horas = Number(aparelho.querySelector('[name="horasDia"]').value);
        let dias = Number(aparelho.querySelector('[name="diasMes"]').value);

        let dadosAparelho = {
            nome: nome,
            potenciaW: potencia,
            horasDia: horas,
            diasMes: dias
        };

        lista.push(dadosAparelho);
    }

    return lista;
}

formulario.addEventListener('submit', async function(event) {
    event.preventDefault();

    let aparelhos = pegarAparelhos();

    try {
        let resposta = await fetch('/api/simular', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                aparelhos: aparelhos
            })
        });

        let resultado = await resposta.json();

        if (!resposta.ok) {
            mensagem.textContent = resultado.erro;
            secaoResultados.hidden = true;
            return;
        }

        mensagem.textContent = 'Simulação realizada com sucesso!';

        console.log(resultado);

    } catch (erro) {
        mensagem.textContent = 'Erro ao conectar com o servidor.';
        console.log(erro);
    }
});

function mostrarResultados(resultado) {
    secaoResultados.hidden = false;

    document.getElementById('consumo-total').textContent =
        formatarNumero(resultado.consumoKwhMes) + ' kWh';

    document.getElementById('custo-energia').textContent =
        formatarMoeda(resultado.custoEnergia);

    document.getElementById('adicional-bandeira').textContent =
        formatarMoeda(resultado.adicionalBandeira);

    document.getElementById('total-mes').textContent =
        formatarMoeda(resultado.totalMes);

    document.getElementById('paineis-necessarios').textContent =
        resultado.paineisNecessarios;

    let aparelhoCaro = document.getElementById('aparelho-mais-caro');

    if (resultado.aparelhoMaisCaro !== null) {
        aparelhoCaro.textContent =
            resultado.aparelhoMaisCaro.nome + ' — ' +
            formatarMoeda(resultado.aparelhoMaisCaro.custo);
    }

    let tabela = document.getElementById('tabela-aparelhos');
    tabela.innerHTML = '';

    for (let i = 0; i < resultado.detalhes.length; i++) {
        let aparelho = resultado.detalhes[i];

        let linha = document.createElement('tr');

        let colunaNome = document.createElement('td');
        colunaNome.textContent = aparelho.nome;

        let colunaConsumo = document.createElement('td');
        colunaConsumo.textContent = formatarNumero(aparelho.kwhMes) + ' kWh';

        let colunaCusto = document.createElement('td');
        colunaCusto.textContent = formatarMoeda(aparelho.custo);

        let colunaPercentual = document.createElement('td');
        colunaPercentual.textContent = formatarNumero(aparelho.percentual) + '%';

        linha.appendChild(colunaNome);
        linha.appendChild(colunaConsumo);
        linha.appendChild(colunaCusto);
        linha.appendChild(colunaPercentual);

        tabela.appendChild(linha);
    }

    secaoResultados.scrollIntoView({
        behavior: 'smooth'
    });
}