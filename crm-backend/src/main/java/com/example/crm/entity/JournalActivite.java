package com.example.crm.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Entité JPA représentant une entrée du journal d'activité / historique système.
 * Mappée directement sur la table PostgreSQL existante : {@code journal_activite}.
 * Code 100% Java standard (sans dépendance Lombok).
 */
@Entity
@Table(name = "journal_activite")
public class JournalActivite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * Utilisateur ayant effectué l'action (clé étrangère utilisateur_id vers la table utilisateurs).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "mdp", "resetToken", "resetTokenExpiry"})
    private User utilisateur;

    /**
     * Action effectuée (ex : CONNEXION, CREATION, MODIFICATION, SUPPRESSION).
     */
    @Column(name = "action", length = 50, nullable = false)
    private String action;

    /**
     * Entité concernée (ex : Utilisateur, Contact, Tache, Interaction, etc.).
     */
    @Column(name = "entite_concernee", length = 100)
    private String entiteConcernee;

    /**
     * Identifiant de l'entité ciblée.
     */
    @Column(name = "identifiant_entite")
    private Long identifiantEntite;

    /**
     * Horodatage de l'activité.
     */
    @Column(name = "date")
    private LocalDateTime date;

    /**
     * Adresse IP du client ayant émis la requête.
     */
    @Column(name = "adresse_ip", length = 45)
    private String adresseIp;

    /**
     * Détails complémentaires sur l'action (texte libre ou JSON sous forme textuelle).
     */
    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @PrePersist
    public void prePersist() {
        if (this.date == null) {
            this.date = LocalDateTime.now();
        }
    }

    // =========================================================================
    // CONSTRUCTEURS
    // =========================================================================

    public JournalActivite() {
    }

    public JournalActivite(Long id, User utilisateur, String action, String entiteConcernee,
                           Long identifiantEntite, LocalDateTime date, String adresseIp, String details) {
        this.id = id;
        this.utilisateur = utilisateur;
        this.action = action;
        this.entiteConcernee = entiteConcernee;
        this.identifiantEntite = identifiantEntite;
        this.date = date;
        this.adresseIp = adresseIp;
        this.details = details;
    }

    public JournalActivite(User utilisateur, String action, String entiteConcernee,
                           Long identifiantEntite, LocalDateTime date, String adresseIp, String details) {
        this.utilisateur = utilisateur;
        this.action = action;
        this.entiteConcernee = entiteConcernee;
        this.identifiantEntite = identifiantEntite;
        this.date = date;
        this.adresseIp = adresseIp;
        this.details = details;
    }

    // =========================================================================
    // GETTERS & SETTERS
    // =========================================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(User utilisateur) {
        this.utilisateur = utilisateur;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntiteConcernee() {
        return entiteConcernee;
    }

    public void setEntiteConcernee(String entiteConcernee) {
        this.entiteConcernee = entiteConcernee;
    }

    public Long getIdentifiantEntite() {
        return identifiantEntite;
    }

    public void setIdentifiantEntite(Long identifiantEntite) {
        this.identifiantEntite = identifiantEntite;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getAdresseIp() {
        return adresseIp;
    }

    public void setAdresseIp(String adresseIp) {
        this.adresseIp = adresseIp;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    // =========================================================================
    // BUILDER (Pattern Builder en pur Java, sans Lombok)
    // =========================================================================

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private User utilisateur;
        private String action;
        private String entiteConcernee;
        private Long identifiantEntite;
        private LocalDateTime date;
        private String adresseIp;
        private String details;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder utilisateur(User utilisateur) {
            this.utilisateur = utilisateur;
            return this;
        }

        public Builder action(String action) {
            this.action = action;
            return this;
        }

        public Builder entiteConcernee(String entiteConcernee) {
            this.entiteConcernee = entiteConcernee;
            return this;
        }

        public Builder identifiantEntite(Long identifiantEntite) {
            this.identifiantEntite = identifiantEntite;
            return this;
        }

        public Builder date(LocalDateTime date) {
            this.date = date;
            return this;
        }

        public Builder adresseIp(String adresseIp) {
            this.adresseIp = adresseIp;
            return this;
        }

        public Builder details(String details) {
            this.details = details;
            return this;
        }

        public JournalActivite build() {
            return new JournalActivite(id, utilisateur, action, entiteConcernee, identifiantEntite, date, adresseIp, details);
        }
    }

    // =========================================================================
    // EQUALS, HASHCODE, TOSTRING
    // =========================================================================

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof JournalActivite that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "JournalActivite{" +
                "id=" + id +
                ", action='" + action + '\'' +
                ", entiteConcernee='" + entiteConcernee + '\'' +
                ", identifiantEntite=" + identifiantEntite +
                ", date=" + date +
                ", adresseIp='" + adresseIp + '\'' +
                ", details='" + details + '\'' +
                '}';
    }
}
