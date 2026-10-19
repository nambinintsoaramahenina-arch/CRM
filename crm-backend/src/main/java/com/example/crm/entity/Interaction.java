package com.example.crm.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Entité JPA représentant une interaction CRM (appel, email, réunion, etc.)
 * entre un utilisateur et un contact.
 */
@Entity
@Table(name = "interactions")
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

    // Constructeur sans argument
    public Interaction() {
    }

    // Constructeur avec tous les arguments
    public Interaction(Long id, TypeInteraction type, LocalDateTime date, String objet,
                       String description, String resultat, String prochaineAction,
                       Contact contact, User utilisateur, LocalDateTime dateCreation,
                       LocalDateTime dateModification) {
        this.id = id;
        this.type = type;
        this.date = date;
        this.objet = objet;
        this.description = description;
        this.resultat = resultat;
        this.prochaineAction = prochaineAction;
        this.contact = contact;
        this.utilisateur = utilisateur;
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

    public TypeInteraction getType() {
        return type;
    }

    public void setType(TypeInteraction type) {
        this.type = type;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getObjet() {
        return objet;
    }

    public void setObjet(String objet) {
        this.objet = objet;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getResultat() {
        return resultat;
    }

    public void setResultat(String resultat) {
        this.resultat = resultat;
    }

    public String getProchaineAction() {
        return prochaineAction;
    }

    public void setProchaineAction(String prochaineAction) {
        this.prochaineAction = prochaineAction;
    }

    public Contact getContact() {
        return contact;
    }

    public void setContact(Contact contact) {
        this.contact = contact;
    }

    public User getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(User utilisateur) {
        this.utilisateur = utilisateur;
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
