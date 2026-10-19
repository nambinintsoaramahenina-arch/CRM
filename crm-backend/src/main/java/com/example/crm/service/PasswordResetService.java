package com.example.crm.service;

import com.example.crm.dto.ForgotPasswordRequest;
import com.example.crm.dto.ResetPasswordRequest;
import com.example.crm.entity.Notification;
import com.example.crm.entity.PasswordResetRequest;
import com.example.crm.entity.User;
import com.example.crm.repository.NotificationRepository;
import com.example.crm.repository.PasswordResetRequestRepository;
import com.example.crm.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service gérant le cycle de vie de réinitialisation de mot de passe :
 * 1. Demande par matricule : envoi d'un code par email à l'utilisateur et enregistrement
 *    d'une notification en base de données pour l'administrateur contenant le NOM COMPLET et le MATRICULE.
 * 2. Validation du code : vérification du code (avec suppression des espaces et mise en majuscules),
 *    recherche insensible à la casse via findByResetTokenIgnoreCase, génération automatique d'un nouveau mot de passe,
 *    enregistrement chiffré en base (BCrypt), et envoi par email au collaborateur.
 */
@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int    CODE_LENGTH = 6;
    private static final String PWD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!";
    private static final int    PWD_LENGTH = 10;
    private static final int    TOKEN_EXPIRATION_HOURS = 24;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordResetRequestRepository requestRepository;
    private final NotificationRepository notificationRepository;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Autowired
    public PasswordResetService(UserRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                EmailService emailService,
                                @Autowired(required = false) PasswordResetRequestRepository requestRepository,
                                @Autowired(required = false) NotificationRepository notificationRepository) {
        this.userRepository         = userRepository;
        this.passwordEncoder        = passwordEncoder;
        this.emailService           = emailService;
        this.requestRepository      = requestRepository;
        this.notificationRepository = notificationRepository;
    }

    /** Constructeur pour tests unitaires */
    public PasswordResetService(UserRepository userRepository,
                                PasswordEncoder passwordEncoder) {
        this(userRepository, passwordEncoder, null, null, null);
    }

    /**
     * Étape 1 : Demande de réinitialisation de mot de passe par l'utilisateur.
     * - L'utilisateur entre son MATRICULE.
     * - Un e-mail lui est envoyé avec un code/token.
     * - Une notification est enregistrée en base de données pour l'administrateur
     *   contenant son NOM COMPLET et son MATRICULE.
     *
     * @param request DTO contenant le matricule de l'utilisateur
     * @return Confirmation JSON immédiate
     */
    @Transactional
    public Map<String, Object> processForgotPassword(ForgotPasswordRequest request) {
        String matricule = request.getEmail();
        if (matricule == null || matricule.trim().isEmpty()) {
            throw new IllegalArgumentException("Le matricule est obligatoire.");
        }

        String searchKey = matricule.trim();
        // Recherche prioritaire par matricule (login), puis par email en secours
        User user = userRepository.findFirstByLogin(searchKey)
                .or(() -> userRepository.findFirstByEmail(searchKey))
                .orElseThrow(() -> new IllegalArgumentException("Aucun compte n'est associé au matricule : " + searchKey));

        if ("INACTIF".equalsIgnoreCase(user.getStatut())) {
            throw new IllegalArgumentException("Ce compte est désactivé. Veuillez contacter l'administrateur.");
        }

        // Vérification si une demande PENDING est déjà en cours
        if (requestRepository != null && requestRepository.existsByUserAndStatut(user, PasswordResetRequest.Statut.PENDING)) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", 200);
            response.put("message", "Une demande de réinitialisation est déjà en attente de validation par l'administrateur. Veuillez patienter.");
            response.put("alreadyPending", true);
            response.put("matricule", user.getLogin());
            response.put("userId", user.getId());
            return response;
        }

        // 1. Enregistrement de la demande en BDD avec un token de demande sécurisé et date d'expiration
        String resetCode = genererCode();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS);

        user.setResetToken(resetCode);
        user.setResetTokenExpiry(expiryDate);
        userRepository.save(user);

        // 2. Persistance de la demande d'historique au statut PENDING
        if (requestRepository != null) {
            try {
                PasswordResetRequest demande = new PasswordResetRequest(user);
                requestRepository.save(demande);
            } catch (Exception e) {
                log.warn("[PASSWORD RESET] Impossible d'enregistrer la demande en historique : {}", e.getMessage());
            }
        }

        // 3. Alerte visuelle pour le tableau de bord administrateur (Notification avec NOM COMPLET et MATRICULE)
        String messageNotification = "Demande de réinitialisation de " + user.getNomComplet() + " (Matricule : " + user.getLogin() + ")";
        if (notificationRepository != null) {
            try {
                Notification notif = new Notification(messageNotification, user);
                notif.setType("PASSWORD_RESET");
                notif.setStatut("EN_ATTENTE");
                notif.setLue(false);
                notificationRepository.save(notif);
                log.info("[NOTIFICATION] Notification admin enregistrée en base : {}", messageNotification);
            } catch (Exception e) {
                log.warn("[NOTIFICATION] Impossible d'enregistrer la notification : {}", e.getMessage());
            }
        }

        // 4. IMPORTANT : Aucun mot de passe n'est envoyé à l'utilisateur à cette étape !
        // Notification par e-mail réservée à l'administrateur pour l'alerter de la nouvelle demande
        if (emailService != null) {
            try {
                emailService.notifierAdminNouvelleDemande(user.getLogin(), user.getEmail(), user.getNomComplet());
                log.info("[PASSWORD RESET] Alerte e-mail transmise à l'administrateur pour le matricule {}", user.getLogin());
            } catch (Exception e) {
                log.warn("[PASSWORD RESET] Erreur lors de l'alerte e-mail admin : {}", e.getMessage());
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", 200);
        response.put("message", "Votre demande a bien été transmise à l'administrateur. Votre nouveau mot de passe vous sera envoyé par e-mail dès validation.");
        response.put("alreadyPending", false);
        response.put("matricule", user.getLogin());
        response.put("userId", user.getId());

        return response;
    }

    /**
     * Étape 2 : Validation du code de réinitialisation.
     * - Nettoyage préalable du token : trim, suppression de tous les espaces et passage en majuscules.
     * - Recherche insensible à la casse avec findByResetTokenIgnoreCase.
     * - Génération automatique d'un nouveau mot de passe, chiffrement BCrypt et enregistrement en base.
     * - Envoi du mot de passe temporaire en clair à l'utilisateur par e-mail.
     *
     * @param request DTO contenant le code (token)
     * @return Confirmation de succès
     */
    @Transactional
    public Map<String, Object> processResetPassword(ResetPasswordRequest request) {
        String token = request.getToken();

        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Le code de réinitialisation est obligatoire.");
        }

        // Nettoyage rigoureux : suppression de tous les espaces et passage en majuscules
        String cleanToken = token.trim().replaceAll("\\s+", "").toUpperCase();

        // Recherche de l'utilisateur porteur du code via findByResetTokenIgnoreCase
        User user = userRepository.findByResetTokenIgnoreCase(cleanToken)
                .orElseThrow(() -> new IllegalArgumentException("Code de réinitialisation invalide ou introuvable."));

        // Vérification de la date d'expiration
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Le code de réinitialisation a expiré. Veuillez refaire une demande avec votre matricule.");
        }

        // 1. Génération du mot de passe temporaire en clair (rawPassword)
        String rawPassword = request.getNouveauMdp();
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            rawPassword = genererMotDePasse();
        } else if (rawPassword.trim().length() < 6) {
            throw new IllegalArgumentException("Le mot de passe doit comporter au moins 6 caractères.");
        }
        rawPassword = rawPassword.trim();

        // 2. Chiffrement obligatoire via PasswordEncoder avant enregistrement en base PostgreSQL
        String encodedPassword = passwordEncoder.encode(rawPassword);
        user.setMdp(encodedPassword);

        // 3. Invalidation définitive du token
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        // 4. Clôture de toutes les demandes PENDING existantes pour cet utilisateur
        if (requestRepository != null) {
            try {
                List<PasswordResetRequest> demandes = requestRepository.findAllByUserAndStatut(user, PasswordResetRequest.Statut.PENDING);
                for (PasswordResetRequest demande : demandes) {
                    demande.setStatut(PasswordResetRequest.Statut.APPROVED);
                    demande.setDateTraitement(LocalDateTime.now());
                    demande.setCommentaireAdmin("Réinitialisé avec succès via validation du code");
                    requestRepository.save(demande);
                }
            } catch (Exception e) {
                log.warn("[PASSWORD RESET] Mise à jour du statut de demande ignorée : {}", e.getMessage());
            }
        }

        // 5. Envoi de la version en clair (rawPassword) dans l'e-mail du collaborateur et notification admin
        if (emailService != null) {
            emailService.envoyerMotDePasseTemporaire(user.getEmail(), user.getNomComplet(), rawPassword);
            emailService.notifierAdminNouveauMotDePasse(user.getLogin(), user.getEmail(), user.getNomComplet(), rawPassword);
            log.info("[PASSWORD RESET] Nouveau mot de passe (rawPassword) envoyé par e-mail à {} et notifié à l'admin pour {}",
                    user.getEmail(), user.getLogin());
        }

        log.info("[PASSWORD RESET SUCCESS] Mot de passe chiffré et enregistré pour : {} ({})", user.getLogin(), user.getEmail());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", 200);
        response.put("message", "Votre code a été validé avec succès ! Un nouveau mot de passe a été généré automatiquement et vous a été envoyé par e-mail.");
        response.put("userEmail", user.getEmail());
        response.put("login", user.getLogin());

        return response;
    }

    /**
     * Étape 2 — Validation par l'administrateur :
     * Résout l'utilisateur par son ID ou son matricule.
     * 1. Génère le mot de passe temporaire (ou utilise customPassword si fourni).
     * 2. Le chiffre avec BCrypt et l'enregistre en base de données pour l'utilisateur.
     * 3. Envoie le nouveau mot de passe par e-mail à l'utilisateur ciblé.
     * 4. Clôture les demandes PENDING (statut APPROVED).
     * 5. Met à jour le statut des notifications associées à "TRAITÉ" (et lue = true).
     *
     * @param identifier ID utilisateur (ex: "5") ou matricule (ex: "EMP001")
     * @param customPassword Mot de passe personnalisé optionnel
     * @param commentaire Commentaire optionnel de l'administrateur
     * @return Résultat JSON détaillé
     */
    @Transactional
    public Map<String, Object> approveResetByAdmin(String identifier, String customPassword, String commentaire) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new IllegalArgumentException("L'identifiant ou matricule de l'utilisateur est obligatoire.");
        }

        String searchKey = identifier.trim();
        User user;
        if (searchKey.matches("^\\d+$")) {
            Long userId = Long.parseLong(searchKey);
            user = userRepository.findById(userId)
                    .or(() -> userRepository.findFirstByLogin(searchKey))
                    .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable avec l'identifiant : " + searchKey));
        } else {
            user = userRepository.findFirstByLogin(searchKey)
                    .or(() -> userRepository.findFirstByEmail(searchKey))
                    .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable avec le matricule : " + searchKey));
        }

        // 1. Génération du mot de passe temporaire en clair
        String rawPassword = (customPassword != null && !customPassword.trim().isEmpty())
                ? customPassword.trim()
                : genererMotDePasse();

        if (rawPassword.length() < 6) {
            throw new IllegalArgumentException("Le mot de passe doit comporter au moins 6 caractères.");
        }

        // 2. Chiffrement obligatoire avec BCrypt et enregistrement en base de données
        String encodedPassword = passwordEncoder.encode(rawPassword);
        user.setMdp(encodedPassword);
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        // 3. Envoi du nouveau mot de passe temporaire par e-mail à l'utilisateur ciblé
        if (emailService != null) {
            try {
                emailService.envoyerMotDePasseTemporaire(user.getEmail(), user.getNomComplet(), rawPassword);
                emailService.notifierAdminNouveauMotDePasse(user.getLogin(), user.getEmail(), user.getNomComplet(), rawPassword);
                log.info("[PASSWORD RESET] Nouveau mot de passe envoyé à {} pour le matricule {}",
                        user.getEmail(), user.getLogin());
            } catch (Exception e) {
                log.warn("[PASSWORD RESET] Erreur lors de l'envoi de l'e-mail : {}", e.getMessage());
            }
        }

        // 4. Clôture des demandes PasswordResetRequest en attente (statut APPROVED)
        if (requestRepository != null) {
            try {
                List<PasswordResetRequest> demandes = requestRepository.findAllByUserAndStatut(user, PasswordResetRequest.Statut.PENDING);
                for (PasswordResetRequest d : demandes) {
                    d.setStatut(PasswordResetRequest.Statut.APPROVED);
                    d.setDateTraitement(LocalDateTime.now());
                    d.setCommentaireAdmin(commentaire != null && !commentaire.trim().isEmpty()
                            ? commentaire.trim()
                            : "Validé par l'administrateur");
                    requestRepository.save(d);
                }
            } catch (Exception e) {
                log.warn("[PASSWORD RESET] Impossible de mettre à jour les demandes : {}", e.getMessage());
            }
        }

        // 5. Mise à jour du statut des notifications associées à "TRAITÉ" et lue = true
        if (notificationRepository != null) {
            try {
                List<Notification> notifs = notificationRepository.findAll();
                for (Notification n : notifs) {
                    if (n.getUser() != null && n.getUser().getId().equals(user.getId())
                            && ("PASSWORD_RESET".equalsIgnoreCase(n.getType()) || n.getMessage().contains(user.getLogin()))) {
                        n.setStatut("TRAITÉ");
                        n.setLue(true);
                        notificationRepository.save(n);
                    }
                }
            } catch (Exception e) {
                log.warn("[PASSWORD RESET] Impossible de mettre à jour les notifications : {}", e.getMessage());
            }
        }

        log.info("[PASSWORD RESET] Validation admin effectuée pour {} (Matricule : {}).",
                user.getNomComplet(), user.getLogin());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("status", 200);
        resp.put("message", "Le mot de passe de l'utilisateur " + user.getNomComplet() + " (Matricule : " + user.getLogin() + ") a été généré, enregistré et envoyé par e-mail.");
        resp.put("userId", user.getId());
        resp.put("matricule", user.getLogin());
        resp.put("userEmail", user.getEmail());
        resp.put("nomComplet", user.getNomComplet());
        resp.put("temporaryPassword", rawPassword);
        return resp;
    }

    /**
     * Valide la réinitialisation à partir de l'ID d'une notification du tableau de bord.
     */
    @Transactional
    public Map<String, Object> approveResetByNotificationId(Long notificationId, String customPassword, String commentaire) {
        if (notificationRepository == null) {
            throw new IllegalStateException("NotificationRepository non disponible.");
        }
        Notification notif = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification introuvable avec l'ID : " + notificationId));

        User user = notif.getUser();
        if (user == null) {
            throw new IllegalArgumentException("Aucun utilisateur associé à cette notification.");
        }

        Map<String, Object> resp = approveResetByAdmin(String.valueOf(user.getId()), customPassword, commentaire);
        notif.setStatut("TRAITÉ");
        notif.setLue(true);
        notificationRepository.save(notif);
        return resp;
    }

    /** Génère un code de réinitialisation sécurisé (6 caractères alphanumériques majuscules). */
    private String genererCode() {
        SecureRandom rng = new SecureRandom();
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(CODE_CHARS.charAt(rng.nextInt(CODE_CHARS.length())));
        }
        return sb.toString();
    }

    /** Génère un nouveau mot de passe aléatoire sécurisé (10 caractères). */
    private String genererMotDePasse() {
        SecureRandom rng = new SecureRandom();
        StringBuilder sb = new StringBuilder(PWD_LENGTH);
        for (int i = 0; i < PWD_LENGTH; i++) {
            sb.append(PWD_CHARS.charAt(rng.nextInt(PWD_CHARS.length())));
        }
        return sb.toString();
    }
}