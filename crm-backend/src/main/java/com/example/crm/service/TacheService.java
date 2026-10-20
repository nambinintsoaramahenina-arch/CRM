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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
@Transactional
public class TacheService {

    private static final Logger log = LoggerFactory.getLogger(TacheService.class);

    private final TacheRepository tacheRepository;
    private final UserRepository userRepository;
    private final ContactRepository contactRepository;
    private final InteractionRepository interactionRepository;
    private final TacheMapper tacheMapper;
    private final JournalActiviteService journalActiviteService;

    /**
     * Constructeur explicite pour garantir l'injection Spring sans dépendance exclusive à Lombok.
     */
    public TacheService(TacheRepository tacheRepository,
                        UserRepository userRepository,
                        ContactRepository contactRepository,
                        InteractionRepository interactionRepository,
                        TacheMapper tacheMapper,
                        @org.springframework.beans.factory.annotation.Autowired(required = false) JournalActiviteService journalActiviteService) {
        this.tacheRepository = tacheRepository;
        this.userRepository = userRepository;
        this.contactRepository = contactRepository;
        this.interactionRepository = interactionRepository;
        this.tacheMapper = tacheMapper;
        this.journalActiviteService = journalActiviteService;
    }

    // =========================================================================
    // CREATE
    // =========================================================================

    /**
     * Crée une nouvelle tâche en résolvant les entités liées depuis la base de données.
     *
     * @param dto les données de la tâche à créer
     * @return le DTO de réponse de la tâche créée
     * @throws IllegalArgumentException si l'utilisateur ou le contact référencé est introuvable
     */
    public TacheResponseDTO creerTache(TacheRequestDTO dto) {
        log.info("Création d'une nouvelle tâche '{}' assignée à l'utilisateur ID={}",
                dto.getTitre(), dto.getUtilisateurId());

        User utilisateur = userRepository.findById(dto.getUtilisateurId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Utilisateur introuvable avec l'ID : " + dto.getUtilisateurId()));

        Contact contact = resolveContact(dto.getContactId());
        Interaction interaction = resolveInteraction(dto.getContactId(), dto.getInteractionId());

        Tache tache = new Tache();
        tache.setTitre(dto.getTitre());
        tache.setDescription(dto.getDescription());
        tache.setDate(dto.getDate());                  // Remplit la colonne SQL "date" (NOT NULL)
        tache.setDateEcheance(dto.getDate());            // Remplit la colonne SQL "date_echeance"
        tache.setStatut(dto.getStatut() != null ? dto.getStatut() : "EN_ATTENTE");
        tache.setTypeTache(dto.getTypeTache());
        tache.setUtilisateur(utilisateur);
        tache.setContact(contact);
        tache.setInteraction(interaction);

        Tache sauvegardee = tacheRepository.save(tache);
        log.info("Tâche créée avec succès, ID={}", sauvegardee.getId());

        if (journalActiviteService != null) {
            try {
                String auteur = journalActiviteService.getNomAuteurAction();
                String assigne = utilisateur.getNomComplet() != null ? utilisateur.getNomComplet() : utilisateur.getLogin();
                journalActiviteService.logAction(
                    "CREATE",
                    "Tache",
                    sauvegardee.getId(),
                    String.format("%s a créé la tâche '%s' (Assignée à: %s, Statut: %s)",
                        auteur, sauvegardee.getTitre(), assigne, sauvegardee.getStatut())
                );
            } catch (Exception e) {
                log.warn("[TACHE CREATE LOG] Échec enregistrement journal : {}", e.getMessage());
            }
        }

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
        tache.setInteraction(resolveInteraction(dto.getContactId(), dto.getInteractionId()));

        Tache misAJour = tacheRepository.save(tache);
        log.info("Tâche ID={} modifiée avec succès", id);

        if (journalActiviteService != null) {
            try {
                String auteur = journalActiviteService.getNomAuteurAction();
                String assigne = utilisateur.getNomComplet() != null ? utilisateur.getNomComplet() : utilisateur.getLogin();
                journalActiviteService.logAction(
                    "UPDATE",
                    "Tache",
                    misAJour.getId(),
                    String.format("%s a modifié la tâche '%s' (Assignée à: %s, Statut: %s)",
                        auteur, misAJour.getTitre(), assigne, misAJour.getStatut())
                );
            } catch (Exception e) {
                log.warn("[TACHE UPDATE LOG] Échec enregistrement journal : {}", e.getMessage());
            }
        }

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

        if (journalActiviteService != null) {
            try {
                String auteur = journalActiviteService.getNomAuteurAction();
                journalActiviteService.logAction(
                    "UPDATE",
                    "Tache",
                    misAJour.getId(),
                    String.format("%s a changé le statut de la tâche '%s' en '%s'",
                        auteur, misAJour.getTitre(), statut)
                );
            } catch (Exception e) {
                log.warn("[TACHE STATUT LOG] Échec enregistrement journal : {}", e.getMessage());
            }
        }

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
        Tache tache = tacheRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tâche introuvable avec l'ID : " + id));
        String titre = tache.getTitre();

        tacheRepository.deleteById(id);
        log.info("Tâche ID={} supprimée avec succès", id);

        if (journalActiviteService != null) {
            try {
                String auteur = journalActiviteService.getNomAuteurAction();
                journalActiviteService.logAction(
                    "DELETE",
                    "Tache",
                    id,
                    String.format("%s a supprimé la tâche '%s' (ID: #%d)", auteur, titre, id)
                );
            } catch (Exception e) {
                log.warn("[TACHE DELETE LOG] Échec enregistrement journal : {}", e.getMessage());
            }
        }
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

    /**
     * Résout l'interaction liée :
     * 1. Si aucun contactId n'est fourni, retourne null.
     * 2. Si un interactionId est fourni explicitement, récupère cette interaction.
     * 3. Si aucun interactionId n'est fourni (ou si introuvable), récupère automatiquement
     *    la dernière Interaction associée à ce Contact (interactionRepository.findTopByContactIdOrderByDateDesc(contactId)).
     */
    private Interaction resolveInteraction(Long contactId, Long interactionId) {
        if (contactId == null) {
            return null;
        }

        if (interactionId != null) {
            return interactionRepository.findById(interactionId)
                    .orElseGet(() -> interactionRepository.findTopByContactIdOrderByDateDesc(contactId).orElse(null));
        }

        return interactionRepository.findTopByContactIdOrderByDateDesc(contactId)
                .orElse(null);
    }
}