package com.example.crm.service;

import com.example.crm.entity.JournalActivite;
import com.example.crm.entity.User;
import com.example.crm.repository.JournalActiviteRepository;
import com.example.crm.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service métier gérant la consultation et l'enregistrement automatisé du journal d'activité.
 * Connecté strictement à la base de données PostgreSQL via {@link JournalActiviteRepository}.
 */
@Service
public class JournalActiviteService {

    private static final Logger log = LoggerFactory.getLogger(JournalActiviteService.class);

    private final JournalActiviteRepository journalActiviteRepository;
    private final UserRepository userRepository;

    public JournalActiviteService(JournalActiviteRepository journalActiviteRepository,
                                  UserRepository userRepository) {
        this.journalActiviteRepository = journalActiviteRepository;
        this.userRepository = userRepository;
    }

    /**
     * Récupère la totalité de l'historique d'activité enregistré en base de données PostgreSQL,
     * classé par date décroissante (les événements les plus récents en premier).
     */
    @Transactional(readOnly = true)
    public List<JournalActivite> obtenirTousLesJournaux() {
        return journalActiviteRepository.findAllByOrderByDateDesc();
    }

    /**
     * Récupère l'historique d'activité filtré pour un utilisateur donné.
     */
    @Transactional(readOnly = true)
    public List<JournalActivite> obtenirParUtilisateur(Long utilisateurId) {
        return journalActiviteRepository.findByUtilisateurIdOrderByDateDesc(utilisateurId);
    }

    /**
     * Méthode automatisée principale : enregistre une action dans PostgreSQL.
     * Récupère automatiquement l'utilisateur connecté depuis le SecurityContext et
     * l'adresse IP du client depuis la requête HTTP courante.
     *
     * @param action            Type d'action (CREATE, UPDATE, DELETE, REJECT, APPROVE, CONNEXION)
     * @param entiteConcernee   Nom de l'entité (ex: Utilisateur, Contact, Tache, DemandeMdp)
     * @param identifiantEntite ID de l'entité concernée
     * @param details           Description claire et professionnelle
     * @return L'entrée enregistrée en base
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public JournalActivite logAction(String action, String entiteConcernee, Long identifiantEntite, String details) {
        return logAction(null, action, entiteConcernee, identifiantEntite, null, details);
    }

    /**
     * Surcharge avec utilisateur explicite et IP automatique.
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public JournalActivite logAction(User utilisateur, String action, String entiteConcernee, Long identifiantEntite, String details) {
        return logAction(utilisateur, action, entiteConcernee, identifiantEntite, null, details);
    }

    /**
     * Enregistre l'activité complète dans la table PostgreSQL journal_activite.
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public JournalActivite logAction(User utilisateur,
                                     String action,
                                     String entiteConcernee,
                                     Long identifiantEntite,
                                     String adresseIp,
                                     String details) {
        try {
            // 1. Détection automatique de l'utilisateur authentifié si non spécifié
            if (utilisateur == null) {
                utilisateur = getUtilisateurConnecte();
            }

            // 2. Détection automatique de l'adresse IP réelle de la requête HTTP
            if (adresseIp == null || adresseIp.trim().isEmpty()) {
                adresseIp = getClientIp();
            }

            JournalActivite journal = JournalActivite.builder()
                    .utilisateur(utilisateur)
                    .action(action != null ? action.toUpperCase().trim() : "ACTION")
                    .entiteConcernee(entiteConcernee)
                    .identifiantEntite(identifiantEntite)
                    .date(LocalDateTime.now())
                    .adresseIp(adresseIp)
                    .details(details)
                    .build();

            JournalActivite saved = journalActiviteRepository.save(journal);
            log.info("[JOURNAL ACTIVITE] {} sur {} (#{}) - IP: {} - Auteur: {} - {}",
                    saved.getAction(), saved.getEntiteConcernee(), saved.getIdentifiantEntite(),
                    saved.getAdresseIp(), (utilisateur != null ? utilisateur.getLogin() : "Système"), details);
            return saved;
        } catch (Exception e) {
            log.error("[JOURNAL ACTIVITE] Erreur lors de l'enregistrement dans journal_activite : {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Alias de rétrocompatibilité.
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public JournalActivite enregistrerActivite(User utilisateur,
                                              String action,
                                              String entiteConcernee,
                                              Long identifiantEntite,
                                              String adresseIp,
                                              String details) {
        return logAction(utilisateur, action, entiteConcernee, identifiantEntite, adresseIp, details);
    }

    /**
     * Récupère l'entité User de l'utilisateur actuellement authentifié via Spring SecurityContextHolder.
     */
    public User getUtilisateurConnecte() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String principalName = auth.getName();
                if (principalName != null && !principalName.isBlank()) {
                    return userRepository.findFirstByLogin(principalName)
                            .or(() -> userRepository.findFirstByEmail(principalName))
                            .orElse(null);
                }
            }
        } catch (Exception e) {
            log.debug("Impossible d'extraire l'utilisateur du SecurityContext : {}", e.getMessage());
        }
        return null;
    }

    /**
     * Retourne le nom de l'auteur de l'action pour formater des messages lisibles.
     * Exemple : "ADMIN", "John Doe" ou le login.
     */
    public String getNomAuteurAction() {
        User u = getUtilisateurConnecte();
        if (u != null) {
            if (u.getRole() != null && "ADMIN".equalsIgnoreCase(u.getRole().name())) {
                return "ADMIN";
            }
            if (u.getNomComplet() != null && !u.getNomComplet().isBlank()) {
                return u.getNomComplet();
            }
            if (u.getLogin() != null && !u.getLogin().isBlank()) {
                return u.getLogin();
            }
        }
        return "ADMIN";
    }

    /**
     * Récupère l'adresse IP du client à partir du RequestContextHolder et des en-têtes proxy.
     */
    public static String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                return extractClientIp(request);
            }
        } catch (Exception ignored) {
        }
        return "127.0.0.1";
    }

    /**
     * Analyse les en-têtes HTTP usuels (X-Forwarded-For, X-Real-IP, etc.) pour extraire l'adresse IP source.
     */
    public static String extractClientIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";

        String[] headerCandidates = {
                "X-Forwarded-For",
                "X-Real-IP",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP",
                "HTTP_CLIENT_IP",
                "HTTP_X_FORWARDED_FOR"
        };

        for (String header : headerCandidates) {
            String ipList = request.getHeader(header);
            if (ipList != null && !ipList.isBlank() && !"unknown".equalsIgnoreCase(ipList)) {
                String firstIp = ipList.split(",")[0].trim();
                if (!firstIp.isEmpty() && !"unknown".equalsIgnoreCase(firstIp)) {
                    if ("0:0:0:0:0:0:0:1".equals(firstIp) || "::1".equals(firstIp)) {
                        return "127.0.0.1";
                    }
                    return firstIp;
                }
            }
        }

        String remoteAddr = request.getRemoteAddr();
        if ("0:0:0:0:0:0:0:1".equals(remoteAddr) || "::1".equals(remoteAddr)) {
            return "127.0.0.1";
        }
        return remoteAddr != null ? remoteAddr : "127.0.0.1";
    }
}
