// frontend/js/app.js
//
// Responsabilidade:
// - inicializar a aplicação;
// - controlar autenticação em conjunto com auth.js;
// - carregar e selecionar a pousada;
// - integrar a pousada selecionada com os módulos da aplicação;
// - controlar navegação principal.
//
// Dependências:
// - api.js
// - auth.js
// - espacos.js
//
// Observação:
// - permissões reais são responsabilidade do backend;
// - o frontend apenas adapta a interface ao usuário autenticado.

import {
  initializeAuth,
  login as authLogin,
  logout as authLogout,
  getUser,
  getUserDisplayName,
  getUserRoleLabel,
} from './auth.js';

import {
  pousadasApi,
  ApiError,
} from './api.js';

import {
  initializeEspacos,
  loadEspacos,
  setPousada,
  clearEspacos,
} from './espacos.js';

import {
  initializeManutencoes,
  setPousadaManutencoes,
  clearManutencoes
} from './manutencoes.js';

import {
  initializeRelatorios,
  setPousadaRelatorios,
  loadReport
} from './relatorios.js';

const appState = {
  initialized: false,
  loading: false,
  currentPage: 'espacos',

  user: null,

  pousadas: [],
  currentPousadaId: null,

  error: null,
};


// ============================================================================
// GETTERS
// ============================================================================

export function getAppState() {
  return {
    ...appState,
    pousadas: [...appState.pousadas],
  };
}

export function getCurrentPousadaId() {
  return appState.currentPousadaId;
}

export function getCurrentPousada() {
  return (
    appState.pousadas.find(
      (pousada) =>
        String(pousada.id) === String(appState.currentPousadaId)
    ) || null
  );
}

export function getPousadas() {
  return [...appState.pousadas];
}

export function isAppLoading() {
  return appState.loading;
}

export function getAppError() {
  return appState.error;
}


// ============================================================================
// UI HELPERS
// ============================================================================

function getElement(id) {
  return document.getElementById(id);
}

function showElement(id) {
  const element = getElement(id);

  if (element) {
    element.style.display = '';
  }
}

function hideElement(id) {
  const element = getElement(id);

  if (element) {
    element.style.display = 'none';
  }
}

function setLoading(loading) {
  appState.loading = loading;

  document.body.classList.toggle('is-loading', loading);
}

function setError(message) {
  appState.error = message || null;

  console.error('[APP]', message || '');
}

function clearError() {
  appState.error = null;
}


// ============================================================================
// LOGIN / APP VISIBILITY
// ============================================================================

function showLoginScreen() {
  showElement('login-screen');
  hideElement('app-header');
  hideElement('page-espacos');
  hideElement('page-relatorios');
}

function showApplication() {
  hideElement('login-screen');
  showElement('app-header');
}


// ============================================================================
// USER INTERFACE
// ============================================================================

function updateUserUI() {
  const user = appState.user;

  const badge = getElement('user-badge');

  if (badge) {
    if (!user) {
      badge.textContent = '—';
      return;
    }

    const name = getUserDisplayName(user);
    const role = getUserRoleLabel(user);

    badge.textContent = role
      ? `${name} · ${role}`
      : name;
  }
}

function updatePousadaHeader() {
  const pousada = getCurrentPousada();

  const nameElement = getElement('header-pousada-name');

  if (nameElement) {
    nameElement.textContent =
      pousada?.nome ||
      pousada?.name ||
      'de Manutenção';
  }

  document.title = pousada
    ? `${pousada.nome || pousada.name} — Gestão de Manutenção`
    : 'Gestão de Manutenção';
}


// ============================================================================
// POUSADAS
// ============================================================================

function normalizePousada(pousada) {
  return {
    ...pousada,

    id: pousada?.id ?? null,

    nome:
      pousada?.nome ??
      pousada?.name ??
      'Pousada sem nome',

    slug:
      pousada?.slug ??
      '',

    ativa:
      pousada?.ativa ??
      pousada?.active ??
      true,
  };
}

