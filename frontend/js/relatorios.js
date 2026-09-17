/**
 * frontend/js/relatorios.js
 *
 * Responsabilidade:
 * - carregar relatórios da API;
 * - controlar filtros;
 * - renderizar resumo e tabela;
 * - limpar filtros;
 * - imprimir/exportar via impressão do navegador.
 *
 * Dependências:
 * - ./api.js
 *
 * Eventos utilizados:
 * - pousada:changed
 *
 * Observação:
 * Os endpoints de relatório são definidos pelo contrato da API:
 * GET /api/pousadas/{id}/relatorios/manutencoes
 * GET /api/pousadas/{id}/relatorios/custos
 * GET /api/pousadas/{id}/relatorios/pendencias
 */

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────────────────────────────────────

import {
  relatoriosApi,
  ApiError
} from './api.js';


// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_META = {
  pintura: {
    label: 'Pintura / Reparo',
    icon: '🖌️'
  },
  eletrica: {
    label: 'Elétrica',
    icon: '⚡'
  },
  hidraulica: {
    label: 'Hidráulica',
    icon: '💧'
  },
  limpeza: {
    label: 'Limpeza',
    icon: '🧹'
  },
  mobiliario: {
    label: 'Mobiliário',
    icon: '🪑'
  },
  ocorrencia: {
    label: 'Ocorrência',
    icon: '⚠️'
  }
};

const STATUS_META = {
  concluido: '✅ Concluído',
  pendente: '🕐 Pendente',
  em_andamento: '🔧 Em andamento'
};

const PRIORITY_META = {
  alta: 'Alta prioridade',
  media: 'Media Prioridade',
  baixa: 'Baixa Prioridade'
};


// ─────────────────────────────────────────────────────────────────────────────
// ESTADO
// ─────────────────────────────────────────────────────────────────────────────

export const relatoriosState = {
  pousadaId: null,

  tipoRelatorio: 'manutencoes',

  filtros: {
    floor: '',
    type: '',
    status: '',
    responsavel: '',
    dateStart: '',
    dateEnd: '',
    prioridade: ''
  },

  dados: [],
  resumo: {
    registros: 0,
    pendentes: 0,
    totalGasto: 0
  },

  loading: false,
  error: null
};


// ─────────────────────────────────────────────────────────────────────────────
// GETTERS
// ─────────────────────────────────────────────────────────────────────────────

export function getRelatoriosState() {
  return relatoriosState;
}

export function getRelatorioDados() {
  return relatoriosState.dados;
}

export function getRelatorioResumo() {
  return relatoriosState.resumo;
}


// ─────────────────────────────────────────────────────────────────────────────
// UTILITÁRIOS LOCAIS
// ─────────────────────────────────────────────────────────────────────────────

function getElement(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatCurrency(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '—';
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number === 0) {
    return '—';
  }

  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatTotalCurrency(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 'R$ 0,00';
  }

  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const text = String(value).trim();

  // Formato ISO / API:
  // 2026-05-25
  // 2026-05-25T10:30:00
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    const date = new Date(text);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  // Compatibilidade com o formato antigo do protótipo:
  // 25/05/26 ou 25/05/2026
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{2,4})$/);

  if (!match) {
    return null;
  }

  const day = match[1];
  const month = match[2];
  const year = match[3].length === 2
    ? `20${match[3]}`
    : match[3];

  const date = new Date(`${year}-${month}-${day}`);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function formatDate(value) {
  const date = parseDate(value);

  if (!date) {
    return value || '—';
  }

  return date.toLocaleDateString('pt-BR');
}

function getField(object, ...names) {
  if (!object || typeof object !== 'object') {
    return null;
  }

  for (const name of names) {
    if (
      Object.prototype.hasOwnProperty.call(object, name) &&
      object[name] !== null &&
      object[name] !== undefined
    ) {
      return object[name];
    }
  }

  return null;
}


// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

function normalizeReportItem(item) {
  return {
    id: getField(item, 'id', 'manutencao_id'),

    date: getField(
      item,
      'data',
      'date',
      'criado_em',
      'criadoEm'
    ),

    spaceId: getField(
      item,
      'espaco_id',
      'espacoId',
      'space_id'
    ),

    spaceName: getField(
      item,
      'espaco_nome',
      'espacoNome',
      'space_name',
      'spaceName',
      'nome_espaco'
    ) || '—',

    floor: getField(
      item,
      'andar',
      'floor'
    ) || '—',

    type: getField(
      item,
      'tipo',
      'type'
    ) || '',

    status: getField(
      item,
      'status'
    ) || '',

    prioridade: getField(
      item,
      'prioridade',
      'priority'
    ) || '',

    responsavelId: getField(
      item,
      'responsavel_id',
      'responsavelId'
    ),

    responsavel: getField(
      item,
      'responsavel_nome',
      'responsavelNome',
      'responsavel',
      'resp'
    ) || '',

    descricao: getField(
      item,
      'descricao',
      'description',
      'desc'
    ) || '',

    valor: getField(
      item,
      'valor',
      'value'
    ),

    categoriaCusto: getField(
      item,
      'categoria_custo',
      'categoriaCusto',
      'custoCat'
    ) || ''
  };
}

