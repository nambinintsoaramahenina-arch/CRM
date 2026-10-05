package com.example.crm.repository;

import com.example.crm.entity.Tache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository Spring Data JPA pour l'entité {@link Tache}.
 *
 * <p>Hérite de toutes les opérations CRUD de {@link JpaRepository} et
 * expose des requêtes métier supplémentaires pour filtrer les tâches
 * par utilisateur, contact, statut ou interaction.</p>
 */
@Repository
public interface TacheRepository extends JpaRepository<Tache, Long> {

    /**
     * Retourne toutes les tâches assignées à un utilisateur donné,
     * triées par date d'échéance croissante.
     *
     * @param utilisateurId l'identifiant de l'utilisateur
     * @return liste de tâches triées par échéance
     */
    @Query("SELECT t FROM Tache t WHERE t.utilisateur.id = :utilisateurId ORDER BY t.date ASC NULLS LAST")
    List<Tache> findByUtilisateurId(@Param("utilisateurId") Long utilisateurId);

    /**
     * Retourne toutes les tâches associées à un contact donné.
     *
     * @param contactId l'identifiant du contact
     * @return liste de tâches liées au contact
     */
    List<Tache> findByContactId(Long contactId);

    /**
     * Retourne toutes les tâches associées à une interaction donnée.
     *
     * @param interactionId l'identifiant de l'interaction
     * @return liste de tâches liées à l'interaction
     */
    List<Tache> findByInteractionId(Long interactionId);

    /**
     * Retourne toutes les tâches filtrées par statut.
     *
     * @param statut le statut à filtrer (ex : EN_ATTENTE, EN_COURS, TERMINEE)
     * @return liste de tâches correspondant au statut
     */
    List<Tache> findByStatut(String statut);

    /**
     * Retourne les tâches d'un utilisateur filtrées par statut.
     *
     * @param utilisateurId l'identifiant de l'utilisateur
     * @param statut        le statut à filtrer
     * @return liste de tâches filtrées
     */
    List<Tache> findByUtilisateurIdAndStatut(Long utilisateurId, String statut);
}
