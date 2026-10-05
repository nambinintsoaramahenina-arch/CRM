package com.example.crm.dto;

import com.example.crm.entity.TypeInteraction;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de requête pour la création et la modification d'une interaction CRM.
 * Utilisé comme corps de requête des endpoints POST et PUT.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
}