function normalizeReportResponse(response) {
  if (Array.isArray(response)) {
    return response.map(normalizeReportItem);
  }

  if (
    response &&
    Array.isArray(response.data)
  ) {
    return response.data.map(normalizeReportItem);
  }

  if (
    response &&
    response.data &&
    Array.isArray(response.data.data)
  ) {
    return response.data.data.map(normalizeReportItem);
  }

  return [];
}


// ─────────────────────────────────────────────────────────────────────────────
// FILTROS
// ─────────────────────────────────────────────────────────────────────────────

export function getReportFiltersFromDom() {
  return {
    floor: getElement('rf-floor')?.value || '',
    type: getElement('rf-type')?.value || '',
    status: getElement('rf-status')?.value || '',
    responsavel: getElement('rf-resp')?.value.trim() || '',
    dateStart: getElement('rf-date-start')?.value || '',
    dateEnd: getElement('rf-date-end')?.value || '',
    prioridade: getElement('rf-prioridade')?.value || ''
  };
}

export function applyReportFilters() {
  relatoriosState.filtros = getReportFiltersFromDom();

  renderReport();
}

function matchesDateFilter(item, filters) {
  if (!filters.dateStart && !filters.dateEnd) {
    return true;
  }

  const date = parseDate(item.date);

  if (!date) {
    return true;
  }

  if (filters.dateStart) {
    const start = new Date(`${filters.dateStart}T00:00:00`);

    if (date < start) {
      return false;
    }
  }

  if (filters.dateEnd) {
    const end = new Date(`${filters.dateEnd}T23:59:59`);

    if (date > end) {
      return false;
    }
  }

  return true;
}

