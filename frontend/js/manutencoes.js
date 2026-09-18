//```javascript
// frontend/js/manutencoes.js
//
// Responsabilidade:
// - Carregar manutenções da pousada/espaço atual.
// - Renderizar histórico e valores.
// - Criar, editar e remover manutenções.
// - Alterar status.
// - Trabalhar com prioridade.
// - Trabalhar com fotos através da API.
// - Manter a camada de manutenção independente da autenticação e navegação.
//
// Dependências:
// - ./api.js
// - DOM definido em index.html
//
// Observações:
// - A segurança/autorização real é responsabilidade do backend.
// - Fotos são enviadas como multipart/FormData, nunca como Base64.
// - Valores monetários são enviados como strings decimais.
// - O backend deve aceitar os valores de prioridade:
//     alta
//     media
//     baixa
//
// Integração ainda pendente:
// - Não existe endpoint de usuários/responsáveis definido no contrato atual.
// - Por isso, este módulo não inventa uma chamada para carregar responsáveis.

import {
  manutencoesApi,
  fotosApi,
  ApiError,
  funcionariosManutencaoApi
} from './api.js';

import { 
  canEdit as userCanEdit
} from './auth.js';


// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

export const MANUTENCAO_TIPOS = {
  pintura: {
    label: 'Pintura / Reparo',
    cls: 't-pintura',
    icon: '🖌️',
  },
  eletrica: {
    label: 'Elétrica',
    cls: 't-eletrica',
    icon: '⚡',
  },
  hidraulica: {
    label: 'Hidráulica',
    cls: 't-hidraulica',
    icon: '💧',
  },
  limpeza: {
    label: 'Limpeza',
    cls: 't-limpeza',
    icon: '🧹',
  },
  mobiliario: {
    label: 'Mobiliário',
    cls: 't-mobiliario',
    icon: '🪑',
  },
  ocorrencia: {
    label: 'Ocorrência',
    cls: 't-ocorrencia',
    icon: '⚠️',
  },
};

export const MANUTENCAO_STATUS = {
  pendente: {
    label: 'Pendente',
    icon: '🕐',
  },
  em_andamento: {
    label: 'Em andamento',
    icon: '🔧',
  },
  concluido: {
    label: 'Concluído',
    icon: '✅',
  },
};

export const MANUTENCAO_PRIORIDADES = {
  alta: {
    label: 'Alta prioridade',
    cls: 'priority-high',
  },
  media: {
    label: 'Media Prioridade',
    cls: 'priority-medium',
  },
  baixa: {
    label: 'Baixa Prioridade',
    cls: 'priority-low',
  },
};

export const CUSTO_CATEGORIAS = {
  material: {
    label: 'Material',
    icon: '🧱',
  },
  mao_de_obra: {
    label: 'Mão de obra',
    icon: '👷',
  },
  equipamento: {
    label: 'Equipamento',
    icon: '🔧',
  },
  outro: {
    label: 'Outro',
    icon: '📦',
  },
};


// ─────────────────────────────────────────────────────────────────────────────
// ESTADO
// ─────────────────────────────────────────────────────────────────────────────

export const manutencoesState = {

  pousadaId: null,
  espacoId: null,
  manutencoes: [],
  funcionarios: [],
  currentFilter: 'all',
  currentTab: 'historico',
  loading: false,
  saving: false,
  error: null,
  editingId: null,
  pendingPhotos: [],

};


// ─────────────────────────────────────────────────────────────────────────────
// GETTERS
// ─────────────────────────────────────────────────────────────────────────────

export function getManutencoes() {
  return manutencoesState.manutencoes;
}

export function getManutencaoAtual(id) {
  return manutencoesState.manutencoes.find(
    item => String(item.id) === String(id)
  ) || null;
}

export function getCurrentManutencoes() {
  return manutencoesState.manutencoes;
}

export function isLoadingManutencoes() {
  return manutencoesState.loading;
}

export function getManutencoesError() {
  return manutencoesState.error;
}


// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

function normalizeManutencao(item = {}) {
  return {
    id: item.id,

    espacoId:
      item.espaco_id ??
      item.espacoId ??
      null,

    tipo:
      item.tipo ??
      item.type ??
      'ocorrencia',

    data:
      item.data ??
      item.date ??
      item.data_manutencao ??
      '',

    descricao:
      item.descricao ??
      item.desc ??
      item.description ??
      '',

    status:
      item.status ??
      'pendente',

    prioridade:
      item.prioridade ??
      'media',

    responsavelId:
      item.responsavel_id ??
      item.responsavelId ??
      null,

    responsavel:
      item.responsavel_nome ??
      item.responsavel ??
      item.responsavel_name ??
      '',

    valor:
      item.valor ??
      '0.00',

    categoriaCusto:
      item.categoria_custo ??
      item.custo_cat ??
      item.custoCat ??
      'outro',

    fotos:
      Array.isArray(item.fotos)
        ? item.fotos
        : Array.isArray(item.photos)
          ? item.photos
          : [],

    criadoEm:
      item.criado_em ??
      item.created_at ??
      null,

    atualizadoEm:
      item.atualizado_em ??
      item.updated_at ??
      null,

    raw: item,
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// AUXILIARES
// ─────────────────────────────────────────────────────────────────────────────

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}


function formatDate(value) {
  if (!value) return '—';

  const text = String(value);

  // ISO: YYYY-MM-DD
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (iso) {
    return `${iso[3]}/${iso[2]}/${iso[1].slice(2)}`;
  }

  // Já no formato brasileiro.
  if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(text)) {
    return text;
  }

  return text;
}


