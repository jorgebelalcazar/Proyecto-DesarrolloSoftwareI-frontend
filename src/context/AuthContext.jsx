import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
    initializeAuth,
    logout as logoutService,
    setActiveRole as setActiveRoleService,
} from "../services/authService.js";

const AuthContext = createContext(null);

function normalizeRoles(rawRoles) {
    if (!Array.isArray(rawRoles)) return [];
    return rawRoles
    .map((rol) => {
        if (typeof rol === "string") return rol.trim();
        if (rol && typeof rol === "object") {
            return String(rol.nombre || rol.codigo || rol.rol || "").trim();
        }
        return "";
    })
    .filter(Boolean);
}

function normalizeUser(rawUser) {
    if (!rawUser || typeof rawUser !== "object") return null;
    const nombreCompleto = [rawUser.nombre, rawUser.apellidos].filter(Boolean).join(" ");
    return {
        ...rawUser,
        nombre: String(rawUser.nombre || nombreCompleto || rawUser.correo || rawUser.email || "Usuario"),
        email: String(rawUser.email || rawUser.correo || ""),
    };
}

export function AuthProvider({ children }) {
    const [session, setSession] = useState({
        user: null,
        roles: [],
        activeRole: null,

        /*user: { nombre: "Usuario Prueba", email: "prueba@correo.com" }, //Usuario de prueba, descomentar para probar el botón logout
        roles: ["AUTOR"],
        activeRole: "AUTOR",
       
        user: { nombre: "Admin Prueba", email: "admin@correo.com" }, // Usuario admin de prueba
        roles: ["ADMIN", "COMITE"],
        activeRole: "ADMIN",*/
    });

    useEffect(() => {
        initializeAuth();
    }, []);

    const startSession = useCallback((payload = {}) => {
        const user = normalizeUser(payload.user);
        const roles = normalizeRoles(payload.roles);
        const candidateRole =
        typeof payload.activeRole === "string"
        ? payload.activeRole
        : payload.activeRole?.nombre || null;

        const resolvedRole =
        candidateRole && (roles.length === 0 || roles.includes(candidateRole))
        ? candidateRole
        : roles[0] || null;

        setActiveRoleService(resolvedRole);

        setSession({
            user,
            roles,
            activeRole: resolvedRole,
        });
    }, []);

    const switchRole = useCallback((newRole) => {
        setSession((prev) => {
            if (!newRole || newRole === prev.activeRole) return prev;
            if (prev.roles.length > 0 && !prev.roles.includes(newRole)) return prev;

            setActiveRoleService(newRole);

            return {
                ...prev,
                activeRole: newRole,
            };
        });
    }, []);

    const endSession = useCallback(async () => {
        await logoutService();
        setSession({
            user: null,
            roles: [],
            activeRole: null,
        });
    }, []);

    const hasActiveRole = useCallback(
        (allowedRoles) => {
            if (!session.activeRole) return false;
            if (Array.isArray(allowedRoles)) {
                return allowedRoles.includes(session.activeRole);
            }
            return session.activeRole === allowedRoles;
        },
        [session.activeRole]
    );

    const hasAssignedRole = useCallback(
        (role) => session.roles.includes(role),
        [session.roles]
    );

    const value = useMemo(
        () => ({
            user: session.user,
            roles: session.roles,
            activeRole: session.activeRole,
            isAuthenticated: Boolean(session.user),
            startSession,
            switchRole,
            endSession,
            hasActiveRole,
            hasAssignedRole,
        }),
        [session, startSession, switchRole, endSession, hasActiveRole, hasAssignedRole]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if(!context) {
        throw new Error("useAuth debe utilizarse dentro de un <AuthProvider>.");
    }
    return context;
}