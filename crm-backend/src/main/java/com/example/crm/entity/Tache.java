package com.example.crm.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Entité JPA représentant une tâche CRM assignée à un utilisateur.
 *
 * <p>Une tâche peut être liée optionnellement à un {@link Contact}
 * et/ou à une {@link Interaction} existante.</p>
 */
@Entity
@Table(name = "tache")
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
     * Date principale de la tâche (obligatoire en base de données).
     */
    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    /**
     * Date d'échéance de la tâche (optionnelle).
     */
    @Column(name = "date_echeance")
    private LocalDateTime dateEcheance;

    /**
     * Statut de la tâche (ex : EN_ATTENTE, EN_COURS, TERMINEE, ANNULEE).
     */
    @Column(length = 50)
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

    // Constructeur sans argument
    public Tache() {
    }

    // Constructeur avec tous les arguments
    public Tache(Long id, String titre, String description, LocalDateTime date,
                 LocalDateTime dateEcheance, String statut, TypeTache typeTache,
                 User utilisateur, Contact contact, Interaction interaction,
                 LocalDateTime dateCreation, LocalDateTime dateModification) {
        this.id = id;
        this.titre = titre;
        this.description = description;
        this.date = date;
        this.dateEcheance = dateEcheance;
        this.statut = statut;
        this.typeTache = typeTache;
        this.utilisateur = utilisateur;
        this.contact = contact;
        this.interaction = interaction;
        this.dateCreation = dateCreation;
        this.dateModification = dateModification;
    }

    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
        this.dateModification = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.dateModification = LocalDateTime.now();
    }

    // Getters et Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public LocalDateTime getDateEcheance() {
        return dateEcheance;
    }

    public void setDateEcheance(LocalDateTime dateEcheance) {
        this.dateEcheance = dateEcheance;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public TypeTache getTypeTache() {
        return typeTache;
    }

    public void setTypeTache(TypeTache typeTache) {
        this.typeTache = typeTache;
    }

    public User getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(User utilisateur) {
        this.utilisateur = utilisateur;
    }

    public Contact getContact() {
        return contact;
    }

    public void setContact(Contact contact) {
        this.contact = contact;
    }

    public Interaction getInteraction() {
        return interaction;
    }

    public void setInteraction(Interaction interaction) {
        this.interaction = interaction;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public void setDateModification(LocalDateTime dateModification) {
        this.dateModification = dateModification;
    }
}