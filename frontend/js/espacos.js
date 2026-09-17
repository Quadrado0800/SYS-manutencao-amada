// frontend/js/espacos.js
//
// Responsabilidade:
// - carregar espaços da pousada selecionada;
// - manter o estado dos espaços no frontend;
// - montar a sidebar de espaços;
// - filtrar espaços pela busca;
// - selecionar o espaço atual.
//
// Dependências:
// - api.js
//
// Integração:
// - app.js deve informar a pousada selecionada através de setPousada();
// - outros módulos podem consultar getEspacos() e getEspacoAtual().
//
// Observação:
// - este módulo não aplica segurança;
// - permissões devem continuar sendo aplicadas pelo backend.

import { espacosApi, ApiError } from './api.js';

const espacosState = {
  pousadaId: null,
  espacos: [],
  espacoAtualId: null,
  loading: false,
  error: null,
  filtro: '',
};

export function getEspacos() {
  return [...espacosState.espacos];
}

export function getEspacoAtualId() {
  return espacosState.espacoAtualId;
}

export function getEspacoAtual() {
  return (
    espacosState.espacos.find(
      (espaco) => String(espaco.id) === String(espacosState.espacoAtualId)
    ) || null
  );
}

export function isEspacosLoading() {
  return espacosState.loading;
}

export function getEspacosError() {
  return espacosState.error;
}

export function normalizeEspaco(espaco) {
  return {
    ...espaco,
    id: espaco?.id ?? null,
    pousada_id: espaco?.pousada_id ?? espaco?.pousadaId ?? null,
    nome: espaco?.nome ?? espaco?.name ?? 'Espaço sem nome',
    identificador:
      espaco?.identificador ??
      espaco?.identifier ??
      '',
    tipo: espaco?.tipo ?? espaco?.type ?? '',
    andar:
      espaco?.andar ??
      espaco?.floor ??
      '',
    ordem:
      espaco?.ordem ??
      espaco?.order ??
      0,
    ativo:
      espaco?.ativo ??
      espaco?.active ??
      true,
  };
}

function getSidebarElement() {
  return document.getElementById('sidebar-list');
}

function getSearchElement() {
  return document.getElementById('search-input');
}

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getFilteredEspacos() {
  const filtro = normalizeText(espacosState.filtro);

  if (!filtro) {
    return [...espacosState.espacos];
  }

  return espacosState.espacos.filter((espaco) => {
    const nome = normalizeText(espaco.nome);
    const identificador = normalizeText(espaco.identificador);
    const tipo = normalizeText(espaco.tipo);
    const andar = normalizeText(espaco.andar);

    return (
      nome.includes(filtro) ||
      identificador.includes(filtro) ||
      tipo.includes(filtro) ||
      andar.includes(filtro)
    );
  });
}

function groupByAndar(espacos) {
  const grouped = new Map();

  espacos.forEach((espaco) => {
    const andar = espaco.andar || 'Sem andar definido';

    if (!grouped.has(andar)) {
      grouped.set(andar, []);
    }

    grouped.get(andar).push(espaco);
  });

  return grouped;
}

function sortGroups(grouped) {
  return [...grouped.entries()].sort(([andarA, espacosA], [andarB, espacosB]) => {
    const primeiroA = espacosA[0];
    const primeiroB = espacosB[0];

    const ordemA = Number(primeiroA?.ordem ?? 0);
    const ordemB = Number(primeiroB?.ordem ?? 0);

    if (ordemA !== ordemB) {
      return ordemA - ordemB;
    }

    return String(andarA).localeCompare(
      String(andarB),
      'pt-BR',
      { numeric: true, sensitivity: 'base' }
    );
  });
}

