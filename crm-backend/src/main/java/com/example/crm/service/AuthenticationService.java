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

    public AuthResponse login(LoginRequest request) {
        // 1. Recherche de l'utilisateur par Login, Email OU Téléphone
        User user = userRepository.findByLogin(request.getIdentifiant())
                .or(() -> userRepository.findByEmail(request.getIdentifiant()))
                .or(() -> userRepository.findByTelephone(request.getIdentifiant()))
                .orElseThrow(() -> new RuntimeException("Identifiant ou mot de passe incorrect."));

        // 2. Vérification du mot de passe
        if (!passwordEncoder.matches(request.getMdp(), user.getMdp())) {
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

        // 5. Génération du Token JWT
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