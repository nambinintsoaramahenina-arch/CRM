package com.example.crm.service;

import com.example.crm.dto.ForgotPasswordRequest;
import com.example.crm.dto.PasswordRequestDTO;
import com.example.crm.entity.PasswordResetRequest;
import com.example.crm.entity.User;
import com.example.crm.repository.PasswordResetRequestRepository;
import com.example.crm.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service gérant le workflow de réinitialisation de mot de passe par validation admin.
 *
 * Étape 1 — Utilisateur : soumet une demande → enregistrée en PENDING en base.
 * Étape 2 — Admin       : consulte les demandes PENDING via l'API admin.
 * Étape 3 — Admin       : valide la demande → génère un code/token sécurisé,
 *                         l'enregistre sur l'utilisateur en base,
 *                         et envoie un e-mail réel à l'utilisateur avec le code.
 * Étape 4 — Utilisateur : utilise le code + nouveau mot de passe pour réinitialiser.
 */
@Service
public class PasswordRequestAdminService {

    private static final Logger log = LoggerFactory.getLogger(PasswordRequestAdminService.class);

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!";
    private static final int    PWD_LENGTH = 10;
    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int    CODE_LENGTH = 6;
    private static final int    TOKEN_EXPIRATION_HOURS = 24;

    private final UserRepository userRepository;
    private final PasswordResetRequestRepository requestRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public PasswordRequestAdminService(UserRepository userRepository,
                                       PasswordResetRequestRepository requestRepository,
                                       PasswordEncoder passwordEncoder,
                                       EmailService emailService) {
        this.userRepository    = userRepository;
        this.requestRepository = requestRepository;
        this.passwordEncoder   = passwordEncoder;
        this.emailService      = emailService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ÉTAPE 1 — Soumission de la demande par l'utilisateur
    // POST /api/auth/forgot-password
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Enregistre une demande de réinitialisation de mot de passe en base (statut PENDING).
     * Aucun e-mail n'est envoyé à cette étape : c'est l'administrateur qui traite la demande.
     *
     * @param request DTO contenant l'e-mail ou le login de l'utilisateur
     * @return Map JSON de confirmation avec statut 200
     */
    @Transactional
    public Map<String, Object> soumettreDemande(ForgotPasswordRequest request) {
        String identifiant = request.getEmail();
        if (identifiant == null || identifiant.trim().isEmpty()) {
            throw new IllegalArgumentException("L'e-mail ou le matricule est obligatoire.");
        }

        // Recherche par email d'abord, puis par login (matricule)
        User user = userRepository.findByEmail(identifiant.trim())
                .or(() -> userRepository.findByLogin(identifiant.trim()))
                .orElseThrow(() -> new IllegalArgumentException(
                        "Aucun compte n'est associé à cet identifiant. " +
                        "Vérifiez votre e-mail ou contactez votre administrateur."));

        if ("INACTIF".equalsIgnoreCase(user.getStatut())) {
            throw new IllegalArgumentException(
                    "Ce compte est désactivé. Contactez votre administrateur.");
        }

        // Vérification d'une demande PENDING déjà en cours
        boolean dejaEnAttente = requestRepository.existsByUserAndStatut(
                user, PasswordResetRequest.Statut.PENDING);
        if (dejaEnAttente) {
            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("status", 200);
            resp.put("message",
                    "Une demande est déjà en attente de validation par l'administrateur. " +
                    "Veuillez patienter! L'administrateur vous enverra un code de réinitialisation par e-mail.");
            resp.put("alreadyPending", true);
            return resp;
        }

        // Création et persistance de la demande PENDING
        PasswordResetRequest demande = new PasswordResetRequest(user);
        requestRepository.save(demande);

        log.info("[PWD REQUEST] Nouvelle demande PENDING enregistrée pour : {} ({})",
                user.getLogin(), user.getEmail());

        // Notification de l'administrateur (email d'alerte sans bloquer si échec SMTP)
        emailService.notifierAdminNouvelleDemande(user.getLogin(), user.getEmail(), user.getNomComplet());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("status", 200);
        resp.put("message",
                "Votre demande a bien été enregistrée. L'administrateur validera votre " +
                "identité et vous enverra un nouveau mot de passe par e-mail.");
        resp.put("alreadyPending", false);
        return resp;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ÉTAPE 2 — Consultation des demandes par l'admin
    // GET /api/admin/password-requests
    // ─────────────────────────────────────────────────────────────────────────

    /** Retourne toutes les demandes, triées par date décroissante. */
    public List<PasswordRequestDTO> obtenirToutesDemandes() {
        return requestRepository.findAllByOrderByDateDemandeDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    /** Retourne uniquement les demandes en attente (PENDING). */
    public List<PasswordRequestDTO> obtenirDemandesPending() {
        return requestRepository.findByStatutOrderByDateDemandeDesc(PasswordResetRequest.Statut.PENDING)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    /** Nombre total de demandes PENDING (pour le badge dans le dashboard). */
    public long compterDemandesPending() {
        return requestRepository.countPending();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ÉTAPE 3 — Validation par l'admin + envoi du mot de passe par e-mail
    // POST /api/admin/password-requests/{id}/approve
    // POST /api/admin/users/{id}/reset-password
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Valide une demande PENDING :
     * 1. Génère un code/token sécurisé de réinitialisation (6 caractères)
     * 2. Enregistre le code sur l'utilisateur en base (sans modifier le mot de passe)
     * 3. Envoie un e-mail à l'utilisateur contenant le code
     * 4. Marque la demande comme APPROVED
     * 5. Renvoie le token au frontend admin dans la réponse JSON
     *
     * L'utilisateur utilisera ensuite ce code + son nouveau mot de passe
     * sur la page de réinitialisation (POST /api/auth/reset-password).
     *
     * @param demandeId        ID de la demande à approuver
     * @param customMdp        Ignoré dans le flux token/code (conservé pour compatibilité)
     * @param commentaireAdmin Commentaire optionnel de l'admin
     */
    @Transactional
    public Map<String, Object> approuverDemande(Long demandeId, String customMdp, String commentaireAdmin) {
        PasswordResetRequest demande = requestRepository.findById(demandeId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Demande introuvable avec l'ID : " + demandeId));

        if (demande.getStatut() != PasswordResetRequest.Statut.PENDING) {
            throw new IllegalArgumentException(
                    "Cette demande a déjà été traitée (statut : " + demande.getStatut() + ").");
        }

        User user = demande.getUser();

        // Génération d'un code sécurisé de réinitialisation (6 caractères alphanumériques)
        String resetCode = genererCodeReinitialisation();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS);

        // Enregistrement du code sur l'utilisateur (PAS de modification du mot de passe)
        user.setResetToken(resetCode);
        user.setResetTokenExpiry(expiryDate);
        userRepository.save(user);

        // Envoi de l'e-mail avec le code de réinitialisation via EmailService
        emailService.envoyerCodeReinitialisation(user.getEmail(), user.getNomComplet(), resetCode, TOKEN_EXPIRATION_HOURS);

        // Marquer la demande comme traitée
        demande.setStatut(PasswordResetRequest.Statut.APPROVED);
        demande.setDateTraitement(LocalDateTime.now());
        demande.setCommentaireAdmin(commentaireAdmin != null ? commentaireAdmin.trim() : "Approuvé par l'administrateur");
        requestRepository.save(demande);

        log.info("[PWD APPROVE] Demande {} approuvée — code envoyé à : {}", demandeId, user.getEmail());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("status", 200);
        resp.put("message",
                "Demande approuvée. Un code de réinitialisation a été envoyé à " + user.getEmail() + ".");
        resp.put("userId", user.getId());
        resp.put("userEmail", user.getEmail());
        resp.put("resetToken", resetCode);
        return resp;
    }

    /** Surcharge de compatibilité sans mot de passe personnalisé. */
    @Transactional
    public Map<String, Object> approuverDemande(Long demandeId, String commentaireAdmin) {
        return approuverDemande(demandeId, null, commentaireAdmin);
    }

    /**
     * Étape 3 — Génère un code de réinitialisation directement via l'ID utilisateur :
     * Endpoint : POST /api/admin/users/{id}/reset-password
     *
     * Génère un code sécurisé, l'enregistre sur l'utilisateur (sans changer le mot de passe)
     * et envoie un e-mail avec le code.
     *
     * @param userId           ID de l'utilisateur concerné
     * @param customMdp        Ignoré dans le flux token/code (conservé pour compatibilité)
     * @param commentaireAdmin Commentaire optionnel
     */
    @Transactional
    public Map<String, Object> reinitialiserMotDePasseParUserId(Long userId, String customMdp, String commentaireAdmin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable avec l'ID : " + userId));

        // Génération d'un code sécurisé de réinitialisation
        String resetCode = genererCodeReinitialisation();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS);

        // Enregistrement du code (PAS de modification du mot de passe)
        user.setResetToken(resetCode);
        user.setResetTokenExpiry(expiryDate);
        userRepository.save(user);

        // Clôture d'une éventuelle demande PENDING existante pour cet utilisateur
        requestRepository.findByUserAndStatut(user, PasswordResetRequest.Statut.PENDING)
                .ifPresent(demande -> {
                    demande.setStatut(PasswordResetRequest.Statut.APPROVED);
                    demande.setDateTraitement(LocalDateTime.now());
                    demande.setCommentaireAdmin(commentaireAdmin != null ? commentaireAdmin.trim() : "Réinitialisé directement par l'administrateur");
                    requestRepository.save(demande);
                });

        // Envoi de l'e-mail avec le code de réinitialisation
        emailService.envoyerCodeReinitialisation(user.getEmail(), user.getNomComplet(), resetCode, TOKEN_EXPIRATION_HOURS);

        log.info("[PWD RESET DIRECT] Code envoyé à : {} (userId={})", user.getEmail(), userId);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("status", 200);
        resp.put("message", "Code de réinitialisation généré et envoyé par e-mail à " + user.getEmail() + ".");
        resp.put("userId", user.getId());
        resp.put("userEmail", user.getEmail());
        resp.put("resetToken", resetCode);
        return resp;
    }

    /**
     * Rejette une demande PENDING sans envoyer de mot de passe.
     *
     * @param demandeId        ID de la demande à rejeter
     * @param commentaireAdmin Raison du rejet (obligatoire)
     */
    @Transactional
    public Map<String, Object> rejeterDemande(Long demandeId, String commentaireAdmin) {
        PasswordResetRequest demande = requestRepository.findById(demandeId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Demande introuvable avec l'ID : " + demandeId));

        if (demande.getStatut() != PasswordResetRequest.Statut.PENDING) {
            throw new IllegalArgumentException(
                    "Cette demande a déjà été traitée (statut : " + demande.getStatut() + ").");
        }

        demande.setStatut(PasswordResetRequest.Statut.REJECTED);
        demande.setDateTraitement(LocalDateTime.now());
        demande.setCommentaireAdmin(
                commentaireAdmin != null && !commentaireAdmin.isBlank()
                        ? commentaireAdmin.trim() : "Rejetée par l'administrateur");
        requestRepository.save(demande);

        log.info("[PWD REJECT] Demande {} rejetée pour : {}", demandeId, demande.getUser().getEmail());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("status", 200);
        resp.put("message", "Demande rejetée pour " + demande.getUser().getEmail() + ".");
        return resp;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Utilitaires privés
    // ─────────────────────────────────────────────────────────────────────────

    /** Génère un mot de passe temporaire aléatoire sécurisé (10 caractères). */
    private String genererMotDePasseTemporaire() {
        SecureRandom rng = new SecureRandom();
        StringBuilder sb = new StringBuilder(PWD_LENGTH);
        for (int i = 0; i < PWD_LENGTH; i++) {
            sb.append(CHARS.charAt(rng.nextInt(CHARS.length())));
        }
        return sb.toString();
    }

    /** Génère un code de réinitialisation sécurisé (6 caractères alphanumériques majuscules). */
    private String genererCodeReinitialisation() {
        SecureRandom rng = new SecureRandom();
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(CODE_CHARS.charAt(rng.nextInt(CODE_CHARS.length())));
        }
        return sb.toString();
    }

    /** Convertit une entité PasswordResetRequest en DTO. */
    private PasswordRequestDTO toDTO(PasswordResetRequest r) {
        PasswordRequestDTO dto = new PasswordRequestDTO();
        dto.setId(r.getId());
        dto.setStatut(r.getStatut().name());
        dto.setDateDemande(r.getDateDemande());
        dto.setDateTraitement(r.getDateTraitement());
        dto.setCommentaireAdmin(r.getCommentaireAdmin());

        if (r.getUser() != null) {
            User u = r.getUser();
            dto.setUserId(u.getId());
            dto.setNomComplet(u.getNomComplet());
            dto.setEmail(u.getEmail());
            dto.setLogin(u.getLogin());
            dto.setRole(u.getRole() != null ? u.getRole().name() : null);
        }
        return dto;
    }
}
