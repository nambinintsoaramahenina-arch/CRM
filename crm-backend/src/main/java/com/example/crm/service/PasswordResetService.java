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
 * Service gérant le cycle de vie de réinitialisation de mot de passe :
 * 1. Enregistrement de la demande en PENDING et notification de l'administrateur.
 * 2. Validation du token et mise à jour chiffrée (BCrypt) du mot de passe
 *    (déclenché uniquement après approbation admin).
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
     * Enregistre la demande en base (statut PENDING) et notifie l'administrateur.
     * Aucun mot de passe ni lien n'est envoyé à l'utilisateur à cette étape.
     * C'est l'administrateur qui approuvera et déclenchera l'envoi.
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

        // 1. Vérifier s'il y a déjà une demande PENDING en cours
        if (requestRepository != null) {
            try {
                boolean dejaEnAttente = requestRepository.existsByUserAndStatut(user, PasswordResetRequest.Statut.PENDING);
                if (dejaEnAttente) {
                    Map<String, Object> resp = new LinkedHashMap<>();
                    resp.put("status", 200);
                    resp.put("message",
                            "Une demande est déjà en attente de validation par l'administrateur. " +
                            "Veuillez patienter (délai : 24 à 48h).");
                    resp.put("alreadyPending", true);
                    return resp;
                }
            } catch (Exception e) {
                log.warn("[PASSWORD RESET] Vérification demande existante ignorée : {}", e.getMessage());
            }
        }

        // 2. Création et persistance de la demande PENDING (sans générer de token/mot de passe)
        if (requestRepository != null) {
            try {
                PasswordResetRequest demande = new PasswordResetRequest(user);
                requestRepository.save(demande);
                log.info("[PASSWORD RESET] Nouvelle demande PENDING enregistrée pour : {} ({})",
                        user.getLogin(), user.getEmail());
            } catch (Exception e) {
                log.warn("[PASSWORD RESET] Impossible d'enregistrer la demande en historique : {}", e.getMessage());
            }
        }

        // 3. Notification de l'administrateur uniquement (aucun e-mail à l'utilisateur)
        if (emailService != null) {
            emailService.notifierAdminNouvelleDemande(user.getLogin(), user.getEmail(), user.getNomComplet());
            log.info("[PASSWORD RESET] Notification envoyée à l'administrateur pour : {}", user.getEmail());
        } else {
            log.warn("[PASSWORD RESET] EmailService non injecté. Demande enregistrée pour : {}", user.getEmail());
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", 200);
        response.put("message",
                "Votre demande a bien été enregistrée. L'administrateur validera votre " +
                "identité et vous enverra un nouveau mot de passe par e-mail.");
        response.put("alreadyPending", false);

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