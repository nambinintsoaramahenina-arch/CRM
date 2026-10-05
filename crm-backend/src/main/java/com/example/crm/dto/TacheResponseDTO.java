package com.example.crm.dto;

import com.example.crm.entity.TypeTache;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de réponse retourné par les endpoints de lecture des tâches CRM.
 *
 * <p>Il enrichit les données brutes de l'entité avec les informations
 * affichables des entités liées (utilisateur, contact, interaction)
 * afin d'éviter tout problème de sérialisation de proxies Hibernate.</p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
}
