/**
 * frontend/js/api.js
 *
 * Cliente central da API REST do Sistema de Gestão de Manutenção.
 *
 * Responsabilidades:
 * - Centralizar chamadas HTTP para o backend.
 * - Trabalhar com JSON e FormData.
 * - Padronizar tratamento das respostas da API.
 * - Expor erros de forma consistente para os demais módulos.
 *
 * Contrato esperado da API:
 *
 * Sucesso objeto:
 * {
 *   "data": { ... }
 * }
 *
 * Sucesso lista:
 * {
 *   "data": [ ... ],
 *   "total": 0
 * }
 *
 * Erro:
 * {
 *   "error": {
 *     "code": "ERROR_CODE",
 *     "message": "Descrição do erro."
 *   }
 * }
 */

const API_BASE_URL = '/api';


/* ============================================================
   ERRO DA API
   ============================================================ */

export class ApiError extends Error {
  constructor(message, code = 'API_ERROR', status = 0, details = null) {
    super(message);

    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}


/* ============================================================
   CONFIGURAÇÃO DA REQUISIÇÃO
   ============================================================ */

function buildUrl(path) {
  if (!path) {
    throw new Error('Caminho da API não informado.');
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (path.startsWith('/api')) {
    return path;
  }

  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }

  return `${API_BASE_URL}/${path}`;
}


function buildHeaders(options = {}) {
  const headers = new Headers(options.headers || {});

  /*
   * Não definir Content-Type manualmente quando o body for FormData.
   * O navegador precisa gerar automaticamente o multipart/form-data
   * com o boundary correto.
   */
  if (
    options.body !== undefined &&
    options.body !== null &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('Accept', 'application/json');

  return headers;
}


function prepareBody(body) {
  if (
    body === undefined ||
    body === null ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams
  ) {
    return body;
  }

  if (typeof body === 'string') {
    return body;
  }

  return JSON.stringify(body);
}


/* ============================================================
   LEITURA DA RESPOSTA
   ============================================================ */

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();

    if (!text) {
      return null;
    }

    return text;
  } catch {
    return null;
  }
}


/* ============================================================
   TRATAMENTO DE ERROS
   ============================================================ */

function createApiError(response, payload) {
  const errorData =
    payload &&
    typeof payload === 'object' &&
    payload.error
      ? payload.error
      : null;

  const code =
    errorData?.code ||
    `HTTP_${response.status}`;

  const message =
    errorData?.message ||
    getDefaultErrorMessage(response.status);

  return new ApiError(
    message,
    code,
    response.status,
    errorData
  );
}


function getDefaultErrorMessage(status) {
  switch (status) {
    case 400:
      return 'Dados inválidos.';
    case 401:
      return 'Não autenticado.';
    case 403:
      return 'Você não tem permissão para realizar esta operação.';
    case 404:
      return 'Registro não encontrado.';
    case 409:
      return 'Não foi possível concluir a operação devido a um conflito.';
    case 422:
      return 'Os dados enviados não são válidos.';
    case 500:
      return 'Erro interno do servidor.';
    case 502:
    case 503:
    case 504:
      return 'O servidor está temporariamente indisponível.';
    default:
      return 'Não foi possível concluir a operação.';
  }
}


/* ============================================================
   REQUEST PRINCIPAL
   ============================================================ */

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers,
    signal
  } = options;

  const url = buildUrl(path);

  const requestHeaders = buildHeaders({
    headers,
    body
  });

  const requestBody = prepareBody(body);

  let response;

  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal,
      credentials: 'include'
    });
  } catch (error) {
    /*
     * AbortError significa que a requisição foi cancelada
     * intencionalmente.
     */
    if (error?.name === 'AbortError') {
      throw error;
    }

    throw new ApiError(
      'Não foi possível conectar ao servidor.',
      'NETWORK_ERROR',
      0,
      error
    );
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    throw createApiError(response, payload);
  }

  return payload;
}


/* ============================================================
   MÉTODOS HTTP
   ============================================================ */

export async function apiGet(path, options = {}) {
  return apiRequest(path, {
    ...options,
    method: 'GET'
  });
}


export async function apiPost(path, body = undefined, options = {}) {
  return apiRequest(path, {
    ...options,
    method: 'POST',
    body
  });
}


export async function apiPut(path, body = undefined, options = {}) {
  return apiRequest(path, {
    ...options,
    method: 'PUT',
    body
  });
}


export async function apiPatch(path, body = undefined, options = {}) {
  return apiRequest(path, {
    ...options,
    method: 'PATCH',
    body
  });
}


export async function apiDelete(path, options = {}) {
  return apiRequest(path, {
    ...options,
    method: 'DELETE'
  });
}


/* ============================================================
   HELPERS DE RESPOSTA
   ============================================================ */

/**
 * Extrai o campo "data" de uma resposta padrão.
 *
 * Exemplo:
 * { data: {...} }
 * -> {...}
 */
export function unwrapData(response) {
  if (
    response &&
    typeof response === 'object' &&
    Object.prototype.hasOwnProperty.call(response, 'data')
  ) {
    return response.data;
  }

  return response;
}


