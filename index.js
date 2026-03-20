let vendedores = JSON.parse(localStorage.getItem('vendedores')) || [];
let vendas = JSON.parse(localStorage.getItem('vendas')) || [];

function salvar() {
  localStorage.setItem('vendedores', JSON.stringify(vendedores));
  localStorage.setItem('vendas', JSON.stringify(vendas));
}

function atualizarSelect() {
  let select = document.getElementById('vendedor');
  if (!select) return;

  select.innerHTML = '';

  vendedores.forEach((v, i) => {
    let option = document.createElement('option');
    option.value = i;
    option.textContent = v.nome;
    select.appendChild(option);
  });
}

function cadastrar() {
  let nome = document.getElementById('nome').value;
  let comissao = parseFloat(document.getElementById('comissao').value);

  if (!nome || isNaN(comissao)) return alert('Preencha tudo');

  vendedores.push({ nome, comissao });
  salvar();
  atualizarSelect();
  mostrar();
}

function editarVendedor(index) {
  let novoNome = prompt('Novo nome:');
  let novaComissao = prompt('Nova comissão (%):');

  if (!novoNome || !novaComissao) return;

  novaComissao = parseFloat(novaComissao);

  if (isNaN(novaComissao)) {
    alert('Comissão inválida');
    return;
  }

  vendedores[index].nome = novoNome;
  vendedores[index].comissao = novaComissao;

  salvar();
  atualizarSelect();
  mostrar();
}

function excluirVendedor(index) {
  if (!confirm('Tem certeza que deseja excluir?')) return;

  vendedores.splice(index, 1);

  vendas = vendas.filter(v => v.vendedor != index);

  vendas = vendas.map(v => ({
    ...v,
    vendedor: v.vendedor > index ? v.vendedor - 1 : v.vendedor
  }));

  salvar();
  atualizarSelect();
  mostrar();
}

function vender() {
  let index = parseInt(document.getElementById('vendedor').value);
  let valor = parseFloat(document.getElementById('valor').value);

  if (isNaN(valor)) return alert('Digite o valor');

  let hoje = new Date().toISOString().split('T')[0];

  vendas.push({ vendedor: index, valor, data: hoje });

  salvar();
  mostrar();
}

function filtrarPorData() {
  let dataSelecionada = document.getElementById('dataFiltro').value;
  let div = document.getElementById('historico');

  if (!dataSelecionada) {
    div.innerHTML = '';
    return;
  }

  let vendasFiltradas = vendas.filter(v => v.data === dataSelecionada);

  if (vendasFiltradas.length === 0) {
    div.innerHTML = '<p>Nenhuma venda nesse dia</p>';
    return;
  }

  let total = 0;

  div.innerHTML = vendasFiltradas.map(v => {
    let vendedor = vendedores[v.vendedor]?.nome || 'Desconhecido';
    total += v.valor;

    return `
      <div class="card">
        <strong>${vendedor}</strong><br>
        Venda: R$ ${v.valor.toFixed(2)}
      </div>
    `;
  }).join('');

  div.innerHTML += `
    <div class="card">
      <strong>Total do dia: R$ ${total.toFixed(2)}</strong>
    </div>
  `;
}

function editarVenda(index) {
  let novoValor = prompt('Novo valor da venda:');

  if (!novoValor) return;

  novoValor = parseFloat(novoValor);

  if (isNaN(novoValor)) {
    alert('Valor inválido');
    return;
  }

  vendas[index].valor = novoValor;

  salvar();
  mostrar();
}

function mostrarTotalGeral() {
  let div = document.getElementById('geral');

  let totalVendas = vendas.reduce((acc, v) => acc + v.valor, 0);

  div.innerHTML = `
    <div class="card">
      <h3>Total de Vendas</h3>
      <p>R$ ${totalVendas.toFixed(2)}</p>
    </div>
  `;
}

function mostrar() {
  let div = document.getElementById('resultado');
  div.innerHTML = '';

  // 🎨 cores por vendedor
  let cores = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336'];

  vendedores.forEach((v, i) => {
    let vendasDoVendedor = vendas
      .map((venda, index) => ({ ...venda, index }))
      .filter(venda => venda.vendedor == i);

    let total = vendasDoVendedor
      .reduce((acc, venda) => acc + venda.valor, 0);

    let ganho = total * (v.comissao / 100);

    div.innerHTML += `
      <div class="card" style="border-left: 6px solid ${cores[i % cores.length]}">
        <strong>${v.nome}</strong><br>
        Vendas: R$ ${total.toFixed(2)}<br>
        Comissão: R$ ${ganho.toFixed(2)}<br>

        <button class="btn-edit" onclick="editarVendedor(${i})">Editar</button>
        <button class="btn-delete" onclick="excluirVendedor(${i})">Excluir</button>

        <hr>

        ${vendasDoVendedor.map(venda => `
          <p>
            R$ ${venda.valor.toFixed(2)}
            <button class="btn-edit" onclick="editarVenda(${venda.index})">Editar</button>
          </p>
        `).join('')}
      </div>
    `;
  });

  mostrarMeta();
  mostrarTotalGeral();
}

function salvarMeta() {
  let meta = parseFloat(document.getElementById('meta').value);

  if (isNaN(meta)) return alert('Digite uma meta válida');

  localStorage.setItem('meta', meta);
  mostrarMeta();
}

function mostrarMeta() {
  let div = document.getElementById('metaStatus');
  let meta = parseFloat(localStorage.getItem('meta'));

  if (!meta) {
    div.innerHTML = '<p>Defina uma meta</p>';
    return;
  }

  let hoje = new Date().toISOString().split('T')[0];

  let totalHoje = vendas
    .filter(v => v.data === hoje)
    .reduce((acc, v) => acc + v.valor, 0);

  let bateu = totalHoje >= meta;

  div.innerHTML = `
    <p>Meta: R$ ${meta.toFixed(2)}</p>
    <p>Hoje: R$ ${totalHoje.toFixed(2)}</p>
    <p style="color: ${bateu ? '#00e676' : '#ff5252'}">
      ${bateu ? 'Meta batida ✅' : 'Meta não atingida ❌'}
    </p>
  `;
}

window.onload = function () {
  atualizarSelect();
  mostrar();
};