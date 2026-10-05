package com.example.crm.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entité JPA représentant une tâche CRM assignée à un utilisateur.
 *
 * <p>Une tâche peut être liée optionnellement à un {@link Contact}
 * et/ou à une {@link Interaction} existante.</p>
 */
@Entity
@Table(name = "tache")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tache {

    // =========================================================================
    // IDENTIFIANT
    // =========================================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================================
    // CHAMPS MÉTIER
    // =========================================================================

    /**
     * Titre court et descriptif de la tâche.
     */
    @NotBlank(message = "Le titre de la tâche est obligatoire")
    @Column(nullable = false, length = 255)
    private String titre;

    /**
     * Description détaillée de la tâche.
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Date d'échéance de la tâche.
     */
    @Column(name = "date_echeance")
    private LocalDateTime date;

    /**
     * Statut de la tâche (ex : EN_ATTENTE, EN_COURS, TERMINEE, ANNULEE).
     */
    @Column(length = 50)
    @Builder.Default
    private String statut = "EN_ATTENTE";

    /**
     * Type de la tâche (APPEL, EMAIL, REUNION, RENDEZ_VOUS, SUIVI, RELANCE, AUTRE).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "type_tache", length = 50)
    private TypeTache typeTache;

    // =========================================================================
    // RELATIONS
    // =========================================================================

    /**
     * Utilisateur à qui la tâche est assignée (obligatoire).
     */
    @NotNull(message = "L'utilisateur assigné est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private User utilisateur;

    /**
     * Contact associé à cette tâche (optionnel).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id")
    private Contact contact;

    /**
     * Interaction associée à cette tâche (optionnel).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interaction_id")
    private Interaction interaction;

    // =========================================================================
    // AUDIT
    // =========================================================================

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
