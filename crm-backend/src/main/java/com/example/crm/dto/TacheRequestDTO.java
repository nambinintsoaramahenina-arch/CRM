package com.example.crm.dto;

import com.example.crm.entity.TypeTache;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de requête pour la création et la modification d'une tâche CRM.
 *
 * <p>Utilisé comme corps de requête ({@code @RequestBody}) des endpoints
 * {@code POST /api/tasks} et {@code PUT /api/tasks/{id}}.</p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    private Long utilisateurId;

    /**
     * Identifiant du contact associé à la tâche (optionnel).
     */
    private Long contactId;

    /**
     * Identifiant de l'interaction associée à la tâche (optionnel).
     */
    private Long interactionId;
}
