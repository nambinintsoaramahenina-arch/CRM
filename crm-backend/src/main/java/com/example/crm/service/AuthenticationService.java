package com.example.crm.service;

import com.example.crm.dto.AuthResponse;
import com.example.crm.dto.LoginRequest;
import com.example.crm.entity.Role;
import com.example.crm.entity.User;
import com.example.crm.repository.UserRepository;
import com.example.crm.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthenticationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired(required = false)
    private JournalActiviteService journalActiviteService;

    public AuthResponse login(LoginRequest request) {
        String identifiant = request.getIdentifiant() != null ? request.getIdentifiant().trim() : "";
        String inputMdp = request.getMdp() != null ? request.getMdp().trim() : "";

        // 1. Recherche de l'utilisateur par Login, Email OU Téléphone (findFirst pour éviter "2 results were returned")
        User user = userRepository.findFirstByLogin(identifiant)
                .or(() -> userRepository.findFirstByEmail(identifiant))
                .or(() -> userRepository.findFirstByTelephone(identifiant))
                .orElseThrow(() -> new RuntimeException("Identifiant ou mot de passe incorrect."));

        // 2. Vérification robuste du mot de passe
        boolean passwordMatches = false;
        String dbMdp = user.getMdp();

        if (dbMdp != null) {
            if (dbMdp.startsWith("$2a$") || dbMdp.startsWith("$2b$") || dbMdp.startsWith("$2y$")) {
                passwordMatches = passwordEncoder.matches(inputMdp, dbMdp);
            } else {
                // Mot de passe potentiellement enregistré en texte clair : validation directe et migration automatique vers BCrypt
                passwordMatches = inputMdp.equals(dbMdp) || passwordEncoder.matches(inputMdp, dbMdp);
                if (passwordMatches) {
                    user.setMdp(passwordEncoder.encode(inputMdp));
                    userRepository.save(user);
                }
            }
        }

        if (!passwordMatches) {
            throw new RuntimeException("Identifiant ou mot de passe incorrect.");
        }

        // 3. Vérification du statut du compte (s'il est renseigné)
        if (user.getStatut() != null && "INACTIF".equalsIgnoreCase(user.getStatut())) {
            throw new RuntimeException("Compte inactif. Veuillez contacter un administrateur.");
        }

        // 4. Mise à jour des dates de connexion
        user.setDerniereConnexion(user.getDateConnexion());
        user.setDateConnexion(LocalDateTime.now());
        userRepository.save(user);

        // 5. Journalisation de la connexion dans PostgreSQL
        if (journalActiviteService != null) {
            try {
                String userName = user.getNomComplet() != null ? user.getNomComplet() : user.getLogin();
                journalActiviteService.logAction(
                    user,
                    "CONNEXION",
                    "Authentification",
                    user.getId(),
                    String.format("Connexion réussie de l'utilisateur '%s' (Rôle: %s)", userName, user.getRole())
                );
            } catch (Exception ignored) {
            }
        }

        // 6. Génération du Token JWT
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getRole() != null ? user.getRole().name() : "USER", user.getNomComplet());
    }

    public AuthResponse loginAdmin(LoginRequest request) {
        AuthResponse response = login(request);
        if (!"ADMIN".equalsIgnoreCase(response.getRole())) {
            throw new RuntimeException("Accès refusé : Seuls les administrateurs peuvent se connecter ici.");
        }
        return response;
    }
}