function formatMoney(value) {
  if (value === null || value === undefined || value === '') {
    return 'R$ 0,00';
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 'R$ 0,00';
  }

  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}


function normalizeMoneyInput(value) {
  if (value === null || value === undefined || value === '') {
    return '0.00';
  }

  const normalized = String(value)
    .trim()
    .replace(',', '.');

  const number = Number(normalized);

  if (!Number.isFinite(number) || number < 0) {
    return '0.00';
  }

  return number.toFixed(2);
}


function dateToApi(value) {
  if (!value) return null;

  // O input type=date já fornece YYYY-MM-DD.
  return value;
}


function getTypeMeta(type) {
  return MANUTENCAO_TIPOS[type] || {
    label: type || 'Manutenção',
    cls: '',
    icon: '📋',
  };
}


function getStatusMeta(status) {
  return MANUTENCAO_STATUS[status] || {
    label: status || 'Status',
    icon: '',
  };
}


function getPriorityMeta(priority) {
  return MANUTENCAO_PRIORIDADES[priority] || {
    label: priority || 'Prioridade',
    cls: '',
  };
}


function getCostMeta(category) {
  return CUSTO_CATEGORIAS[category] || {
    label: category || 'Outro',
    icon: '📦',
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// CARREGAMENTO
// ─────────────────────────────────────────────────────────────────────────────

async function loadFuncionariosManutencao() {
  if (!manutencoesState.pousadaId) {
    manutencoesState.funcionarios = [];
    return;
  }

  try {
    const response = await funcionariosManutencaoApi.list(
      manutencoesState.pousadaId
    );

    manutencoesState.funcionarios =
      response?.data ?? response ?? [];

  } catch (error) {
    console.error(
      'Erro ao carregar funcionários da manutenção:',
      error
    );

    manutencoesState.funcionarios = [];

    showMaintenanceError(
      error instanceof ApiError
        ? error.message
        : 'Não foi possível carregar os funcionários da manutenção.'
    );
  }
}

export async function loadManutencoes() {
  if (!manutencoesState.pousadaId) {
    return;
  }
  await loadFuncionariosManutencao();
  
  if (!manutencoesState.espacoId) {
    return;
  }

  manutencoesState.loading = true;
  manutencoesState.error = null;

  renderCurrentMaintenanceView();

  try {
    const response = await manutencoesApi.list(
      manutencoesState.pousadaId,
      {
        espaco_id: manutencoesState.espacoId
      }
    );

    manutencoesState.manutencoes = Array.isArray(response)
      ? response
      : [];

  } catch (error) {
    console.error('Erro ao carregar manutenções:', error);

    manutencoesState.error =
      error instanceof ApiError
        ? error.message
        : 'Não foi possível carregar as manutenções.';

    manutencoesState.manutencoes = [];

  } finally {
    manutencoesState.loading = false;
    renderCurrentMaintenanceView();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURAÇÃO DO ESPAÇO
// ─────────────────────────────────────────────────────────────────────────────

export function setPousadaManutencoes(pousadaId) {
  manutencoesState.pousadaId = pousadaId || null;
  manutencoesState.espacoId = null;
  manutencoesState.manutencoes = [];
  manutencoesState.error = null;
}

export async function setEspacoManutencoes(
  pousadaId,
  espacoId
) {
  manutencoesState.pousadaId = pousadaId;
  manutencoesState.espacoId = espacoId;

  manutencoesState.currentFilter = 'all';
  manutencoesState.currentTab = 'historico';

  await loadManutencoes({
    pousadaId,
    espacoId,
  });
}

export function clearManutencoes() {
  manutencoesState.pousadaId = null;
  manutencoesState.espacoId = null;
  manutencoesState.manutencoes = [];
  manutencoesState.error = null;
  manutencoesState.loading = false;
}

async function handleEspacoSelected(event) {
  const { espacoId } = event.detail || {};

  if (!espacoId) {
    return;
  }

  manutencoesState.espacoId = espacoId;

  await loadManutencoes();
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTROS
// ─────────────────────────────────────────────────────────────────────────────

export function setManutencaoFilter(filter) {
  manutencoesState.currentFilter = filter || 'all';
  renderCurrentMaintenanceView();
}


export function setManutencaoTab(tab) {
  manutencoesState.currentTab =
    tab === 'valores'
      ? 'valores'
      : 'historico';

  renderCurrentMaintenanceView();
}


function getFilteredManutencoes() {
  const filter = manutencoesState.currentFilter;

  if (filter === 'all') {
    return manutencoesState.manutencoes;
  }

  return manutencoesState.manutencoes.filter(
    item => item.tipo === filter
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// ESTATÍSTICAS
// ─────────────────────────────────────────────────────────────────────────────

export function getMaintenanceStats() {
  const items = manutencoesState.manutencoes;

  const pendingCount = items.filter(
    item =>
      item.status === 'pendente' ||
      item.status === 'em_andamento'
  ).length;

  const byType = {};

  items.forEach(item => {
    byType[item.tipo] = (byType[item.tipo] || 0) + 1;
  });

  return {
    total: items.length,
    pendentes: pendingCount,
    byType,
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// RENDER PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export function renderCurrentMaintenanceView() {
  const main = document.getElementById('main');

  if (!main) return;

  if (!manutencoesState.espacoId) {
    return;
  }

  if (manutencoesState.loading) {
    renderLoading(main);
    return;
  }

  const items = manutencoesState.manutencoes;

  const stats = getMaintenanceStats();

  const filtered =
    manutencoesState.currentFilter === 'all'
      ? items
      : items.filter(
          item =>
            item.tipo === manutencoesState.currentFilter
        );

  const totalGasto = calculateTotalCost(items);

  const canEdit = userCanEdit();

  main.innerHTML = `
    <div class="summary-strip">
      <div class="sum-card">
        <div class="sum-val">${stats.total}</div>
        <div class="sum-lbl">Registros</div>
      </div>

      <div class="sum-card">
        <div class="sum-val">${stats.pendentes}</div>
        <div class="sum-lbl">Pendentes</div>
      </div>

      <div class="sum-card">
        <div class="sum-val">
          ${escapeHtml(formatMoney(totalGasto))}
        </div>
        <div class="sum-lbl">Total gasto</div>
      </div>

      ${Object.entries(stats.byType)
        .map(([type, count]) => {
          const meta = getTypeMeta(type);

          return `
            <div class="sum-card">
              <div class="sum-val">${count}</div>
              <div class="sum-lbl">
                ${meta.icon} ${escapeHtml(meta.label)}
              </div>
            </div>
          `;
        })
        .join('')}
    </div>

    <div class="tabs-row">
      <button
        class="tab-btn ${manutencoesState.currentTab === 'historico' ? 'active' : ''}"
        data-maint-tab="historico">
        📋 Histórico
      </button>

      <button
        class="tab-btn ${manutencoesState.currentTab === 'valores' ? 'active' : ''}"
        data-maint-tab="valores">
        💰 Valores
      </button>
    </div>

    ${
      manutencoesState.currentTab === 'historico'
        ? renderHistorico(filtered, canEdit)
        : renderValores(items, canEdit)
    }
  `;

  bindMaintenanceViewEvents();
}


// ─────────────────────────────────────────────────────────────────────────────
// HISTÓRICO
// ─────────────────────────────────────────────────────────────────────────────

function renderHistorico(items, canEdit) {
  const types = [
    ...new Set(
      manutencoesState.manutencoes
        .map(item => item.tipo)
        .filter(Boolean)
    ),
  ];

  return `
    <div class="entries-area">

      <div class="entries-header">
        <span class="entries-title">
          Histórico de serviços
        </span>

        <div class="filter-row">

          <button
            class="filter-btn ${manutencoesState.currentFilter === 'all' ? 'active' : ''}"
            data-maint-filter="all">
            Todos
          </button>

          ${types.map(type => {
            const meta = getTypeMeta(type);

            return `
              <button
                class="filter-btn ${
                  manutencoesState.currentFilter === type
                    ? 'active'
                    : ''
                }"
                data-maint-filter="${escapeHtml(type)}">
                ${meta.icon} ${escapeHtml(meta.label)}
              </button>
            `;
          }).join('')}

        </div>
      </div>

      ${
        items.length === 0
          ? `
            <div class="no-entries">
              <div style="font-size:36px">📋</div>
              <p>
                Nenhum registro ainda.
                ${
                  canEdit
                    ? '<br>Clique em "+ Novo registro" para começar.'
                    : ''
                }
              </p>
            </div>
          `
          : ''
      }

      <div id="entries-list">
        ${items
          .map(item => renderEntry(item, canEdit))
          .join('')}
      </div>

    </div>
  `;
}


// ─────────────────────────────────────────────────────────────────────────────
// CARD DE MANUTENÇÃO
// ─────────────────────────────────────────────────────────────────────────────

function renderEntry(item, canEdit) {
  const typeMeta = getTypeMeta(item.tipo);
  const priorityMeta = getPriorityMeta(item.prioridade);

  const photos = Array.isArray(item.fotos)
    ? item.fotos
    : [];

  const hasValue =
    item.valor !== null &&
    item.valor !== undefined &&
    Number(item.valor) > 0;

  const statusClass =
    item.status !== 'concluido'
      ? `is-${escapeHtml(item.status)}`
      : '';

  const statusOptions = Object.entries(MANUTENCAO_STATUS)
    .map(([value, meta]) => `
      <option
        value="${value}"
        ${item.status === value ? 'selected' : ''}>
        ${meta.icon} ${escapeHtml(meta.label)}
      </option>
    `)
    .join('');

  const nextStatus =
    item.status === 'pendente'
      ? `
        <button
          class="status-btn to-andamento"
          data-maint-status="${item.id}"
          data-status="em_andamento">
          ▶ Em andamento
        </button>

        <button
          class="status-btn to-concluido"
          data-maint-status="${item.id}"
          data-status="concluido">
          ✅ Concluído
        </button>
      `
      : item.status === 'em_andamento'
        ? `
          <button
            class="status-btn to-concluido"
            data-maint-status="${item.id}"
            data-status="concluido">
            ✅ Marcar como concluído
          </button>
        `
        : `
          <button
            class="status-btn to-pendente"
            data-maint-status="${item.id}"
            data-status="pendente">
            ↩ Reabrir
          </button>
        `;

  return `
    <div
      class="entry-card ${statusClass}"
      id="entry-${escapeHtml(item.id)}">

      <div class="entry-top">

        <span class="entry-type-badge ${typeMeta.cls}">
          ${typeMeta.icon}
          ${escapeHtml(typeMeta.label)}
        </span>

        <span
          class="priority-badge ${priorityMeta.cls}"
          title="Prioridade">
          ${escapeHtml(priorityMeta.label)}
        </span>

        <select
          class="status-select-inline s-${escapeHtml(item.status)}"
          data-maint-status-select="${item.id}"
          ${!canEdit ? 'disabled' : ''}>
          ${statusOptions}
        </select>

        <span class="entry-date">
          ${escapeHtml(formatDate(item.data))}
        </span>

      </div>

      <div class="entry-desc">
        ${escapeHtml(item.descricao)}
      </div>

      <div class="entry-meta">

        ${
          item.responsavel
            ? `<span>👤 ${escapeHtml(item.responsavel)}</span>`
            : ''
        }

        ${
          item.responsavelId
            ? `<span data-responsavel-id="${escapeHtml(item.responsavelId)}"></span>`
            : ''
        }

        ${
          hasValue
            ? `
              <span>
                💰 ${escapeHtml(formatMoney(item.valor))}
              </span>
            `
            : ''
        }

        ${
          hasValue
            ? `
              <span>
                ${getCostMeta(item.categoriaCusto).icon}
                ${escapeHtml(
                  getCostMeta(item.categoriaCusto).label
                )}
              </span>
            `
            : ''
        }

        <span>
          ${getStatusMeta(item.status).icon}
          ${escapeHtml(getStatusMeta(item.status).label)}
        </span>

        ${
          photos.length
            ? `
              <span class="photo-counter">
                📷 ${photos.length}
                foto${photos.length > 1 ? 's' : ''}
              </span>
            `
            : ''
        }

      </div>

      ${
        photos.length
          ? `
            <div class="entry-photos">
              ${photos
                .map((photo, index) =>
                  renderPhoto(photo, index)
                )
                .join('')}
            </div>
          `
          : ''
      }

      ${
        canEdit
          ? `
            <div class="entry-actions">

              ${nextStatus}

              <button
                class="entry-del"
                data-maint-delete="${item.id}">
                🗑 Remover
              </button>

            </div>
          `
          : ''
      }

    </div>
  `;
}


// ─────────────────────────────────────────────────────────────────────────────
// FOTOS
// ─────────────────────────────────────────────────────────────────────────────

function renderPhoto(photo, index) {
  const src =
    photo.url ??
    photo.path ??
    photo.arquivo_url ??
    photo.file_url ??
    '';

  if (!src) {
    return '';
  }

  return `
    <img
      class="entry-photo"
      src="${escapeHtml(src)}"
      alt="Foto ${index + 1}"
      data-lightbox="${escapeHtml(src)}">
  `;
}


async function loadPhotos(manutencaoId) {
  try {
    const response =
      await fotosApi.list(manutencaoId);

    const photos = Array.isArray(response)
      ? response
      : response?.data || [];

    const maintenance =
      getManutencaoAtual(manutencaoId);

    if (maintenance) {
      maintenance.fotos = photos;
    }

    return photos;
  } catch (error) {
    console.error(
      'Erro ao carregar fotos da manutenção:',
      error
    );

    return [];
  }
}


export async function uploadMaintenancePhotos(
  manutencaoId,
  files
) {
  if (!files || !files.length) {
    return [];
  }

  const uploaded = [];

  for (const file of Array.from(files)) {
    try {
      const response =
        await fotosApi.upload(
          manutencaoId,
          file
        );

      const photo =
        response?.data ??
        response;

      uploaded.push(photo);
    } catch (error) {
      console.error(
        `Erro ao enviar foto ${file.name}:`,
        error
      );

      throw error;
    }
  }

  const photos =
    await loadPhotos(manutencaoId);

  const maintenance =
    getManutencaoAtual(manutencaoId);

  if (maintenance) {
    maintenance.fotos = photos;
  }

  return uploaded;
}


export async function removeMaintenancePhoto(
  photoId,
  manutencaoId
) {
  await fotosApi.remove(photoId);

  await loadPhotos(manutencaoId);

  renderCurrentMaintenanceView();
}


// ─────────────────────────────────────────────────────────────────────────────
// VALORES
// ─────────────────────────────────────────────────────────────────────────────

function calculateTotalCost(items) {
  return items.reduce(
    (total, item) => {
      const value = Number(item.valor);

      if (!Number.isFinite(value) || value <= 0) {
        return total;
      }

      return total + value;
    },
    0
  );
}


function calculateCostsByCategory(items) {
  const result = {};

  items.forEach(item => {
    const value = Number(item.valor);

    if (!Number.isFinite(value) || value <= 0) {
      return;
    }

    const category =
      item.categoriaCusto || 'outro';

    result[category] =
      (result[category] || 0) + value;
  });

  return result;
}


function renderValores(items, canEdit) {
  const totalGasto =
    calculateTotalCost(items);

  const byCategory =
    calculateCostsByCategory(items);

  const entriesWithValue =
    items
      .filter(item => Number(item.valor) > 0)
      .sort(
        (a, b) =>
          Number(b.valor) -
          Number(a.valor)
      );

  return `
    <div class="costs-area">

      <div class="cost-summary">

        <div class="cost-total-card sum-card">
          <div class="sum-val">
            ${escapeHtml(formatMoney(totalGasto))}
          </div>
          <div class="sum-lbl">
            Total gasto
          </div>
        </div>

        ${Object.entries(byCategory)
          .map(([category, value]) => {
            const meta =
              getCostMeta(category);

            return `
              <div class="sum-card">
                <div class="sum-val">
                  ${escapeHtml(formatMoney(value))}
                </div>
                <div class="sum-lbl">
                  ${meta.icon}
                  ${escapeHtml(meta.label)}
                </div>
              </div>
            `;
          })
          .join('')}

      </div>

      ${
        entriesWithValue.length === 0
          ? `
            <div class="no-entries">
              <div style="font-size:36px">💰</div>
              <p>Nenhum valor registrado ainda.</p>
            </div>
          `
          : ''
      }

      ${entriesWithValue
        .map(item => {
          const typeMeta =
            getTypeMeta(item.tipo);

          const costMeta =
            getCostMeta(item.categoriaCusto);

          return `
            <div class="cost-row-item">

              <span style="font-size:20px">
                ${typeMeta.icon}
              </span>

              <div class="cr-info">

                <div class="cr-name">
                  ${escapeHtml(
                    item.descricao.length > 60
                      ? item.descricao.slice(0, 60) + '…'
                      : item.descricao
                  )}
                </div>

                <div class="cr-desc">
                  ${escapeHtml(
                    formatDate(item.data)
                  )}

                  ${
                    item.responsavel
                      ? ` · ${escapeHtml(item.responsavel)}`
                      : ''
                  }

                  · ${costMeta.icon}
                  ${escapeHtml(costMeta.label)}
                </div>

              </div>

              <div class="cr-val">
                ${escapeHtml(
                  formatMoney(item.valor)
                )}
              </div>

            </div>
          `;
        })
        .join('')}

      ${
        canEdit
          ? `
            <div class="add-cost-form">

              <div class="add-cost-title">
                ➕ Adicionar custo avulso
              </div>

              <div class="cost-form-row">

                <div class="form-group">
                  <label class="form-label">
                    Descrição
                  </label>

                  <input
                    class="form-input"
                    id="ac-desc"
                    placeholder="Ex: Lâmpada LED 9W">
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Valor (R$)
                  </label>

                  <div class="cost-val-wrap">
                    <span>R$</span>

                    <input
                      type="number"
                      class="form-input"
                      id="ac-val"
                      min="0"
                      step="0.01"
                      placeholder="0,00">
                  </div>
                </div>

                <button
                  class="btn btn-primary"
                  id="add-cost-btn"
                  type="button">
                  Adicionar
                </button>

              </div>

            </div>
          `
          : ''
      }

    </div>
  `;
}


// ─────────────────────────────────────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────────────────────────────────────

export function openMaintenanceModal() {
  manutencoesState.pendingPhotos = [];

  document.getElementById('f-type').value = 'pintura';
  document.getElementById('f-date').value =
    new Date().toISOString().slice(0, 10);

  document.getElementById('f-resp').value = '';
  document.getElementById('f-prioridade').value = 'media';
  document.getElementById('f-desc').value = '';
  document.getElementById('f-status').value = 'concluido';
  document.getElementById('f-valor').value = '';
  document.getElementById('f-custo-cat').value = 'material';

  renderPhotoPreviews();

  document.getElementById('modal').classList.add('open');
}

export function closeMaintenanceModal() {
  const modal =
    document.getElementById('modal');

  if (!modal) return;

  modal.classList.remove('open');

  manutencoesState.editingId = null;
  manutencoesState.pendingPhotos = [];
}


function setFieldValue(id, value) {
  const element =
    document.getElementById(id);

  if (element) {
    element.value =
      value === null || value === undefined
        ? ''
        : value;
  }
}


function getFieldValue(id) {
  const element =
    document.getElementById(id);

  return element
    ? element.value
    : '';
}


function getTodayForInput() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}


function normalizeDateForInput(value) {
  if (!value) return '';

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }

  const match =
    text.match(
      /^(\d{2})\/(\d{2})\/(\d{2,4})$/
    );

  if (!match) return '';

  const year =
    match[3].length === 2
      ? `20${match[3]}`
      : match[3];

  return `${year}-${match[2]}-${match[1]}`;
}


// ─────────────────────────────────────────────────────────────────────────────
// FOTOS DO MODAL
// ─────────────────────────────────────────────────────────────────────────────

function handlePhotoSelect(fileList) {
  const files = Array.from(fileList || []);

  manutencoesState.pendingPhotos.push(...files);

  renderPhotoPreviews();
}

function handleDrop(event) {
  event.preventDefault();

  const uploadArea = document.getElementById('upload-area');

  if (uploadArea) {
    uploadArea.classList.remove('drag');
  }

  handlePhotoSelect(event.dataTransfer?.files);
}

function renderPhotoPreviews() {
  const container = document.getElementById('photo-previews');

  if (!container) {
    return;
  }

  container.innerHTML = '';

  manutencoesState.pendingPhotos.forEach((file, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'photo-preview-item';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = file.name || `Foto ${index + 1}`;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'photo-preview-remove';
    removeButton.textContent = '×';
    removeButton.dataset.photoIndex = String(index);

    removeButton.addEventListener('click', () => {
      removePendingPhoto(index);
    });

    wrapper.appendChild(img);
    wrapper.appendChild(removeButton);
    container.appendChild(wrapper);
  });
}


function removePendingPhoto(index) {
  if (
    index < 0 ||
    index >=
      manutencoesState.pendingPhotos.length
  ) {
    return;
  }

  manutencoesState.pendingPhotos.splice(
    index,
    1
  );

  renderPhotoPreviews();
}


// ─────────────────────────────────────────────────────────────────────────────
// CRIAÇÃO / EDIÇÃO
// ─────────────────────────────────────────────────────────────────────────────

async function saveMaintenance() {
  if (manutencoesState.saving) {
    return;
  }

  if (!manutencoesState.pousadaId) {
    return;
  }

  if (!manutencoesState.espacoId) {
    showMaintenanceError('Selecione um espaço antes de salvar.');
    return;
  }

  const descricao =
    document.getElementById('f-desc')?.value.trim() || '';

  if (!descricao) {
    showMaintenanceError(
      'Descreva o serviço ou ocorrência.'
    );
    return;
  }

  const payload = {
    espaco_id: manutencoesState.espacoId,
    tipo: document.getElementById('f-type')?.value,
    descricao,
    status: document.getElementById('f-status')?.value,
    prioridade: document.getElementById('f-prioridade')?.value,
    data: document.getElementById('f-date')?.value || null,
    responsavel_id: null,
    valor: document.getElementById('f-valor')?.value || null,
    categoria_custo:
      document.getElementById('f-custo-cat')?.value || null
  };

  const filesToUpload = [
    ...manutencoesState.pendingPhotos
  ];

  manutencoesState.saving = true;
  renderCurrentMaintenanceView();

  try {
    const maintenance = await manutencoesApi.create(
      manutencoesState.pousadaId,
      payload
    );

    const maintenanceId =
      maintenance?.id ??
      maintenance?.data?.id;

    if (maintenanceId && filesToUpload.length > 0) {
      for (const file of filesToUpload) {
        await fotosApi.upload(
          maintenanceId,
          file
        );
      }
    }

    manutencoesState.pendingPhotos = [];
    
    closeMaintenanceModal();

    await loadManutencoes();

  } catch (error) {
    console.error('Erro ao salvar manutenção:', error);

    showMaintenanceError(
      error instanceof ApiError
        ? error.message
        : 'Não foi possível salvar a manutenção.'
    );
    
  } finally {
    manutencoesState.saving = false;
    renderCurrentMaintenanceView();
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// STATUS
// ─────────────────────────────────────────────────────────────────────────────

export async function changeMaintenanceStatus(
  id,
  newStatus
) {
  if (
    !Object.prototype.hasOwnProperty.call(
      MANUTENCAO_STATUS,
      newStatus
    )
  ) {
    showUserError(
      'Status inválido.'
    );
    return;
  }

  try {
    await manutencoesApi.update(
      id,
      {
        status: newStatus,
      }
    );

    const item =
      getManutencaoAtual(id);

    if (item) {
      item.status = newStatus;
    }

    renderCurrentMaintenanceView();

  } catch (error) {
    console.error(
      'Erro ao alterar status:',
      error
    );

    showUserError(
      getErrorMessage(error)
    );
  }
}


export async function markAllMaintenanceDone() {
  const pending =
    manutencoesState.manutencoes.filter(
      item =>
        item.status !== 'concluido'
    );

  if (!pending.length) {
    return;
  }

  try {
    for (const item of pending) {
      await manutencoesApi.update(
        item.id,
        {
          status: 'concluido',
        }
      );
    }

    pending.forEach(item => {
      item.status = 'concluido';
    });

    renderCurrentMaintenanceView();

  } catch (error) {
    console.error(
      'Erro ao concluir manutenções:',
      error
    );

    await loadManutencoes();

    renderCurrentMaintenanceView();

    showUserError(
      getErrorMessage(error)
    );
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// REMOÇÃO
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteMaintenance(id) {
  const item =
    getManutencaoAtual(id);

  if (!item) {
    return;
  }

  const confirmed =
    window.confirm(
      'Remover este registro?'
    );

  if (!confirmed) {
    return;
  }

  try {
    await manutencoesApi.remove(id);

    manutencoesState.manutencoes =
      manutencoesState.manutencoes.filter(
        maintenance =>
          String(maintenance.id) !==
          String(id)
      );

    renderCurrentMaintenanceView();

  } catch (error) {
    console.error(
      'Erro ao remover manutenção:',
      error
    );

    showUserError(
      getErrorMessage(error)
    );
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// CUSTO AVULSO
// ─────────────────────────────────────────────────────────────────────────────

export async function addCostAvulso() {
  const descricao =
    document
      .getElementById('ac-desc')
      ?.value
      .trim();

  const valor =
    document
      .getElementById('ac-val')
      ?.value;

  if (!descricao) {
    showUserError(
      'Preencha a descrição.'
    );
    return;
  }

  const normalizedValue =
    normalizeMoneyInput(valor);

  if (
    Number(normalizedValue) <= 0
  ) {
    showUserError(
      'Informe um valor maior que zero.'
    );
    return;
  }

  /*
   * Mantemos a ideia do protótipo de um custo
   * avulso, mas agora ele é persistido como uma
   * manutenção do tipo ocorrência.
   */
  const payload = {
    espaco_id:
      manutencoesState.espacoId,

    tipo: 'ocorrencia',

    data:
      getTodayForInput(),

    descricao,

    status: 'concluido',

    prioridade: 'baixa',

    responsavel_id: null,

    valor: normalizedValue,

    categoria_custo: 'outro',
  };

  try {
    await manutencoesApi.create(
      manutencoesState.pousadaId,
      payload
    );

    await loadManutencoes();

    renderCurrentMaintenanceView();

  } catch (error) {
    console.error(
      'Erro ao adicionar custo avulso:',
      error
    );

    showUserError(
      getErrorMessage(error)
    );
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// EVENTOS
// ─────────────────────────────────────────────────────────────────────────────

function bindMaintenanceViewEvents() {
  const main =
    document.getElementById('main');

  if (!main) return;

  main.querySelectorAll(
    '[data-maint-tab]'
  ).forEach(button => {
    button.addEventListener(
      'click',
      () => {
        setManutencaoTab(
          button.dataset.maintTab
        );
      }
    );
  });

  main.querySelectorAll(
    '[data-maint-filter]'
  ).forEach(button => {
    button.addEventListener(
      'click',
      () => {
        setManutencaoFilter(
          button.dataset.maintFilter
        );
      }
    );
  });

  main.querySelectorAll(
    '[data-maint-status]'
  ).forEach(button => {
    button.addEventListener(
      'click',
      async event => {
        event.stopPropagation();

        await changeMaintenanceStatus(
          button.dataset.maintStatus,
          button.dataset.status
        );
      }
    );
  });

  main.querySelectorAll(
    '[data-maint-status-select]'
  ).forEach(select => {
    select.addEventListener(
      'click',
      event => {
        event.stopPropagation();
      }
    );

    select.addEventListener(
      'change',
      async event => {
        await changeMaintenanceStatus(
          select.dataset.maintStatusSelect,
          select.value
        );
      }
    );
  });

  main.querySelectorAll(
    '[data-maint-delete]'
  ).forEach(button => {
    button.addEventListener(
      'click',
      async event => {
        event.stopPropagation();

        await deleteMaintenance(
          button.dataset.maintDelete
        );
      }
    );
  });

  main.querySelectorAll(
    '[data-lightbox]'
  ).forEach(image => {
    image.addEventListener(
      'click',
      event => {
        event.stopPropagation();

        openLightbox(
          image.dataset.lightbox
        );
      }
    );
  });

  const addCostButton =
    document.getElementById(
      'add-cost-btn'
    );

  if (addCostButton) {
    addCostButton.addEventListener(
      'click',
      addCostAvulso
    );
  }
}


function bindModalEvents() {
  const fileInput =
    document.getElementById('f-photos');

  if (fileInput) {
    fileInput.onchange = event => {
      handlePhotoSelect(
        event.target.files
      );
    };
  }

  const uploadArea =
    document.getElementById(
      'upload-area'
    );

  if (uploadArea) {
    uploadArea.onclick = event => {
      if (
        event.target === fileInput
      ) {
        return;
      }

      fileInput?.click();
    };

    uploadArea.ondragover =
      event => {
        event.preventDefault();
        uploadArea.classList.add('drag');
      };

    uploadArea.ondragleave =
      () => {
        uploadArea.classList.remove(
          'drag'
        );
      };

    uploadArea.ondrop =
      event => {
        event.preventDefault();

        uploadArea.classList.remove(
          'drag'
        );

        handlePhotoSelect(
          event.dataTransfer.files
        );
      };
  }

  const saveButton =
    document.querySelector(
      '#modal .btn-primary'
    );

  if (saveButton) {
    saveButton.onclick =
      saveMaintenance;
  }

  const cancelButton =
    document.querySelector(
      '#modal .btn-outline'
    );

  if (cancelButton) {
    cancelButton.onclick =
      closeMaintenanceModal;
  }

  const closeButton =
    document.querySelector(
      '#modal .modal-close'
    );

  if (closeButton) {
    closeButton.onclick =
      closeMaintenanceModal;
  }

  const previewContainer =
    document.getElementById(
      'photo-previews'
    );

  if (previewContainer) {
    previewContainer.onclick =
      event => {
        const button =
          event.target.closest(
            '[data-pending-photo-remove]'
          );

        if (!button) return;

        removePendingPhoto(
          Number(
            button.dataset
              .pendingPhotoRemove
          )
        );
      };
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// LIGHTBOX
// ─────────────────────────────────────────────────────────────────────────────

function openLightbox(src) {
  const lightbox =
    document.getElementById(
      'lightbox'
    );

  const image =
    document.getElementById(
      'lightbox-img'
    );

  if (!lightbox || !image) {
    return;
  }

  image.src = src;

  lightbox.classList.add(
    'open'
  );
}


export function closeLightbox() {
  const lightbox =
    document.getElementById(
      'lightbox'
    );

  if (lightbox) {
    lightbox.classList.remove(
      'open'
    );
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// ESTADOS VISUAIS / ERROS
// ─────────────────────────────────────────────────────────────────────────────

function renderLoading(main) {
  main.innerHTML = `
    <div class="main-empty">
      <div style="font-size:40px">⏳</div>
      <p>Carregando manutenções...</p>
    </div>
  `;
}


function renderManutencoesError(message) {
  const main =
    document.getElementById('main');

  if (!main) return;

  main.innerHTML = `
    <div class="main-empty">
      <div style="font-size:40px">⚠️</div>

      <p>
        ${escapeHtml(message)}
      </p>

      <button
        class="btn btn-outline"
        id="retry-maintenance-btn"
        type="button">
        Tentar novamente
      </button>
    </div>
  `;

  document
    .getElementById(
      'retry-maintenance-btn'
    )
    ?.addEventListener(
      'click',
      () => {
        loadManutencoes().then(
          renderCurrentMaintenanceView
        );
      }
    );
}


function showUserError(message) {
  /*
   * Se futuramente app.js disponibilizar um
   * componente global de erros, este ponto será
   * substituído pela integração oficial.
   */
  console.error(message);

  const existing =
    document.querySelector(
      '.maintenance-error'
    );

  existing?.remove();

  const element =
    document.createElement('div');

  element.className =
    'maintenance-error';

  element.textContent =
    message;

  document.body.appendChild(
    element
  );

  window.setTimeout(
    () => element.remove(),
    5000
  );
}


function getErrorMessage(error) {
  if (error instanceof ApiError) {
    return (
      error.message ||
      'Não foi possível concluir a operação.'
    );
  }

  if (error?.message) {
    return error.message;
  }

  return (
    'Não foi possível concluir a operação.'
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

export function initializeManutencoes() {
  /*
   * O módulo não seleciona pousada ou espaço sozinho.
   *
   * app.js / espacos.js devem chamar:
   *
   * setEspacoManutencoes(pousadaId, espacoId)
   *
   * quando um espaço for selecionado.
   */
  window.addEventListener('espaco:selected', handleEspacoSelected);

  manutencoesState.currentFilter =
    'all';

  manutencoesState.currentTab =
    'historico';
}