/**
 * Extrai uma lista da resposta padrão.
 *
 * Exemplo:
 * {
 *   data: [...],
 *   total: 10
 * }
 *
 * -> {
 *   data: [...],
 *   total: 10
 * }
 */
export function unwrapList(response) {
  if (
    response &&
    typeof response === 'object' &&
    Array.isArray(response.data)
  ) {
    return {
      data: response.data,
      total:
        typeof response.total === 'number'
          ? response.total
          : response.data.length
    };
  }

  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length
    };
  }

  return {
    data: [],
    total: 0
  };
}


/* ============================================================
   API DE AUTENTICAÇÃO
   ============================================================ */

export const authApi = {
  login(credentials) {
    return apiPost('/auth/login', credentials);
  },

  logout() {
    return apiPost('/auth/logout');
  },

  me() {
    return apiGet('/auth/me');
  }
};


/* ============================================================
   API DE POUSADAS
   ============================================================ */

export const pousadasApi = {
  list() {
    return apiGet('/pousadas');
  },

  get(id) {
    return apiGet(`/pousadas/${id}`);
  },

  create(data) {
    return apiPost('/pousadas', data);
  },

  update(id, data) {
    return apiPut(`/pousadas/${id}`, data);
  },

  remove(id) {
    return apiDelete(`/pousadas/${id}`);
  }
};


/* ============================================================
   API DE ESPAÇOS
   ============================================================ */

export const espacosApi = {
  list(pousadaId) {
    return apiGet(`/pousadas/${pousadaId}/espacos`);
  },

  get(id) {
    return apiGet(`/espacos/${id}`);
  },

  create(pousadaId, data) {
    return apiPost(`/pousadas/${pousadaId}/espacos`, data);
  },

  update(id, data) {
    return apiPut(`/espacos/${id}`, data);
  },

  remove(id) {
    return apiDelete(`/espacos/${id}`);
  }
};


/* ============================================================
   API DE MANUTENÇÕES
   ============================================================ */

export const manutencoesApi = {
  list(pousadaId, params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        query.set(key, value);
      }
    });

    const queryString = query.toString();

    return apiGet(
      `/pousadas/${pousadaId}/manutencoes${
        queryString ? `?${queryString}` : ''
      }`
    );
  },

  get(id) {
    return apiGet(`/manutencoes/${id}`);
  },

  create(pousadaId, data) {
    return apiPost(`/pousadas/${pousadaId}/manutencoes`, data);
  },

  update(id, data) {
    return apiPut(`/manutencoes/${id}`, data);
  },

  remove(id) {
    return apiDelete(`/manutencoes/${id}`);
  }
};


/* ============================================================
   API DE FOTOS
   ============================================================ */

export const fotosApi = {
  list(manutencaoId) {
    return apiGet(`/manutencoes/${manutencaoId}/fotos`);
  },

  upload(manutencaoId, file, extraData = {}) {
    const formData = new FormData();

    formData.append('file', file);

    Object.entries(extraData).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null
      ) {
        formData.append(key, value);
      }
    });

    return apiPost(
      `/manutencoes/${manutencaoId}/fotos`,
      formData
    );
  },

  remove(id) {
    return apiDelete(`/fotos/${id}`);
  }
};


/* ============================================================
   API DE DASHBOARD
   ============================================================ */

export const dashboardApi = {
  get(pousadaId) {
    return apiGet(`/pousadas/${pousadaId}/dashboard`);
  }
};


/* ============================================================
   API DE RELATÓRIOS
   ============================================================ */

function buildReportQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      query.set(key, value);
    }
  });

  const queryString = query.toString();

  return queryString
    ? `?${queryString}`
    : '';
}


export const relatoriosApi = {
  manutencoes(pousadaId, params = {}) {
    return apiGet(
      `/pousadas/${pousadaId}/relatorios/manutencoes${buildReportQuery(params)}`
    );
  },

  custos(pousadaId, params = {}) {
    return apiGet(
      `/pousadas/${pousadaId}/relatorios/custos${buildReportQuery(params)}`
    );
  },

  pendencias(pousadaId, params = {}) {
    return apiGet(
      `/pousadas/${pousadaId}/relatorios/pendencias${buildReportQuery(params)}`
    );
  }
};


/* ============================================================
   API DE AUDITORIA
   ============================================================ */

export const auditoriaApi = {
  list(pousadaId, params = {}) {
    return apiGet(
      `/pousadas/${pousadaId}/auditoria${buildReportQuery(params)}`
    );
  }
};


/* ============================================================
   EXPORT DEFAULT
   ============================================================ */

export default {
  request: apiRequest,

  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,

  unwrapData,
  unwrapList,

  auth: authApi,
  pousadas: pousadasApi,
  espacos: espacosApi,
  manutencoes: manutencoesApi,
  fotos: fotosApi,
  dashboard: dashboardApi,
  relatorios: relatoriosApi,
  auditoria: auditoriaApi
};