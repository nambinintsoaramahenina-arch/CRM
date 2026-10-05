package com.example.crm.service;

import com.example.crm.dto.InteractionRequestDTO;
import com.example.crm.dto.InteractionResponseDTO;
import com.example.crm.entity.Contact;
import com.example.crm.entity.Interaction;
import com.example.crm.entity.User;
import com.example.crm.mapper.InteractionMapper;
import com.example.crm.repository.ContactRepository;
import com.example.crm.repository.InteractionRepository;
import com.example.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service métier pour la gestion des interactions CRM.
 *
 * <p>Toutes les opérations CRUD sur les interactions passent par ce service.
 * L'utilisateur connecté est automatiquement résolu depuis le contexte de
 * sécurité Spring Security lors de la création d'une interaction.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InteractionService {

    private final InteractionRepository interactionRepository;
    private final ContactRepository contactRepository;
    private final UserRepository userRepository;
    private final InteractionMapper interactionMapper;

    // =========================================================================
    // CREATE
    // =========================================================================

    /**
     * Crée une nouvelle interaction en associant automatiquement l'utilisateur
     * actuellement authentifié comme responsable.
     *
     * @param dto les données de l'interaction à créer
     * @return le DTO de réponse de l'interaction créée
     * @throws IllegalArgumentException si le contact ou l'utilisateur est introuvable
     */
    public InteractionResponseDTO creerInteraction(InteractionRequestDTO dto) {
        log.info("Création d'une nouvelle interaction de type '{}' pour le contact ID={}",
                dto.getType(), dto.getContactId());

        Contact contact = contactRepository.findById(dto.getContactId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Contact introuvable avec l'ID : " + dto.getContactId()));

        User utilisateur = obtenirUtilisateurConnecte();

        Interaction interaction = Interaction.builder()
                .type(dto.getType())
                .date(dto.getDate())
                .objet(dto.getObjet())
                .description(dto.getDescription())
                .resultat(dto.getResultat())
                .prochaineAction(dto.getProchaineAction())
                .contact(contact)
                .utilisateur(utilisateur)
                .build();

        Interaction sauvegardee = interactionRepository.save(interaction);
        log.info("Interaction créée avec succès, ID={}", sauvegardee.getId());
        return interactionMapper.toResponseDTO(sauvegardee);
    }

    // =========================================================================
    // READ ALL
    // =========================================================================

    /**
     * Retourne la liste de toutes les interactions, triées par date décroissante.
     *
     * @return liste des DTOs de réponse
     */
    @Transactional(readOnly = true)
    public List<InteractionResponseDTO> obtenirToutesLesInteractions() {
        log.debug("Récupération de toutes les interactions");
        return interactionRepository.findAll()
                .stream()
                .map(interactionMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // =========================================================================
    // READ BY ID
    // =========================================================================

    /**
     * Retourne une interaction par son identifiant.
     *
     * @param id l'identifiant de l'interaction
     * @return le DTO de réponse correspondant
     * @throws IllegalArgumentException si aucune interaction n'est trouvée avec cet ID
     */
    @Transactional(readOnly = true)
    public InteractionResponseDTO obtenirInteractionParId(Long id) {
        log.debug("Récupération de l'interaction ID={}", id);
        Interaction interaction = interactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Interaction introuvable avec l'ID : " + id));
        return interactionMapper.toResponseDTO(interaction);
    }

    // =========================================================================
    // UPDATE
    // =========================================================================

    /**
     * Modifie une interaction existante.
     *
     * @param id  l'identifiant de l'interaction à modifier
     * @param dto les nouvelles données
     * @return le DTO de réponse mis à jour
     * @throws IllegalArgumentException si l'interaction ou le contact est introuvable
     */
    public InteractionResponseDTO modifierInteraction(Long id, InteractionRequestDTO dto) {
        log.info("Modification de l'interaction ID={}", id);

        Interaction interaction = interactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Interaction introuvable avec l'ID : " + id));

        Contact contact = contactRepository.findById(dto.getContactId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Contact introuvable avec l'ID : " + dto.getContactId()));

        interaction.setType(dto.getType());
        interaction.setDate(dto.getDate());
        interaction.setObjet(dto.getObjet());
        interaction.setDescription(dto.getDescription());
        interaction.setResultat(dto.getResultat());
        interaction.setProchaineAction(dto.getProchaineAction());
        interaction.setContact(contact);
        // Note : l'utilisateur responsable n'est pas modifiable après création

        Interaction misAJour = interactionRepository.save(interaction);
        log.info("Interaction ID={} modifiée avec succès", id);
        return interactionMapper.toResponseDTO(misAJour);
    }

    // =========================================================================
    // DELETE
    // =========================================================================

    /**
     * Supprime une interaction par son identifiant.
     *
     * @param id l'identifiant de l'interaction à supprimer
     * @throws IllegalArgumentException si aucune interaction n'est trouvée avec cet ID
     */
    public void supprimerInteraction(Long id) {
        log.info("Suppression de l'interaction ID={}", id);
        if (!interactionRepository.existsById(id)) {
            throw new IllegalArgumentException("Interaction introuvable avec l'ID : " + id);
        }
        interactionRepository.deleteById(id);
        log.info("Interaction ID={} supprimée avec succès", id);
    }

    // =========================================================================
    // MÉTHODE PRIVÉE UTILITAIRE
    // =========================================================================

    /**
     * Résout l'utilisateur actuellement authentifié depuis le contexte Spring Security.
     * Utilise le login (username) extrait du token JWT.
     *
     * @return l'entité {@link User} de l'utilisateur connecté
     * @throws IllegalArgumentException si l'utilisateur n'est pas trouvé en base
     */
    private User obtenirUtilisateurConnecte() {
        String login = SecurityContextHolder.getContext().getAuthentication().getName();
        log.debug("Résolution de l'utilisateur connecté : login='{}'", login);
        return userRepository.findByLogin(login)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Utilisateur connecté introuvable : " + login));
    }
}
