package com.example.crm.dto;

import com.example.crm.entity.TypeInteraction;
import java.time.LocalDateTime;

/**
 * DTO de réponse retourné par les endpoints de l'API pour une interaction CRM.
 * Expose uniquement les données nécessaires au client (pas d'entité JPA exposée).
 */
public class InteractionResponseDTO {

    private Long id;

    /** Type de l'interaction (APPEL, EMAIL, REUNION, etc.). */
    private TypeInteraction type;

    /** Date et heure de l'interaction. */
    private LocalDateTime date;

    /** Objet / sujet de l'interaction. */
    private String objet;

    /** Description détaillée. */
    private String description;

    /** Résultat ou conclusion. */
    private String resultat;

    /** Prochaine action planifiée. */
    private String prochaineAction;

    // --- Informations du Contact associé ---
    private Long contactId;
    private String contactNomComplet;
    private String contactEntreprise;

    // --- Informations de l'Utilisateur responsable ---
    private Long utilisateurId;
    private String utilisateurNomComplet;
    private String utilisateurLogin;

    /** Date de création de l'enregistrement. */
    private LocalDateTime dateCreation;

    /** Date de dernière modification de l'enregistrement. */
    private LocalDateTime dateModification;

    // Constructeur sans argument
    public InteractionResponseDTO() {
    }

    // Constructeur avec tous les arguments
    public InteractionResponseDTO(Long id, TypeInteraction type, LocalDateTime date, String objet,
                                  String description, String resultat, String prochaineAction,
                                  Long contactId, String contactNomComplet, String contactEntreprise,
                                  Long utilisateurId, String utilisateurNomComplet, String utilisateurLogin,
                                  LocalDateTime dateCreation, LocalDateTime dateModification) {
        this.id = id;
        this.type = type;
        this.date = date;
        this.objet = objet;
        this.description = description;
        this.resultat = resultat;
        this.prochaineAction = prochaineAction;
        this.contactId = contactId;
        this.contactNomComplet = contactNomComplet;
        this.contactEntreprise = contactEntreprise;
        this.utilisateurId = utilisateurId;
        this.utilisateurNomComplet = utilisateurNomComplet;
        this.utilisateurLogin = utilisateurLogin;
        this.dateCreation = dateCreation;
        this.dateModification = dateModification;
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

    public Long getContactId() {
        return contactId;
    }

    public void setContactId(Long contactId) {
        this.contactId = contactId;
    }

    public String getContactNomComplet() {
        return contactNomComplet;
    }

    public void setContactNomComplet(String contactNomComplet) {
        this.contactNomComplet = contactNomComplet;
    }

    public String getContactEntreprise() {
        return contactEntreprise;
    }

    public void setContactEntreprise(String contactEntreprise) {
        this.contactEntreprise = contactEntreprise;
    }

    public Long getUtilisateurId() {
        return utilisateurId;
    }

    public void setUtilisateurId(Long utilisateurId) {
        this.utilisateurId = utilisateurId;
    }

    public String getUtilisateurNomComplet() {
        return utilisateurNomComplet;
    }

    public void setUtilisateurNomComplet(String utilisateurNomComplet) {
        this.utilisateurNomComplet = utilisateurNomComplet;
    }

    public String getUtilisateurLogin() {
        return utilisateurLogin;
    }

    public void setUtilisateurLogin(String utilisateurLogin) {
        this.utilisateurLogin = utilisateurLogin;
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
