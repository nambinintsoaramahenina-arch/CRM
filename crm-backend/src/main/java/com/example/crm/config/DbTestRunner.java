package com.example.crm.config;

import com.example.crm.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Vérification de démarrage — NE CRÉE AUCUN UTILISATEUR.
 *
 * Ce runner se contente d'afficher le nombre d'utilisateurs présents
 * en base de données PostgreSQL. Toute la gestion des comptes (création,
 * modification, suppression) doit passer exclusivement par l'interface
 * d'administration (/dashboard → Gestion des utilisateurs).
 *
 * L'administrateur initial doit être créé manuellement via un script SQL
 * ou l'outil pgAdmin, puis se connecter via /login avec ses identifiants.
 */
@Component
public class DbTestRunner implements CommandLineRunner {

    private final UserRepository userRepository;

    public DbTestRunner(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        long count = userRepository.count();
        System.out.println("====================================================");
        System.out.println("  CRM SPAT — Démarrage du serveur");
        System.out.println("  Utilisateurs en base de données : " + count);
        if (count == 0) {
            System.out.println("  AVERTISSEMENT : Aucun utilisateur trouvé en BDD.");
            System.out.println("  Créez un compte ADMIN via pgAdmin ou le script SQL :");
            System.out.println("  INSERT INTO utilisateurs (login, email, mdp, nom_complet, role, statut)");
            System.out.println("  VALUES ('admin', 'admin@spat.mg', '<bcrypt_hash>', 'Administrateur', 'ADMIN', 'ACTIF');");
        }
        System.out.println("====================================================");
    }
}