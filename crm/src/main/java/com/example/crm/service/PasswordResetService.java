package com.example.crm.service;

import com.example.crm.dto.ForgotPasswordRequest;
import com.example.crm.dto.ResetPasswordRequest;
import com.example.crm.entity.User;
import com.example.crm.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final int TOKEN_EXPIRATION_MINUTES = 30;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Étape 1 : Traitement de la demande de réinitialisation de mot de passe.
     * Recherche l'utilisateur par e-mail, génère un token unique, définit son expiration,
     * et simule l'envoi d'e-mail dans les logs du serveur.
     */
    @Transactional
    public Map<String, Object> processForgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail();
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("L'adresse e-mail est obligatoire.");
        }

        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new IllegalArgumentException("Aucun compte n'est associé à cette adresse e-mail : " + email));

        // Génération du token unique et calcul de la date d'expiration
        String resetToken = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(TOKEN_EXPIRATION_MINUTES);

        user.setResetToken(resetToken);
        user.setResetTokenExpiry(expiryDate);
        userRepository.save(user);

        // Simulation d'envoi d'e-mail dans les logs serveur
        log.info("================================================================================");
        log.info("[RÉINITIALISATION DE MOT DE PASSE] E-mail simulé pour : {}", user.getEmail());
        log.info("Token généré : {}", resetToken);
        log.info("Expire le : {}", expiryDate);
        log.info("Exemple de payload pour POST /api/auth/reset-password :");
        log.info("{\n  \"token\": \"{}\",\n  \"nouveauMdp\": \"VotreNouveauMotDePasse123!\"\n}", resetToken);
        log.info("================================================================================");

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", 200);
        response.put("message", "Un e-mail de réinitialisation a été envoyé (vérifiez également la console serveur).");
        response.put("email", user.getEmail());
        // Renvoyé également dans la réponse HTTP pour faciliter le test dans Postman / dev
        response.put("resetToken", resetToken);
        response.put("expiresAt", expiryDate);

        return response;
    }

    /**
     * Étape 2 : Réinitialisation effective du mot de passe.
     * Valide le token et sa date d'expiration, chiffre le nouveau mot de passe avec BCrypt,
     * met à jour l'utilisateur et invalide le token.
     */
    @Transactional
    public Map<String, Object> processResetPassword(ResetPasswordRequest request) {
        String token = request.getToken();
        String nouveauMdp = request.getNouveauMdp();

        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Le token de réinitialisation est obligatoire.");
        }

        if (nouveauMdp == null || nouveauMdp.trim().isEmpty()) {
            throw new IllegalArgumentException("Le nouveau mot de passe est obligatoire.");
        }

        if (nouveauMdp.trim().length() < 6) {
            throw new IllegalArgumentException("Le nouveau mot de passe doit comporter au moins 6 caractères.");
        }

        // Recherche de l'utilisateur porteur du token
        User user = userRepository.findByResetToken(token.trim())
                .orElseThrow(() -> new IllegalArgumentException("Token de réinitialisation invalide ou introuvable."));

        // Si un email a également été fourni dans la requête, vérifier la correspondance
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (!user.getEmail().equalsIgnoreCase(request.getEmail().trim())) {
                throw new IllegalArgumentException("L'adresse e-mail ne correspond pas à ce token de réinitialisation.");
            }
        }

        // Vérification de l'expiration du token
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Le token de réinitialisation a expiré. Veuillez refaire une demande.");
        }

        // Chiffrement du nouveau mot de passe avec BCrypt
        user.setMdp(passwordEncoder.encode(nouveauMdp.trim()));

        // Invalidation du token pour empêcher tout réemploi
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);

        log.info("Mot de passe mis à jour avec succès pour l'utilisateur : {} ({})", user.getLogin(), user.getEmail());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", 200);
        response.put("message", "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.");

        return response;
    }
}
