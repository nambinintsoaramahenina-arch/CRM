package com.example.crm.service;

import com.example.crm.dto.ForgotPasswordRequest;
import com.example.crm.dto.ResetPasswordRequest;
import com.example.crm.entity.PasswordResetRequest;
import com.example.crm.entity.User;
import com.example.crm.repository.PasswordResetRequestRepository;
import com.example.crm.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Service gérant le cycle de vie de réinitialisation autonome du mot de passe :
 * 1. Génération de token sécurisé & expédition d'e-mail avec lien cliquable vers le frontend.
 * 2. Validation du token et mise à jour chiffrée (BCrypt) du mot de passe.
 */
@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final int TOKEN_EXPIRATION_MINUTES = 30;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordResetRequestRepository requestRepository;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Autowired
    public PasswordResetService(UserRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                EmailService emailService,
                                @Autowired(required = false) PasswordResetRequestRepository requestRepository) {
        this.userRepository    = userRepository;
        this.passwordEncoder   = passwordEncoder;
        this.emailService      = emailService;
        this.requestRepository = requestRepository;
    }

    /** Constructeur pour tests unitaires */
    public PasswordResetService(UserRepository userRepository,
                                PasswordEncoder passwordEncoder) {
        this(userRepository, passwordEncoder, null, null);
    }

    /**
     * Étape 1 : Demande de réinitialisation de mot de passe par l'utilisateur.
     * Accepte un e-mail ou un matricule/login, génère un token aléatoire unique (UUID),
     * définit sa date d'expiration (30 minutes) et déclenche l'envoi asynchrone de l'e-mail HTML.
     *
     * @param request DTO contenant l'e-mail ou l'identifiant
     * @return Confirmation JSON immédiate
     */
    @Transactional
    public Map<String, Object> processForgotPassword(ForgotPasswordRequest request) {
        String identifiant = request.getEmail();
        if (identifiant == null || identifiant.trim().isEmpty()) {
            throw new IllegalArgumentException("L'adresse e-mail ou le matricule est obligatoire.");
        }

        String searchKey = identifiant.trim();
        Optional<User> userOpt = userRepository.findByEmail(searchKey);
        if (userOpt.isEmpty()) {
            try {
                Optional<User> byLogin = userRepository.findByLogin(searchKey);
                if (byLogin != null && byLogin.isPresent()) {
                    userOpt = byLogin;
                }
            } catch (Exception ignored) {
                // Ignore si findByLogin n'est pas implémenté ou mocké
            }
        }
        User user = userOpt.orElseThrow(() -> new IllegalArgumentException("Aucun compte n'est associé à cette adresse e-mail : " + searchKey));

        if ("INACTIF".equalsIgnoreCase(user.getStatut())) {
            throw new IllegalArgumentException("Ce compte est désactivé. Veuillez contacter l'administrateur.");
        }

        // 1. Génération du token unique et expiration
        String resetToken = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(TOKEN_EXPIRATION_MINUTES);

        user.setResetToken(resetToken);
        user.setResetTokenExpiry(expiryDate);
        userRepository.save(user);

        // 2. Traçabilité optionnelle dans la table des demandes pour consultation admin
        if (requestRepository != null) {
            try {
                boolean dejaEnAttente = requestRepository.existsByUserAndStatut(user, PasswordResetRequest.Statut.PENDING);
                if (!dejaEnAttente) {
                    PasswordResetRequest demande = new PasswordResetRequest(user);
                    demande.setCommentaireAdmin("Lien envoyé par e-mail");
                    requestRepository.save(demande);
                }
            } catch (Exception e) {
                log.warn("[PASSWORD RESET] Impossible d'enregistrer la demande en historique : {}", e.getMessage());
            }
        }

        // 3. Construction du lien de redirection vers Next.js
        String baseUrl = (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl.replaceAll("/+$", "") : "http://localhost:3000";
        String resetLink = baseUrl + "/reset-password?token=" + resetToken;

        // 4. Envoi asynchrone de l'e-mail réel
        if (emailService != null) {
            emailService.envoyerLienReinitialisation(user.getEmail(), user.getNomComplet(), resetLink, TOKEN_EXPIRATION_MINUTES);
            log.info("[PASSWORD RESET] Lien de réinitialisation généré et expédié à : {}", user.getEmail());
        } else {
            log.warn("[PASSWORD RESET] EmailService non injecté. Token généré : {}", resetToken);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", 200);
        response.put("message", "Un e-mail contenant les instructions de réinitialisation a été envoyé à " + user.getEmail() + ".");
        response.put("email", user.getEmail());
        response.put("resetToken", resetToken);
        response.put("expiresAt", expiryDate.toString());
        response.put("expiresInMinutes", TOKEN_EXPIRATION_MINUTES);

        return response;
    }

    /**
     * Étape 2 : Réinitialisation effective du mot de passe avec le token.
     * Valide le token, sa durée de validité, chiffre le nouveau mot de passe (BCrypt)
     * et invalide le token pour empêcher toute réutilisation.
     *
     * @param request DTO contenant le token et le nouveau mot de passe
     * @return Confirmation de succès
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

        // Vérification de la correspondance e-mail si fourni
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (!user.getEmail().equalsIgnoreCase(request.getEmail().trim())) {
                throw new IllegalArgumentException("L'adresse e-mail ne correspond pas à ce token de réinitialisation.");
            }
        }

        // Vérification de la date d'expiration
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Le token de réinitialisation a expiré. Veuillez refaire une demande.");
        }

        // Chiffrement BCrypt du nouveau mot de passe
        user.setMdp(passwordEncoder.encode(nouveauMdp.trim()));

        // Invalidation définitive du token
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        // Clôture des éventuelles demandes PENDING en base
        if (requestRepository != null) {
            try {
                requestRepository.findByUserAndStatut(user, PasswordResetRequest.Statut.PENDING)
                        .ifPresent(demande -> {
                            demande.setStatut(PasswordResetRequest.Statut.APPROVED);
                            demande.setDateTraitement(LocalDateTime.now());
                            demande.setCommentaireAdmin("Réinitialisé avec succès par l'utilisateur via lien e-mail");
                            requestRepository.save(demande);
                        });
            } catch (Exception e) {
                log.warn("[PASSWORD RESET] Mise à jour du statut de demande ignorée : {}", e.getMessage());
            }
        }

        log.info("[PASSWORD RESET SUCCESS] Mot de passe réinitialisé avec succès pour : {} ({})", user.getLogin(), user.getEmail());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", 200);
        response.put("message", "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.");

        return response;
    }
}