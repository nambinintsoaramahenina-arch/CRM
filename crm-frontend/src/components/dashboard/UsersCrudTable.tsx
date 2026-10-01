'use client';

import React, { useState, useEffect } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser, User } from '@/services/userServices';

// Icônes SVG intégrées
const SearchIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);
const PlusIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
);
const EditIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);
const TrashIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

export const UsersCrudTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [matricule, setMatricule] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('USER');
  const [status, setStatus] = useState<string>('ACTIF');

  // Charger les utilisateurs depuis la base de données au montage du composant
  const loadUsersFromAPI = async () => {
    setLoading(true);
    const token = localStorage.getItem('crm-token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // fetchUsers renvoie soit une liste, soit un objet Page de Spring Boot (ex: { content: [...] })
      const data = await fetchUsers(token, 0, 50);
      const userList = data.content ? data.content : (Array.isArray(data) ? data : []);
      setUsers(userList);
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs depuis la BDD", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersFromAPI();
  }, []);

  const filteredUsers = users.filter((u) => {
    const userName = u.nomComplet || '';
    const userLogin = u.login || '';
    const userEmail = u.email || '';
    
    const matchesSearch =
      userName.toLowerCase().includes(search.toLowerCase()) ||
      userLogin.toLowerCase().includes(search.toLowerCase()) ||
      userEmail.toLowerCase().includes(search.toLowerCase());
      
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setMatricule(`SPAT-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setEmail('');
    setPassword('');
    setRole('USER');
    setStatus('ACTIF');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setMatricule(u.login || '');
    setName(u.nomComplet || '');
    setEmail(u.email || '');
    setPassword('');
    setRole(u.role);
    setStatus(u.statut || 'ACTIF');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      const token = localStorage.getItem('crm-token');
      try {
        if (token) {
          await deleteUser(token, id);
          // Recharge la liste directement depuis la BDD
          loadUsersFromAPI();
        }
      } catch (err) {
        console.error("Erreur lors de la suppression en BDD", err);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const token = localStorage.getItem('crm-token');
    if (!token) {
      alert("Token d'authentification manquant. Veuillez vous reconnecter.");
      return;
    }

    try {
      const apiData = {
        nomComplet: name,
        login: matricule.toLowerCase(),
        email,
        mdp: password,
        role,
        statut: status
      };

      if (editingUser) {
        await updateUser(token, editingUser.id, apiData);
      } else {
        await createUser(token, apiData);
      }

      setIsModalOpen(false);
      // Actualiser la liste depuis la base de données
      loadUsersFromAPI();
    } catch (err: any) {
      console.error("Erreur lors de l'enregistrement en BDD :", err);
      alert(err.message || "Erreur lors de l'enregistrement.");
    }
  };

  return (
    <div className="bg-[var(--bg-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--bg-border)] shadow-xl shadow-slate-900/5 transition-all space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-600">Administration</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
            Gestion des Utilisateurs
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Tableau relié à la base de données PostgreSQL pour gérer les comptes de l'application.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 shadow-lg shadow-cyan-900/20 transition-all active:scale-95 shrink-0"
        >
          <PlusIcon size={16} />
          <span>Ajouter un utilisateur</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-72">
          <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, login..."
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

      <div className="overflow-x-auto rounded-2xl border border-[var(--bg-border)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-surface-2)] border-b border-[var(--bg-border)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <th className="py-3.5 px-4">Login / Matricule</th>
              <th className="py-3.5 px-4">Nom complet</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Rôle</th>
              <th className="py-3.5 px-4">Statut</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--bg-border)] text-xs font-medium text-[var(--text-primary)]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                  Chargement des utilisateurs depuis la base de données...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                  Aucun utilisateur trouvé en base de données.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isActive = u.statut === 'ACTIF' || u.statut === 'ACTIVE' || u.statut === 'Actif';
                return (
                  <tr key={u.id} className="hover:bg-[var(--bg-surface-2)]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-cyan-600 dark:text-cyan-400">
                      {u.login}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      {u.nomComplet}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.role === 'MANAGER' || u.role === 'ADMIN'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
                        }`}
                      >
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
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <EditIcon size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <TrashIcon size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[var(--bg-surface)] rounded-2xl border border-[var(--bg-border)] shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--bg-border)] pb-4">
              <h4 className="text-lg font-black text-[var(--text-primary)]">
                {editingUser ? 'Modifier l’utilisateur' : 'Ajouter un utilisateur'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Login / Matricule</label>
                <input
                  type="text"
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Nom complet</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Rova Harivelo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Adresse Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@spat.mg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser ? "Laisser vide pour ne pas modifier" : "Définir un mot de passe"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium"
                  required={!editingUser}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Rôle</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium"
                  >
                    <option value="USER">Client</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Statut</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface-2)] text-xs text-[var(--text-primary)] font-medium"
                  >
                    <option value="ACTIF">Actif</option>
                    <option value="INACTIF">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--bg-border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 shadow-md"
                >
                  {editingUser ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};