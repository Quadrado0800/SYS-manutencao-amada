import { authApi, ApiError, unwrapData } from './api.js';

const AUTH_STORAGE_KEY = 'gestao_manutencao_auth';

const authState = {
    user: null,
    isAuthenticated: false,
    loading: false
};

function saveAuthState() {
    try {
        if (!authState.user) {
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
            return;
        }

        sessionStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify(authState.user)
        );
    } catch (error) {
        console.warn('Não foi possível salvar o estado de autenticação.', error);
    }
}

function clearAuthState() {
    authState.user = null;
    authState.isAuthenticated = false;

    try {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
        console.warn('Não foi possível limpar o estado de autenticação.', error);
    }
}

function setAuthState(user) {
    authState.user = user || null;
    authState.isAuthenticated = Boolean(user);

    if (user) {
        saveAuthState();
    } else {
        clearAuthState();
    }
}

function getAuthState() {
    return {
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        loading: authState.loading
    };
}

function getCurrentUser() {
    return authState.user;
}

const getUser = getCurrentUser;

function isAuthenticated() {
    return authState.isAuthenticated;
}

function hasRole(...roles) {
    if (!authState.user) {
        return false;
    }

    const userRole = String(authState.user.role || '').toLowerCase();

    return roles.some(
        role => userRole === String(role).toLowerCase()
    );
}

function canEdit() {
    return hasRole('admin', 'manutencao');
}

function isAdmin() {
    return hasRole('admin');
}

function isChefe() {
    return hasRole('chefe');
}

function isManutencao() {
    return hasRole('manutencao');
}

function getUserDisplayName() {
    if (!authState.user) {
        return '';
    }

    return (
        authState.user.nome ||
        authState.user.name ||
        authState.user.username ||
        authState.user.email ||
        ''
    );
}

function getUserRole() {
    if (!authState.user) {
        return '';
    }

    return String(authState.user.role || '').toLowerCase();
}

function getUserRoleLabel() {
    const role = getUserRole();

    const labels = {
        admin: '👑 Admin',
        chefe: '👔 Gerência',
        manutencao: '🔧 Manutenção'
    };

    return labels[role] || role;
}

function getUserPousadas() {
    if (!authState.user) {
        return [];
    }

    return (
        authState.user.pousadas ||
        authState.user.pousada ||
        []
    );
}

async function login(username, password) {
    if (!username || !password) {
        throw new ApiError(
            'VALIDATION_ERROR',
            'Informe usuário e senha.'
        );
    }

    authState.loading = true;

    try {
        const user = unwrapData(
            await authApi.login({ username, password })
        );

        setAuthState(user);

        return user;
    } finally {
        authState.loading = false;
    }
}

async function logout() {
    authState.loading = true;

    try {
        await authApi.logout();
    } catch (error) {
        /*
         * Mesmo que o backend retorne erro no logout,
         * a sessão local deve ser encerrada.
         */
        console.warn('Erro ao encerrar sessão no servidor:', error);
    } finally {
        clearAuthState();
        authState.loading = false;
    }
}

async function loadCurrentUser() {
    authState.loading = true;

    try {
        const user = unwrapData(await authApi.me());

        setAuthState(user);

        return user;
    } catch (error) {
        clearAuthState();

        /*
         * Uma sessão inexistente/expirada não deve ser tratada
         * como erro fatal durante a inicialização do frontend.
         */
        if (
            error instanceof ApiError &&
            (
                error.status === 401 ||
                error.code === 'UNAUTHORIZED'
            )
        ) {
            return null;
        }

        throw error;
    } finally {
        authState.loading = false;
    }
}

function restoreCachedUser() {
    try {
        const storedUser = sessionStorage.getItem(AUTH_STORAGE_KEY);

        if (!storedUser) {
            return null;
        }

        const user = JSON.parse(storedUser);

        if (!user || typeof user !== 'object') {
            clearAuthState();
            return null;
        }

        /*
         * O cache serve apenas para manter informações de interface
         * enquanto a sessão real é validada pelo backend.
         */
        authState.user = user;
        authState.isAuthenticated = true;

        return user;
    } catch (error) {
        clearAuthState();
        return null;
    }
}

async function initializeAuth() {
    /*
     * Recupera temporariamente o usuário armazenado para evitar
     * que a interface fique sem contexto durante a inicialização.
     */
    restoreCachedUser();

    /*
     * A sessão real deve ser confirmada pelo backend através do /me.
     */
    try {
        return await loadCurrentUser();
    } catch (error) {
        clearAuthState();
        throw error;
    }
}

export {
    authState,
    login,
    logout,
    initializeAuth,
    loadCurrentUser,
    restoreCachedUser,
    getAuthState,
    getCurrentUser,
    getUser,
    isAuthenticated,
    hasRole,
    canEdit,
    isAdmin,
    isChefe,
    isManutencao,
    getUserDisplayName,
    getUserRole,
    getUserRoleLabel,
    getUserPousadas
};

export default {
    authState,
    login,
    logout,
    initializeAuth,
    loadCurrentUser,
    restoreCachedUser,
    getAuthState,
    getCurrentUser,
    getUser,
    isAuthenticated,
    hasRole,
    canEdit,
    isAdmin,
    isChefe,
    isManutencao,
    getUserDisplayName,
    getUserRole,
    getUserRoleLabel,
    getUserPousadas
};
