package com.example.crm.dto;

import com.example.crm.entity.TypeInteraction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de réponse retourné par les endpoints de l'API pour une interaction CRM.
 * Expose uniquement les données nécessaires au client (pas d'entité JPA exposée).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
}
