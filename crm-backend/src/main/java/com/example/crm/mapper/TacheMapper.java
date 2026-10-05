package com.example.crm.mapper;

import com.example.crm.dto.TacheResponseDTO;
import com.example.crm.entity.Contact;
import com.example.crm.entity.Interaction;
import com.example.crm.entity.Tache;
import com.example.crm.entity.User;
import org.springframework.stereotype.Component;

/**
 * Mapper responsable des conversions entre l'entité {@link Tache}
 * et le DTO {@link TacheResponseDTO}.
 *
 * <p>Implémentation manuelle (sans MapStruct) pour rester cohérent avec
 * l'architecture existante du projet basée sur {@link InteractionMapper}.</p>
 */
@Component
public class TacheMapper {

    /**
     * Convertit une entité {@link Tache} en {@link TacheResponseDTO}.
     *
     * @param tache l'entité source (peut être null)
     * @return le DTO de réponse hydraté, ou {@code null} si l'entité est nulle
     */
    public TacheResponseDTO toResponseDTO(Tache tache) {
        if (tache == null) {
            return null;
        }

        TacheResponseDTO dto = new TacheResponseDTO();
        dto.setId(tache.getId());
        dto.setTitre(tache.getTitre());
        dto.setDescription(tache.getDescription());
        dto.setDate(tache.getDate());
        dto.setStatut(tache.getStatut());
        dto.setTypeTache(tache.getTypeTache());
        dto.setDateCreation(tache.getDateCreation());
        dto.setDateModification(tache.getDateModification());

        // Hydratation de l'utilisateur assigné
        User utilisateur = tache.getUtilisateur();
        if (utilisateur != null) {
            dto.setUtilisateurId(utilisateur.getId());
            dto.setUtilisateurNomComplet(utilisateur.getNomComplet());
            dto.setUtilisateurLogin(utilisateur.getLogin());
        }

        // Hydratation du contact associé (optionnel)
        Contact contact = tache.getContact();
        if (contact != null) {
            dto.setContactId(contact.getId());
            dto.setContactNomComplet(contact.getNomComplet());
            dto.setContactEntreprise(contact.getEntreprise());
        }

        // Hydratation de l'interaction associée (optionnel)
        Interaction interaction = tache.getInteraction();
        if (interaction != null) {
            dto.setInteractionId(interaction.getId());
            dto.setInteractionObjet(interaction.getObjet());
        }

        return dto;
    }
}