function getActivePousadas() {
  return appState.pousadas.filter(
    (pousada) => pousada.ativa !== false
  );
}

export async function loadPousadas() {
  try {
    clearError();

    const response = await pousadasApi.list();

    const pousadas = Array.isArray(response)
      ? response
      : response?.data ?? [];

    appState.pousadas = pousadas
      .map(normalizePousada)
      .filter((pousada) => pousada.ativa !== false);

    return getPousadas();

  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : 'Não foi possível carregar as pousadas.';

    setError(message);

    throw error;
  }
}


// ============================================================================
// SELEÇÃO DA POUSADA
// ============================================================================

export async function selectPousada(pousadaId) {
  if (!pousadaId) {
    return;
  }

  const pousada = appState.pousadas.find(
    item => String(item.id) === String(pousadaId)
  );

  if (!pousada) {
    return;
  }

  appState.currentPousadaId = pousada.id;

  setPousada(pousada.id);
  setPousadaManutencoes(pousada.id);
  setPousadaRelatorios(pousada.id);

  await loadEspacos(pousada.id, {
    preserveSelection: false,
    autoSelectFirst: true
  });

  window.dispatchEvent(
    new CustomEvent('pousada:changed', {
      detail: {
        pousadaId: pousada.id,
        pousada
      }
    })
  );

  renderPousadaHeader();
  renderPousadaSelector();
}


// ============================================================================
// SELETOR DE POUSADA
// ============================================================================
//
// O index.html atual não possui ainda um componente visual definido
// especificamente para seleção de pousada.
//
// Por isso, não vamos inventar uma estrutura HTML nova nesta etapa.
// Quando o seletor for definido, esta função poderá ser implementada
// utilizando a estrutura escolhida.
//

export function renderPousadaSelector() {
  const header = getElement('app-header');

  if (!header) return;

  let selector = getElement('pousada-selector');

  if (!selector) {
    selector = document.createElement('select');
    selector.id = 'pousada-selector';
    selector.className = 'form-select';
    selector.setAttribute('aria-label', 'Selecionar pousada');
    selector.addEventListener('change', event => {
      selectPousada(event.target.value);
    });
    header.querySelector('.header-center')?.prepend(selector);
  }

  selector.innerHTML = '<option value="">Selecione a pousada</option>';
  getActivePousadas().forEach(pousada => {
    const option = document.createElement('option');
    option.value = pousada.id;
    option.textContent = pousada.nome;
    option.selected = String(pousada.id) === String(appState.currentPousadaId);
    selector.appendChild(option);
  });
}


// ============================================================================
// EVENTO DE MUDANÇA DE POUSADA
// ============================================================================

function notifyPousadaChanged(pousada) {
  document.dispatchEvent(
    new CustomEvent('pousada:changed', {
      detail: {
        pousada,
        pousadaId: pousada?.id ?? null,
      },
    })
  );
}


// ============================================================================
// NAVEGAÇÃO
// ============================================================================

export function showPage(page) {
  const normalizedPage = String(page || '').toLowerCase();

  const allowedPages = [
    'espacos',
    'relatorios',
  ];

  if (!allowedPages.includes(normalizedPage)) {
    return;
  }

  appState.currentPage = normalizedPage;

  const espacosPage = getElement('page-espacos');
  const relatoriosPage = getElement('page-relatorios');

  if (espacosPage) {
    espacosPage.style.display =
      normalizedPage === 'espacos'
        ? ''
        : 'none';
  }

  if (relatoriosPage) {
    relatoriosPage.style.display =
      normalizedPage === 'relatorios'
        ? ''
        : 'none';
  }

  updateNavigationUI();
}

function updateNavigationUI() {
  const navEspacos = getElement('nav-espacos');
  const navRelatorios = getElement('nav-relatorios');

  navEspacos?.classList.toggle(
    'active',
    appState.currentPage === 'espacos'
  );

  navRelatorios?.classList.toggle(
    'active',
    appState.currentPage === 'relatorios'
  );
}


