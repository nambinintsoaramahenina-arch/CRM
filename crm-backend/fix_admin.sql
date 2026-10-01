DELETE FROM utilisateurs;

INSERT INTO utilisateurs (nom_complet, email, telephone, login, mdp, role) 
VALUES ('Super Admin', 'admin@test.com', '0340000000', 'admin', '$2a$10$S4fm0nCXoTZnVCoHiSxAiu2PDE6VJuu6ATnVG/ZBR4SXOO2y/9KL2', 'ADMIN');
