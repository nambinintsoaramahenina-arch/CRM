package com.example.crm.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entité JPA représentant une interaction CRM (appel, email, réunion, etc.)
 * entre un utilisateur et un contact.
 */
@Entity
@Table(name = "interactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Type d'interaction (APPEL, EMAIL, REUNION, RENDEZ_VOUS, MESSAGE, AUTRE).
     */
    @NotNull(message = "Le type d'interaction est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeInteraction type;

    /**
     * Date et heure de l'interaction.
     */
    @NotNull(message = "La date de l'interaction est obligatoire")
    @Column(nullable = false)
    private LocalDateTime date;

    /**
     * Objet / sujet de l'interaction.
     */
    @Column(length = 255)
    private String objet;

    /**
     * Description détaillée de l'interaction.
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Résultat ou conclusion de l'interaction.
     */
    @Column(columnDefinition = "TEXT")
    private String resultat;

    /**
     * Prochaine action à effectuer suite à cette interaction.
     */
    @Column(name = "prochaine_action", length = 500)
    private String prochaineAction;

    /**
     * Contact concerné par cette interaction (relation ManyToOne).
     */
    @NotNull(message = "Le contact est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id", nullable = false)
    private Contact contact;

    /**
     * Utilisateur responsable de l'interaction (relation ManyToOne).
     */
    @NotNull(message = "L'utilisateur responsable est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private User utilisateur;

    /**
     * Date de création automatique de l'enregistrement.
     */
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    /**
     * Date de dernière modification automatique.
     */
    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
        this.dateModification = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}