// ============================================================================
// LOGIN
// ============================================================================

async function handleLogin() {
  const usernameElement = getElement('login-user');
  const passwordElement = getElement('login-pass');

  const username = usernameElement?.value?.trim() || '';
  const password = passwordElement?.value || '';

  if (!username || !password) {
    setError('Informe usuário e senha.');
    return;
  }

  try {
    setLoading(true);
    clearError();

    const user = await authLogin(
      username,
      password
    );

    appState.user = user;

    await loadPousadas();

    showApplication();
    updateUserUI();
    renderPousadaSelector();

    const activePousadas = getActivePousadas();

    if (activePousadas.length === 1) {
      await selectPousada(activePousadas[0].id);
    } else {
      // Não escolher uma pousada arbitrariamente.
      //
      // Quando houver mais de uma pousada disponível,
      // o seletor deverá permitir que o usuário escolha.
      setPousada(null);
      clearEspacos();
      updatePousadaHeader();
      renderPousadaSelector();
    }

    showPage('espacos');

  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : 'Não foi possível realizar o login.';

    setError(message);

    console.error('[LOGIN]', error);

  } finally {
    setLoading(false);
  }
}


// ============================================================================
// LOGOUT
// ============================================================================

async function handleLogout() {
  try {
    setLoading(true);

    await authLogout();

  } catch (error) {
    console.error('[LOGOUT]', error);

  } finally {
    appState.user = null;
    appState.pousadas = [];
    appState.currentPousadaId = null;
    appState.currentPage = 'espacos';
    appState.error = null;

    clearEspacos();

    updateUserUI();
    updatePousadaHeader();

    showLoginScreen();

    setLoading(false);
  }
}


// ============================================================================
// EVENTOS
// ============================================================================

function bindEvents() {

  // Login
  const loginButton = getElement('login-btn');

  if (loginButton) {
    loginButton.addEventListener(
      'click',
      handleLogin
    );
  }


  // Logout
  const logoutButton = getElement('logout-btn');

  if (logoutButton) {
    logoutButton.addEventListener(
      'click',
      handleLogout
    );
  }


  // Enter no campo de usuário/senha
  const usernameInput = getElement('login-user');
  const passwordInput = getElement('login-pass');

  [usernameInput, passwordInput]
    .filter(Boolean)
    .forEach((input) => {
      input.addEventListener(
        'keydown',
        (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            handleLogin();
          }
        }
      );
    });


  // Navegação
  const navEspacos = getElement('nav-espacos');
  const navRelatorios = getElement('nav-relatorios');

  navEspacos?.addEventListener(
    'click',
    () => showPage('espacos')
  );

  navRelatorios?.addEventListener(
    'click',
    () => showPage('relatorios')
  );
}


// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

export async function initializeApp() {
  if (appState.initialized) {
    return;
  }

  appState.initialized = true;

  bindEvents();

  initializeEspacos();
  initializeManutencoes();
  initializeRelatorios();

  try {
    setLoading(true);

    const user = await initializeAuth();

    appState.user = user;

    if (!user) {
      showLoginScreen();
      return;
    }

    await loadPousadas();

    showApplication();
    updateUserUI();
    renderPousadaSelector();

    const activePousadas = getActivePousadas();

    if (activePousadas.length === 1) {
      await selectPousada(activePousadas[0].id);

    } else {
      // Com múltiplas pousadas, aguardamos a seleção explícita.
      setPousada(null);
      clearEspacos();
      updatePousadaHeader();
    }

    showPage('espacos');

  } catch (error) {
    console.error(
      '[APP INIT]',
      error
    );

    showLoginScreen();

  } finally {
    setLoading(false);
  }
}


// ============================================================================
// EVENTOS PÚBLICOS
// ============================================================================

document.addEventListener(
  'DOMContentLoaded',
  initializeApp
);
