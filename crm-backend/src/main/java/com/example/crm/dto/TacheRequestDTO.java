package com.example.crm.dto;

import com.example.crm.entity.TypeTache;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * DTO de requête pour la création et la modification d'une tâche CRM.
 *
 * <p>Utilisé comme corps de requête ({@code @RequestBody}) des endpoints
 * {@code POST /api/tasks} et {@code PUT /api/tasks/{id}}.</p>
 */
public class TacheRequestDTO {

    /**
     * Titre court et descriptif de la tâche.
     */
    @NotBlank(message = "Le titre de la tâche est obligatoire")
    private String titre;

    /**
     * Description détaillée de la tâche.
     */
    private String description;

    /**
     * Date d'échéance de la tâche (format ISO-8601 : yyyy-MM-dd'T'HH:mm:ss).
     */
    private LocalDateTime date;

    /**
     * Statut courant de la tâche (ex : EN_ATTENTE, EN_COURS, TERMINEE, ANNULEE).
     * Valeur par défaut appliquée en service si absent : EN_ATTENTE.
     */
    private String statut;

    /**
     * Type de la tâche. Valeurs acceptées :
     * APPEL, EMAIL, REUNION, RENDEZ_VOUS, SUIVI, RELANCE, AUTRE.
     */
    private TypeTache typeTache;

    /**
     * Identifiant de l'utilisateur auquel la tâche est assignée (obligatoire).
     */
    @NotNull(message = "L'identifiant de l'utilisateur assigné est obligatoire")
    @JsonAlias({"utilisateur_id", "userId"})
    private Long utilisateurId;

    /**
     * Identifiant du contact associé à la tâche (optionnel).
     */
    @JsonAlias({"contact_id"})
    private Long contactId;

    /**
     * Identifiant de l'interaction associée à la tâche (optionnel).
     */
    @JsonAlias({"interaction_id"})
    private Long interactionId;

    // Constructeur sans argument
    public TacheRequestDTO() {
    }

    // Constructeur avec tous les arguments
    public TacheRequestDTO(String titre, String description, LocalDateTime date, String statut,
                           TypeTache typeTache, Long utilisateurId, Long contactId, Long interactionId) {
        this.titre = titre;
        this.description = description;
        this.date = date;
        this.statut = statut;
        this.typeTache = typeTache;
        this.utilisateurId = utilisateurId;
        this.contactId = contactId;
        this.interactionId = interactionId;
    }

    // Getters et Setters

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

    public Long getUtilisateurId() {
        return utilisateurId;
    }

    public void setUtilisateurId(Long utilisateurId) {
        this.utilisateurId = utilisateurId;
    }

    public Long getContactId() {
        return contactId;
    }

    public void setContactId(Long contactId) {
        this.contactId = contactId;
    }

    public Long getInteractionId() {
        return interactionId;
    }

    public void setInteractionId(Long interactionId) {
        this.interactionId = interactionId;
    }
}