function sortEspacos(espacos) {
  return [...espacos].sort((a, b) => {
    const ordemA = Number(a.ordem ?? 0);
    const ordemB = Number(b.ordem ?? 0);

    if (ordemA !== ordemB) {
      return ordemA - ordemB;
    }

    return String(a.nome).localeCompare(
      String(b.nome),
      'pt-BR',
      { numeric: true, sensitivity: 'base' }
    );
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createSpaceElement(espaco) {
  const div = document.createElement('div');

  const isActive =
    String(espaco.id) === String(espacosState.espacoAtualId);

  div.className = 'space-item' + (isActive ? ' active' : '');
  div.dataset.id = espaco.id;

  div.innerHTML = `
    <div class="space-dot"></div>
    <span class="space-name">${escapeHtml(espaco.nome)}</span>
    <span class="space-count"></span>
  `;

  div.addEventListener('click', () => {
    selectEspaco(espaco.id);
  });

  return div;
}

function renderEmptySidebar(message = 'Nenhum espaço encontrado.') {
  const list = getSidebarElement();

  if (!list) {
    return;
  }

  list.innerHTML = `
    <div class="no-entries" style="margin:16px;">
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

export function renderSidebar() {
  const list = getSidebarElement();

  if (!list) {
    return;
  }

  list.innerHTML = '';

  const espacosFiltrados = sortEspacos(getFilteredEspacos());

  if (espacosFiltrados.length === 0) {
    renderEmptySidebar(
      espacosState.filtro
        ? 'Nenhum espaço corresponde à busca.'
        : 'Nenhum espaço cadastrado.'
    );
    return;
  }

  const grouped = groupByAndar(espacosFiltrados);

  sortGroups(grouped).forEach(([andar, espacos]) => {
    const floorHeader = document.createElement('div');

    floorHeader.className = 'floor-header';
    floorHeader.textContent = andar;

    list.appendChild(floorHeader);

    sortEspacos(espacos).forEach((espaco) => {
      list.appendChild(createSpaceElement(espaco));
    });
  });
}

export function filterSidebar(filtro = '') {
  espacosState.filtro = filtro;
  renderSidebar();
}

export async function loadEspacos(pousadaId, options = {}) {
  const {
    preserveSelection = false,
    autoSelectFirst = true,
  } = options;

  if (!pousadaId) {
    espacosState.pousadaId = null;
    espacosState.espacos = [];
    espacosState.espacoAtualId = null;
    espacosState.error = null;

    renderSidebar();

    return [];
  }

  espacosState.loading = true;
  espacosState.error = null;
  espacosState.pousadaId = pousadaId;

  try {
    const response = await espacosApi.list(pousadaId);

    const espacos = Array.isArray(response)
      ? response
      : response?.data ?? [];

    espacosState.espacos = espacos
      .map(normalizeEspaco)
      .filter((espaco) => espaco.ativo !== false);

    if (
      preserveSelection &&
      espacosState.espacoAtualId &&
      espacosState.espacos.some(
        (espaco) =>
          String(espaco.id) === String(espacosState.espacoAtualId)
      )
    ) {
      // Mantém o espaço atual quando ele ainda pertence à nova pousada.
    } else if (
      autoSelectFirst &&
      espacosState.espacos.length > 0
    ) {
      espacosState.espacoAtualId = espacosState.espacos[0].id;
    } else {
      espacosState.espacoAtualId = null;
    }

    renderSidebar();

    return getEspacos();
  } catch (error) {
    espacosState.error =
      error instanceof ApiError
        ? error.message
        : 'Não foi possível carregar os espaços.';

    espacosState.espacos = [];
    espacosState.espacoAtualId = null;

    renderEmptySidebar(espacosState.error);

    throw error;
  } finally {
    espacosState.loading = false;
  }
}

export function selectEspaco(id) {
  const espaco = espacosState.espacos.find(
    (item) => String(item.id) === String(id)
  );

  if (!espaco) {
    return null;
  }

  espacosState.espacoAtualId = espaco.id;

  renderSidebar();

  notifyEspacoChanged(espaco);

  return espaco;
}

function notifyEspacoChanged(espaco) {
  document.dispatchEvent(
    new CustomEvent('espaco:changed', {
      detail: {
        espaco,
        espacoId: espaco?.id ?? null,
        pousadaId: espacosState.pousadaId,
      },
    })
  );
}

export function setPousada(pousadaId) {
  const mudouPousada =
    String(espacosState.pousadaId ?? '') !== String(pousadaId ?? '');

  espacosState.pousadaId = pousadaId ?? null;
  espacosState.filtro = '';

  if (mudouPousada) {
    espacosState.espacos = [];
    espacosState.espacoAtualId = null;
    espacosState.error = null;

    const searchInput = getSearchElement();

    if (searchInput) {
      searchInput.value = '';
    }
  }
}

function bindSidebarEvents() {
  const searchInput = getSearchElement();

  if (!searchInput || searchInput.dataset.espacosBound === 'true') {
    return;
  }

  searchInput.dataset.espacosBound = 'true';

  searchInput.addEventListener('input', (event) => {
    filterSidebar(event.target.value);
  });
}

export function initializeEspacos() {
  bindSidebarEvents();
  renderSidebar();
}

export function clearEspacos() {
  espacosState.pousadaId = null;
  espacosState.espacos = [];
  espacosState.espacoAtualId = null;
  espacosState.loading = false;
  espacosState.error = null;
  espacosState.filtro = '';

  const searchInput = getSearchElement();

  if (searchInput) {
    searchInput.value = '';
  }

  renderSidebar();
}

export default {
  getEspacos,
  getEspacoAtualId,
  getEspacoAtual,
  isEspacosLoading,
  getEspacosError,
  normalizeEspaco,
  loadEspacos,
  renderSidebar,
  filterSidebar,
  selectEspaco,
  setPousada,
  initializeEspacos,
  clearEspacos,
};