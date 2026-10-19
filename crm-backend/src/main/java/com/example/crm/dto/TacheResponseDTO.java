package com.example.crm.dto;

import com.example.crm.entity.TypeTache;
import java.time.LocalDateTime;

/**
 * DTO de réponse retourné par les endpoints de lecture des tâches CRM.
 *
 * <p>Il enrichit les données brutes de l'entité avec les informations
 * affichables des entités liées (utilisateur, contact, interaction)
 * afin d'éviter tout problème de sérialisation de proxies Hibernate.</p>
 */
public class TacheResponseDTO {

    // ---- Identifiant -------------------------------------------------------
    private Long id;

    // ---- Champs métier -----------------------------------------------------
    private String titre;
    private String description;
    private LocalDateTime date;
    private String statut;
    private TypeTache typeTache;

    // ---- Audit -------------------------------------------------------------
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;

    // ---- Utilisateur assigné -----------------------------------------------
    /** Identifiant de l'utilisateur assigné. */
    private Long utilisateurId;
    /** Nom complet de l'utilisateur assigné. */
    private String utilisateurNomComplet;
    /** Login de l'utilisateur assigné. */
    private String utilisateurLogin;

    // ---- Contact associé (optionnel) ----------------------------------------
    /** Identifiant du contact associé (peut être null). */
    private Long contactId;
    /** Nom complet du contact associé (peut être null). */
    private String contactNomComplet;
    /** Entreprise du contact associé (peut être null). */
    private String contactEntreprise;

    // ---- Interaction associée (optionnel) -----------------------------------
    /** Identifiant de l'interaction associée (peut être null). */
    private Long interactionId;
    /** Objet/sujet de l'interaction associée (peut être null). */
    private String interactionObjet;

    // Constructeur sans argument
    public TacheResponseDTO() {
    }

    // Constructeur avec tous les arguments
    public TacheResponseDTO(Long id, String titre, String description, LocalDateTime date,
                            String statut, TypeTache typeTache, LocalDateTime dateCreation,
                            LocalDateTime dateModification, Long utilisateurId,
                            String utilisateurNomComplet, String utilisateurLogin, Long contactId,
                            String contactNomComplet, String contactEntreprise, Long interactionId,
                            String interactionObjet) {
        this.id = id;
        this.titre = titre;
        this.description = description;
        this.date = date;
        this.statut = statut;
        this.typeTache = typeTache;
        this.dateCreation = dateCreation;
        this.dateModification = dateModification;
        this.utilisateurId = utilisateurId;
        this.utilisateurNomComplet = utilisateurNomComplet;
        this.utilisateurLogin = utilisateurLogin;
        this.contactId = contactId;
        this.contactNomComplet = contactNomComplet;
        this.contactEntreprise = contactEntreprise;
        this.interactionId = interactionId;
        this.interactionObjet = interactionObjet;
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

    public Long getInteractionId() {
        return interactionId;
    }

    public void setInteractionId(Long interactionId) {
        this.interactionId = interactionId;
    }

    public String getInteractionObjet() {
        return interactionObjet;
    }

    public void setInteractionObjet(String interactionObjet) {
        this.interactionObjet = interactionObjet;
    }
}
