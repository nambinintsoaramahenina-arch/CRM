package com.example.crm.mapper;

import com.example.crm.dto.InteractionResponseDTO;
import com.example.crm.entity.Contact;
import com.example.crm.entity.Interaction;
import com.example.crm.entity.User;
import org.springframework.stereotype.Component;



/**
 * Mapper responsable des conversions entre l'entité {@link Interaction}
 * et les DTOs {@link com.example.crm.dto.InteractionRequestDTO} /
 * {@link InteractionResponseDTO}.
 *
 * <p>Implémentation manuelle (sans MapStruct) pour rester cohérent avec
 * l'architecture existante du projet.</p>
 */
@Component
public class InteractionMapper {

    /**
     * Convertit une entité {@link Interaction} en {@link InteractionResponseDTO}.
     *
     * @param interaction l'entité source (non nulle)
     * @return le DTO de réponse hydraté
     */
    public InteractionResponseDTO toResponseDTO(Interaction interaction) {
        if (interaction == null) {
            return null;
        }

        InteractionResponseDTO dto = new InteractionResponseDTO();
        dto.setId(interaction.getId());
        dto.setType(interaction.getType());
        dto.setDate(interaction.getDate());
        dto.setObjet(interaction.getObjet());
        dto.setDescription(interaction.getDescription());
        dto.setResultat(interaction.getResultat());
        dto.setProchaineAction(interaction.getProchaineAction());
        dto.setDateCreation(interaction.getDateCreation());
        dto.setDateModification(interaction.getDateModification());

        // Hydratation des données du Contact associé
        Contact contact = interaction.getContact();
        if (contact != null) {
            dto.setContactId(contact.getId());
            dto.setContactNomComplet(contact.getNomComplet());
            dto.setContactEntreprise(contact.getEntreprise());
        }

        // Hydratation des données de l'Utilisateur responsable
        User utilisateur = interaction.getUtilisateur();
        if (utilisateur != null) {
            dto.setUtilisateurId(utilisateur.getId());
            dto.setUtilisateurNomComplet(utilisateur.getNomComplet());
            dto.setUtilisateurLogin(utilisateur.getLogin());
        }

        return dto;
    }
}