function filterReportRows(rows) {
  const filters = relatoriosState.filtros;

  return rows.filter(item => {
    if (
      filters.floor &&
      item.floor !== filters.floor
    ) {
      return false;
    }

    if (
      filters.type &&
      item.type !== filters.type
    ) {
      return false;
    }

    if (
      filters.status &&
      item.status !== filters.status
    ) {
      return false;
    }

    if (
      filters.prioridade &&
      item.prioridade !== filters.prioridade
    ) {
      return false;
    }

    if (filters.responsavel) {
      const responsible = String(
        item.responsavel || ''
      ).toLowerCase();

      if (
        !responsible.includes(
          filters.responsavel.toLowerCase()
        )
      ) {
        return false;
      }
    }

    if (!matchesDateFilter(item, filters)) {
      return false;
    }

    return true;
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// ORDENAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

function sortByDateDescending(rows) {
  return [...rows].sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);

    if (!dateA && !dateB) {
      return 0;
    }

    if (!dateA) {
      return 1;
    }

    if (!dateB) {
      return -1;
    }

    return dateB.getTime() - dateA.getTime();
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// CARREGAMENTO
// ─────────────────────────────────────────────────────────────────────────────

async function fetchReportData() {
  if (!relatoriosState.pousadaId) {
    relatoriosState.dados = [];
    return;
  }

  relatoriosState.loading = true;
  relatoriosState.error = null;

  renderReportLoading();

  try {
    let response;

    switch (relatoriosState.tipoRelatorio) {
      case 'custos':
        response = await relatoriosApi.custos(
          relatoriosState.pousadaId
        );
        break;

      case 'pendencias':
        response = await relatoriosApi.pendencias(
          relatoriosState.pousadaId
        );
        break;

      case 'manutencoes':
      default:
        response = await relatoriosApi.manutencoes(
          relatoriosState.pousadaId
        );
        break;
    }

    relatoriosState.dados =
      normalizeReportResponse(response);

  } catch (error) {
    relatoriosState.error = error instanceof ApiError
      ? error.message
      : 'Não foi possível carregar o relatório.';

    relatoriosState.dados = [];

    renderReportError();

  } finally {
    relatoriosState.loading = false;
  }
}

export async function loadReport(
  tipo = 'manutencoes'
) {
  relatoriosState.tipoRelatorio = tipo;

  await fetchReportData();

  if (!relatoriosState.error) {
    renderReport();
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// RESUMO
// ─────────────────────────────────────────────────────────────────────────────

function calculateSummary(rows) {
  let totalGasto = 0;

  for (const row of rows) {
    const value = Number(row.valor);

    if (Number.isFinite(value)) {
      totalGasto += value;
    }
  }

  return {
    registros: rows.length,

    pendentes: rows.filter(
      row => row.status !== 'concluido'
    ).length,

    totalGasto
  };
}

function renderSummary(summary) {
  const container = getElement('report-summary');

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="sum-card">
      <div class="sum-val">
        ${summary.registros}
      </div>
      <div class="sum-lbl">
        Registros
      </div>
    </div>

    <div class="sum-card">
      <div class="sum-val" style="color:var(--amber)">
        ${summary.pendentes}
      </div>
      <div class="sum-lbl">
        Pendentes
      </div>
    </div>

    <div class="sum-card">
      <div class="sum-val" style="color:var(--accent)">
        ${formatTotalCurrency(summary.totalGasto)}
      </div>
      <div class="sum-lbl">
        Total gasto
      </div>
    </div>
  `;
}


// ─────────────────────────────────────────────────────────────────────────────
// RENDERIZAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

function renderType(item) {
  const meta = TYPE_META[item.type];

  if (!meta) {
    return escapeHtml(item.type || '—');
  }

  return `
    <span class="entry-type-badge" style="font-size:11px">
      ${meta.icon} ${escapeHtml(meta.label)}
    </span>
  `;
}

function renderStatus(status) {
  return escapeHtml(
    STATUS_META[status] || status || '—'
  );
}

function renderPriority(priority) {
  if (!priority) {
    return '—';
  }

  return escapeHtml(
    PRIORITY_META[priority] || priority
  );
}

function renderReportTable(rows) {
  const container = getElement('report-container');

  if (!container) {
    return;
  }

  if (rows.length === 0) {
    container.innerHTML = `
      <div class="report-empty">
        📋 Nenhum registro encontrado com esses filtros.
      </div>
    `;

    return;
  }

  const total = rows.reduce(
    (sum, row) => {
      const value = Number(row.valor);

      return Number.isFinite(value)
        ? sum + value
        : sum;
    },
    0
  );

  container.innerHTML = `
    <table class="report-table" id="report-table">
      <thead>
        <tr>
          <th>Data</th>
          <th>Espaço</th>
          <th>Andar</th>
          <th>Tipo</th>
          <th>Prioridade</th>
          <th>Status</th>
          <th>Responsável</th>
          <th>Descrição</th>
          <th>Valor</th>
        </tr>
      </thead>

      <tbody>
        ${rows.map(row => `
          <tr>
            <td
              style="
                white-space:nowrap;
                font-family:'DM Mono',monospace;
                font-size:12px
              "
            >
              ${escapeHtml(formatDate(row.date))}
            </td>

            <td style="white-space:nowrap">
              ${escapeHtml(row.spaceName)}
            </td>

            <td
              style="
                white-space:nowrap;
                font-size:12px;
                color:var(--text3)
              "
            >
              ${escapeHtml(row.floor)}
            </td>

            <td>
              ${renderType(row)}
            </td>

            <td
              style="
                white-space:nowrap;
                font-size:12px
              "
            >
              ${renderPriority(row.prioridade)}
            </td>

            <td
              style="
                white-space:nowrap;
                font-size:12px
              "
            >
              ${renderStatus(row.status)}
            </td>

            <td style="font-size:12px">
              ${escapeHtml(row.responsavel || '—')}
            </td>

            <td
              style="
                max-width:260px;
                font-size:13px
              "
            >
              ${escapeHtml(row.descricao)}
            </td>

            <td
              style="
                white-space:nowrap;
                font-family:'DM Mono',monospace;
                text-align:right;
                color:var(--accent)
              "
            >
              ${formatCurrency(row.valor)}
            </td>
          </tr>
        `).join('')}

        <tr class="report-total-row">
          <td
            colspan="8"
            style="text-align:right"
          >
            Total
          </td>

          <td
            style="
              text-align:right;
              font-family:'DM Mono',monospace
            "
          >
            ${formatTotalCurrency(total)}
          </td>
        </tr>
      </tbody>
    </table>
  `;
}

export function renderReport() {
  if (relatoriosState.loading) {
    return;
  }

  const filteredRows = filterReportRows(
    relatoriosState.dados
  );

  const sortedRows =
    sortByDateDescending(filteredRows);

  relatoriosState.resumo =
    calculateSummary(sortedRows);

  renderSummary(relatoriosState.resumo);
  renderReportTable(sortedRows);
}


// ─────────────────────────────────────────────────────────────────────────────
// ESTADOS DE CARREGAMENTO / ERRO
// ─────────────────────────────────────────────────────────────────────────────

function renderReportLoading() {
  const summary = getElement('report-summary');
  const container = getElement('report-container');

  if (summary) {
    summary.innerHTML = '';
  }

  if (container) {
    container.innerHTML = `
      <div class="report-empty">
        Carregando relatório...
      </div>
    `;
  }
}

function renderReportError() {
  const summary = getElement('report-summary');
  const container = getElement('report-container');

  if (summary) {
    summary.innerHTML = '';
  }

  if (container) {
    container.innerHTML = `
      <div class="report-empty">
        ⚠️ ${escapeHtml(
          relatoriosState.error ||
          'Erro ao carregar relatório.'
        )}
      </div>
    `;
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// FILTROS DINÂMICOS
// ─────────────────────────────────────────────────────────────────────────────

function populateFloorFilter() {
  const select = getElement('rf-floor');

  if (!select) {
    return;
  }

  const currentValue = select.value;

  const floors = [
    ...new Set(
      relatoriosState.dados
        .map(item => item.floor)
        .filter(Boolean)
        .filter(item => item !== '—')
    )
  ].sort((a, b) =>
    String(a).localeCompare(
      String(b),
      'pt-BR',
      { numeric: true }
    )
  );

  select.innerHTML = `
    <option value="">Todos</option>
    ${floors.map(floor => `
      <option value="${escapeHtml(floor)}">
        ${escapeHtml(floor)}
      </option>
    `).join('')}
  `;

  if (floors.includes(currentValue)) {
    select.value = currentValue;
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// LIMPAR FILTROS
// ─────────────────────────────────────────────────────────────────────────────

export function clearReportFilters() {
  const ids = [
    'rf-floor',
    'rf-type',
    'rf-status',
    'rf-prioridade'
  ];

  ids.forEach(id => {
    const element = getElement(id);

    if (element) {
      element.value = '';
    }
  });

  [
    'rf-resp',
    'rf-date-start',
    'rf-date-end'
  ].forEach(id => {
    const element = getElement(id);

    if (element) {
      element.value = '';
    }
  });

  relatoriosState.filtros = {
    floor: '',
    type: '',
    status: '',
    responsavel: '',
    dateStart: '',
    dateEnd: '',
    prioridade: ''
  };

  renderReport();
}


// ─────────────────────────────────────────────────────────────────────────────
// IMPRESSÃO
// ─────────────────────────────────────────────────────────────────────────────

export function printReport() {
  window.print();
}


// ─────────────────────────────────────────────────────────────────────────────
// EVENTOS
// ─────────────────────────────────────────────────────────────────────────────

function bindFilterEvents() {
  const filterIds = [
    'rf-floor',
    'rf-type',
    'rf-status',
    'rf-prioridade',
    'rf-date-start',
    'rf-date-end'
  ];

  filterIds.forEach(id => {
    const element = getElement(id);

    if (!element) {
      return;
    }

    element.addEventListener(
      'change',
      applyReportFilters
    );
  });

  const responsible = getElement('rf-resp');

  if (responsible) {
    responsible.addEventListener(
      'input',
      applyReportFilters
    );
  }

  const clearButton = document.querySelector(
    '[data-action="clear-report-filters"]'
  );

  if (clearButton) {
    clearButton.addEventListener(
      'click',
      clearReportFilters
    );
  }

  const printButton = document.querySelector(
    '[data-action="print-report"]'
  );

  if (printButton) {
    printButton.addEventListener(
      'click',
      printReport
    );
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// TROCA DE POUSADA
// ─────────────────────────────────────────────────────────────────────────────

async function handlePousadaChanged(event) {
  const pousadaId =
    event?.detail?.pousadaId ??
    event?.detail?.id ??
    null;

  if (!pousadaId) {
    return;
  }

  relatoriosState.pousadaId = pousadaId;

  await loadReport(
    relatoriosState.tipoRelatorio
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

export function setPousadaRelatorios(pousadaId) {
  relatoriosState.pousadaId =
    pousadaId || null;

  relatoriosState.dados = [];
  relatoriosState.resumo = {
    registros: 0,
    pendentes: 0,
    totalGasto: 0
  };
}

export function initializeRelatorios() {
  bindFilterEvents();

  window.addEventListener(
    'pousada:changed',
    handlePousadaChanged
  );

  renderReport();
}


// ─────────────────────────────────────────────────────────────────────────────
// API PÚBLICA
// ─────────────────────────────────────────────────────────────────────────────

export async function refreshReport() {
  await loadReport(
    relatoriosState.tipoRelatorio
  );
}

export async function changeReportType(tipo) {
  const allowedTypes = [
    'manutencoes',
    'custos',
    'pendencias'
  ];

  if (!allowedTypes.includes(tipo)) {
    return;
  }

  relatoriosState.tipoRelatorio = tipo;

  await loadReport(tipo);
}

export default {
  state: relatoriosState,
  initialize: initializeRelatorios,
  setPousada: setPousadaRelatorios,
  load: loadReport,
  refresh: refreshReport,
  changeType: changeReportType,
  render: renderReport,
  clearFilters: clearReportFilters,
  print: printReport
};