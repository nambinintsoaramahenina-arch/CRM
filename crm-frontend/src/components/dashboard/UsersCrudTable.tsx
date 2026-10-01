'use client';

import React, { useState, useEffect } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser, User } from '@/services/userServices';

// ─── Icônes SVG ────────────────────────────────────────────────────────────────

const SearchIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const PlusIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const EditIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const TrashIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const PhoneIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" />
  </svg>
);
const EyeIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// ─── Types ─────────────────────────────────────────────────────────────────────

type ConnectedRole = 'ADMIN' | 'MANAGER' | 'USER';

// ─── Composant principal ────────────────────────────────────────────────────────

export const UsersCrudTable: React.FC = () => {
  const [connectedRole, setConnectedRole] = useState<ConnectedRole>('USER');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const [matricule, setMatricule] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [formRole, setFormRole] = useState<string>('USER');
  const [status, setStatus] = useState<string>('ACTIF');

  useEffect(() => {
    const savedRole = (localStorage.getItem('crm-role') || 'USER') as ConnectedRole;
    setConnectedRole(savedRole);
  }, []);

  const isAdmin = connectedRole === 'ADMIN';
  const canWrite = isAdmin;

  const loadUsersFromAPI = async () => {
    setLoading(true);
    const token = localStorage.getItem('crm-token');
    if (!token) { setLoading(false); return; }
    try {
      const data = await fetchUsers(token, 0, 50);
      const userList = data.content ? data.content : (Array.isArray(data) ? data : []);
      setUsers(userList);
    } catch (err) {
      console.error('Erreur lors de la recuperation des utilisateurs depuis la BDD', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsersFromAPI(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredUsers = users.filter((u) => {
    // Les comptes ADMIN sont masqués de l'interface (frontend only)
    if (u.role === 'ADMIN') return false;
    const matchesSearch =
      (u.nomComplet || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.login || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.telephone || '').includes(search);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenAddModal = () => {
    if (!canWrite) return;
    setEditingUser(null);
    setMatricule(`SPAT-${Math.floor(100 + Math.random() * 900)}`);
    setName(''); setEmail(''); setTelephone(''); setPassword('');
    setFormRole('USER'); setStatus('ACTIF');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    if (!canWrite) return;
    setEditingUser(u);
    setMatricule(u.login || ''); setName(u.nomComplet || ''); setEmail(u.email || '');
    setTelephone(u.telephone || ''); setPassword('');
    setFormRole(u.role); setStatus(u.statut || 'ACTIF');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!canWrite) return;
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      const token = localStorage.getItem('crm-token');
      try {
        if (token) { await deleteUser(token, id); loadUsersFromAPI(); }
      } catch (err) {
        console.error('Erreur lors de la suppression en BDD', err);
        alert('Erreur lors de la suppression.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite || !name || !email) return;
    const token = localStorage.getItem('crm-token');
    if (!token) { alert("Token manquant. Veuillez vous reconnecter."); return; }
    try {
      const apiData = {
        nomComplet: name, login: matricule.toLowerCase(), email,
        telephone: telephone || undefined, mdp: password, role: formRole, statut: status,
      };
      if (editingUser) {
        await updateUser(token, editingUser.id, apiData);
      } else {
        await createUser(token, apiData);
      }
      setIsModalOpen(false);
      loadUsersFromAPI();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'enregistrement.";
      alert(message);
    }
  };

  return (
    <div className="bg-[var(--bg-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--bg-border)] shadow-xl shadow-slate-900/5 transition-all space-y-6">

      {/* En-tete */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-600">
              {isAdmin ? 'Administration' : 'Consultation'}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
            Gestion des Utilisateurs
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {isAdmin
              ? "Tableau relie a la base de donnees PostgreSQL pour gerer les comptes de l'application."
              : 'Consultation de la liste des utilisateurs enregistres dans la base de donnees.'}
          </p>
        </div>

        {isAdmin ? (
          <button
            id="btn-ajouter-utilisateur"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 shadow-lg shadow-cyan-900/20 transition-all active:scale-95 shrink-0"
          >
            <PlusIcon size={16} />
            <span>Ajouter un utilisateur</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 shrink-0">
            <EyeIcon size={14} />
            Mode lecture seule
          </div>
        )}
      </div>

      {/* Barre recherche + filtres */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-72">
          <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            id="search-utilisateurs"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, login, telephone..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[var(--bg-surface-2)] border border-[var(--bg-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'MANAGER', label: 'Manager' },
            { id: 'USER', label: 'Client' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setRoleFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                roleFilter === f.id
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--bg-border)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--bg-border)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-surface-2)] border-b border-[var(--bg-border)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <th className="py-3.5 px-4">Login / Matricule</th>
              <th className="py-3.5 px-4">Nom complet</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Telephone</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Statut</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--bg-border)] text-xs font-medium text-[var(--text-primary)]">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                    <div className="w-7 h-7 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    <span className="text-xs">Chargement des utilisateurs depuis la base de donnees...</span>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
                    <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="currentColor" className="opacity-40">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs font-semibold">
                      {search || roleFilter !== 'ALL'
                        ? 'Aucun resultat pour votre recherche.'
                        : 'Aucun utilisateur trouve en base de donnees.'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isActive = u.statut === 'ACTIF' || u.statut === 'ACTIVE' || u.statut === 'Actif';
                const roleBadge =
                  u.role === 'ADMIN'
                    ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300'
                    : u.role === 'MANAGER'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300';
                return (
                  <tr key={u.id} className="hover:bg-[var(--bg-surface-2)]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-cyan-600 dark:text-cyan-400">{u.login}</td>
                    <td className="py-3.5 px-4 font-bold">{u.nomComplet}</td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">{u.email}</td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                      {u.telephone ? (
                        <span className="inline-flex items-center gap-1">
                          <PhoneIcon size={12} className="text-cyan-500 shrink-0" />
                          {u.telephone}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] italic text-[10px]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {u.statut || 'Actif'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isAdmin ? (
                          <>
                            <button
                              id={`btn-edit-user-${u.id}`}
                              onClick={() => handleOpenEditModal(u)}
                              className="p-1.5 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <EditIcon size={15} />
                            </button>
                            <button
                              id={`btn-delete-user-${u.id}`}
                              onClick={() => handleDelete(u.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <TrashIcon size={15} />
                            </button>
                          </>
                        ) : (
                          <button
                            id={`btn-view-user-${u.id}`}
                            onClick={() => setViewingUser(u)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                            title="Voir le detail"
                          >
                            <EyeIcon size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Compteur */}
      {!loading && filteredUsers.length > 0 && (
        <p className="text-[11px] text-[var(--text-muted)] font-medium px-1">
          {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} affiche{filteredUsers.length > 1 ? 's' : ''}
          {users.length !== filteredUsers.length && ` sur ${users.length} au total`}
        </p>
      )}

      {/* Modale creation / modification — ADMIN uniquement */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] rounded-2xl border border-[var(--bg-border)] shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--bg-border)] pb-4">
              <h4 className="text-lg font-black text-[var(--text-primary)]">
                {editingUser ? "Modifier l'utilisateur" : 'Ajouter un utilisateur'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] font-bold w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-surface-2)] transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Login / Matricule</label>
                <input id="form-matricule" type="text" value={matricule} onChange={(e) => setMatricule(e.target.value)} required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Nom complet</label>
                <input id="form-nom" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Rova Harivelo" required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Adresse Email</label>
                <input id="form-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemple@spat.mg" required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" />
              </div>

              {/* Champ Numero de telephone */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">
                  Numero de telephone
                  <span className="ml-1 normal-case font-normal text-[var(--text-muted)]">(facultatif)</span>
                </label>
                <div className="relative">
                  <PhoneIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    id="form-telephone"
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="Ex: +261 34 00 000 00"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Mot de passe</label>
                <input id="form-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser ? 'Laisser vide pour ne pas modifier' : 'Definir un mot de passe'}
                  required={!editingUser}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Role</label>
                  <select id="form-role" value={formRole} onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all">
                    <option value="USER">Client</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Statut</label>
                  <select id="form-statut" value={status} onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all">
                    <option value="ACTIF">Actif</option>
                    <option value="INACTIF">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--bg-border)]">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors">
                  Annuler
                </button>
                <button id="form-submit" type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 shadow-md transition-all active:scale-95">
                  {editingUser ? 'Mettre a jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale detail lecture seule — MANAGER */}
      {viewingUser && !isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[var(--bg-surface)] rounded-2xl border border-[var(--bg-border)] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--bg-border)] pb-4">
              <h4 className="text-base font-black text-[var(--text-primary)]">Detail utilisateur</h4>
              <button onClick={() => setViewingUser(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] font-bold w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-surface-2)] transition-colors">
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shrink-0">
                {viewingUser.nomComplet?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="text-sm font-black text-[var(--text-primary)]">{viewingUser.nomComplet}</p>
                <p className="text-xs text-cyan-600 font-bold">{viewingUser.login}</p>
              </div>
            </div>

            <dl className="space-y-0 text-xs">
              {[
                { label: 'Email', value: viewingUser.email },
                { label: 'Telephone', value: viewingUser.telephone || '—' },
                { label: 'Role', value: viewingUser.role },
                { label: 'Statut', value: viewingUser.statut || 'Actif' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-[var(--bg-border)] last:border-0">
                  <dt className="font-bold text-[var(--text-muted)] uppercase text-[10px] tracking-wide">{label}</dt>
                  <dd className="font-semibold text-[var(--text-primary)]">{value}</dd>
                </div>
              ))}
            </dl>

            <button onClick={() => setViewingUser(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-border)] transition-colors">
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};