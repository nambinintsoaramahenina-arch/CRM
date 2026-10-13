package com.example.crm.service;

import com.example.crm.dto.TacheRequestDTO;
import com.example.crm.dto.TacheResponseDTO;
import com.example.crm.entity.Contact;
import com.example.crm.entity.Interaction;
import com.example.crm.entity.Tache;
import com.example.crm.entity.User;
import com.example.crm.mapper.TacheMapper;
import com.example.crm.repository.ContactRepository;
import com.example.crm.repository.InteractionRepository;
import com.example.crm.repository.TacheRepository;
import com.example.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service métier pour la gestion des tâches CRM.
 *
 * <p>Toutes les opérations CRUD sur les tâches passent par ce service.
 * Les relations optionnelles (contact, interaction) sont résolues uniquement
 * si un identifiant est fourni dans le DTO de requête.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TacheService {

    private final TacheRepository tacheRepository;
    private final UserRepository userRepository;
    private final ContactRepository contactRepository;
    private final InteractionRepository interactionRepository;
    private final TacheMapper tacheMapper;

    // =========================================================================
    // CREATE
    // =========================================================================

    /**
     * Crée une nouvelle tâche en résolvant les entités liées depuis la base de données.
     *
     * @param dto les données de la tâche à créer
     * @return le DTO de réponse de la tâche créée
     * @throws IllegalArgumentException si l'utilisateur, le contact ou l'interaction
     *                                  référencé est introuvable
     */
    public TacheResponseDTO creerTache(TacheRequestDTO dto) {
        log.info("Création d'une nouvelle tâche '{}' assignée à l'utilisateur ID={}",
                dto.getTitre(), dto.getUtilisateurId());

        User utilisateur = userRepository.findById(dto.getUtilisateurId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Utilisateur introuvable avec l'ID : " + dto.getUtilisateurId()));

        Contact contact = resolveContact(dto.getContactId());
        Interaction interaction = resolveInteraction(dto.getInteractionId());

        Tache tache = Tache.builder()
                .titre(dto.getTitre())
                .description(dto.getDescription())
                .date(dto.getDate())                  // Remplit la colonne SQL "date" (NOT NULL)
                .dateEcheance(dto.getDate())            // Remplit la colonne SQL "date_echeance"
                .statut(dto.getStatut() != null ? dto.getStatut() : "EN_ATTENTE")
                .typeTache(dto.getTypeTache())
                .utilisateur(utilisateur)
                .contact(contact)
                .interaction(interaction)
                .build();

        Tache sauvegardee = tacheRepository.save(tache);
        log.info("Tâche créée avec succès, ID={}", sauvegardee.getId());
        return tacheMapper.toResponseDTO(sauvegardee);
    }

    // =========================================================================
    // READ ALL
    // =========================================================================

    /**
     * Retourne la liste complète de toutes les tâches enregistrées.
     *
     * @return liste des DTOs de réponse
     */
    @Transactional(readOnly = true)
    public List<TacheResponseDTO> obtenirToutesLesTaches() {
        log.debug("Récupération de toutes les tâches");
        return tacheRepository.findAll()
                .stream()
                .map(tacheMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // =========================================================================
    // READ BY ID
    // =========================================================================

    /**
     * Retourne une tâche par son identifiant.
     *
     * @param id l'identifiant de la tâche
     * @return le DTO de réponse correspondant
     * @throws IllegalArgumentException si aucune tâche n'est trouvée avec cet ID
     */
    @Transactional(readOnly = true)
    public TacheResponseDTO obtenirTacheParId(Long id) {
        log.debug("Récupération de la tâche ID={}", id);
        Tache tache = tacheRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Tâche introuvable avec l'ID : " + id));
        return tacheMapper.toResponseDTO(tache);
    }

    // =========================================================================
    // READ BY UTILISATEUR
    // =========================================================================

    /**
     * Retourne toutes les tâches assignées à un utilisateur donné.
     *
     * @param utilisateurId l'identifiant de l'utilisateur
     * @return liste des tâches de l'utilisateur
     */
    @Transactional(readOnly = true)
    public List<TacheResponseDTO> obtenirTachesParUtilisateur(Long utilisateurId) {
        log.debug("Récupération des tâches pour l'utilisateur ID={}", utilisateurId);
        return tacheRepository.findByUtilisateurId(utilisateurId)
                .stream()
                .map(tacheMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // =========================================================================
    // READ BY STATUT
    // =========================================================================

    /**
     * Retourne toutes les tâches filtrées par statut.
     *
     * @param statut le statut à filtrer (ex : EN_ATTENTE, EN_COURS, TERMINEE)
     * @return liste des tâches correspondant au statut
     */
    @Transactional(readOnly = true)
    public List<TacheResponseDTO> obtenirTachesParStatut(String statut) {
        log.debug("Récupération des tâches avec le statut '{}'", statut);
        return tacheRepository.findByStatut(statut)
                .stream()
                .map(tacheMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // =========================================================================
    // UPDATE
    // =========================================================================

    /**
     * Modifie une tâche existante.
     *
     * @param id  l'identifiant de la tâche à modifier
     * @param dto les nouvelles données
     * @return le DTO de réponse mis à jour
     * @throws IllegalArgumentException si la tâche ou l'utilisateur référencé est introuvable
     */
    public TacheResponseDTO modifierTache(Long id, TacheRequestDTO dto) {
        log.info("Modification de la tâche ID={}", id);

        Tache tache = tacheRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Tâche introuvable avec l'ID : " + id));

        User utilisateur = userRepository.findById(dto.getUtilisateurId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Utilisateur introuvable avec l'ID : " + dto.getUtilisateurId()));

        tache.setTitre(dto.getTitre());
        tache.setDescription(dto.getDescription());
        tache.setDate(dto.getDate());
        tache.setDateEcheance(dto.getDate());
        tache.setStatut(dto.getStatut() != null ? dto.getStatut() : tache.getStatut());
        tache.setTypeTache(dto.getTypeTache());
        tache.setUtilisateur(utilisateur);
        tache.setContact(resolveContact(dto.getContactId()));
        tache.setInteraction(resolveInteraction(dto.getInteractionId()));

        Tache misAJour = tacheRepository.save(tache);
        log.info("Tâche ID={} modifiée avec succès", id);
        return tacheMapper.toResponseDTO(misAJour);
    }

    // =========================================================================
    // CHANGE STATUT
    // =========================================================================

    /**
     * Met à jour uniquement le statut d'une tâche existante.
     *
     * @param id     l'identifiant de la tâche
     * @param statut le nouveau statut à appliquer
     * @return le DTO de réponse mis à jour
     * @throws IllegalArgumentException si la tâche est introuvable
     */
    public TacheResponseDTO changerStatut(Long id, String statut) {
        log.info("Changement de statut de la tâche ID={} → '{}'", id, statut);
        Tache tache = tacheRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Tâche introuvable avec l'ID : " + id));
        tache.setStatut(statut);
        Tache misAJour = tacheRepository.save(tache);
        return tacheMapper.toResponseDTO(misAJour);
    }

    // =========================================================================
    // DELETE
    // =========================================================================

    /**
     * Supprime une tâche par son identifiant.
     *
     * @param id l'identifiant de la tâche à supprimer
     * @throws IllegalArgumentException si aucune tâche n'est trouvée avec cet ID
     */
    public void supprimerTache(Long id) {
        log.info("Suppression de la tâche ID={}", id);
        if (!tacheRepository.existsById(id)) {
            throw new IllegalArgumentException("Tâche introuvable avec l'ID : " + id);
        }
        tacheRepository.deleteById(id);
        log.info("Tâche ID={} supprimée avec succès", id);
    }

    // =========================================================================
    // MÉTHODES PRIVÉES UTILITAIRES
    // =========================================================================

    private Contact resolveContact(Long contactId) {
        if (contactId == null) {
            return null;
        }
        return contactRepository.findById(contactId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Contact introuvable avec l'ID : " + contactId));
    }

    private Interaction resolveInteraction(Long interactionId) {
        if (interactionId == null) {
            return null;
        }
        return interactionRepository.findById(interactionId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Interaction introuvable avec l'ID : " + interactionId));
    }
}