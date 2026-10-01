-- ============================================================
--  CRM SPAT — Script d'initialisation de l'administrateur
--  À exécuter UNE SEULE FOIS via pgAdmin ou psql
--  si aucun compte ADMIN n'existe encore en base.
-- ============================================================

-- Vérifier si un admin existe déjà (lecture seule)
SELECT id, login, email, role, statut FROM utilisateurs WHERE role = 'ADMIN';

-- Si aucun admin n'existe, insérer le compte initial.
-- Le hash BCrypt ci-dessous correspond au mot de passe : admin123
-- ⚠ CHANGEZ CE MOT DE PASSE dès la première connexion.
INSERT INTO utilisateurs (nom_complet, email, telephone, login, mdp, statut, role, date_connexion, derniere_connexion)
SELECT
    'Administrateur SPAT',
    'admin@spat.mg',
    NULL,
    'admin',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'ACTIF',
    'ADMIN',
    NOW(),
    NULL
WHERE NOT EXISTS (
    SELECT 1 FROM utilisateurs WHERE login = 'admin' OR role = 'ADMIN'
);

-- Confirmation
SELECT id, login, email, role, statut FROM utilisateurs WHERE role = 'ADMIN';
