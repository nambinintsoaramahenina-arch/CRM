package com.example.crm.dto;

import com.example.crm.entity.TypeInteraction;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * DTO de requête pour la création et la modification d'une interaction CRM.
 * Utilisé comme corps de requête des endpoints POST et PUT.
 */
public class InteractionRequestDTO {

    /**
     * Type de l'interaction. Valeurs acceptées :
     * APPEL, EMAIL, REUNION, RENDEZ_VOUS, MESSAGE, AUTRE.
     */
    @NotNull(message = "Le type d'interaction est obligatoire")
    private TypeInteraction type;

    /**
     * Date et heure de l'interaction.
     */
    @NotNull(message = "La date de l'interaction est obligatoire")
    private LocalDateTime date;

    /**
     * Objet ou sujet de l'interaction.
     */
    private String objet;

    /**
     * Description détaillée du déroulement de l'interaction.
     */
    private String description;

    /**
     * Résultat ou conclusion obtenu lors de l'interaction.
     */
    private String resultat;

    /**
     * Prochaine action à engager suite à cette interaction.
     */
    private String prochaineAction;

    /**
     * Identifiant du contact concerné par l'interaction.
     */
    @NotNull(message = "L'identifiant du contact est obligatoire")
    private Long contactId;

    // Constructeur sans argument
    public InteractionRequestDTO() {
    }

    // Constructeur avec tous les arguments
    public InteractionRequestDTO(TypeInteraction type, LocalDateTime date, String objet,
                                 String description, String resultat, String prochaineAction,
                                 Long contactId) {
        this.type = type;
        this.date = date;
        this.objet = objet;
        this.description = description;
        this.resultat = resultat;
        this.prochaineAction = prochaineAction;
        this.contactId = contactId;
    }

    // Getters et Setters

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
}
