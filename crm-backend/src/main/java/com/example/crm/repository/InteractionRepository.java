package com.example.crm.repository;

import com.example.crm.entity.Interaction;
import com.example.crm.entity.TypeInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository Spring Data JPA pour la gestion des interactions CRM.
 */
@Repository
public interface InteractionRepository extends JpaRepository<Interaction, Long> {

    /**
     * Trouve toutes les interactions liées à un contact donné.
     */
    List<Interaction> findByContactId(Long contactId);

    /**
     * Récupère automatiquement la dernière Interaction associée à un Contact par date décroissante.
     */
    Optional<Interaction> findTopByContactIdOrderByDateDesc(Long contactId);

    /**
     * Trouve toutes les interactions d'un utilisateur donné.
     */
    List<Interaction> findByUtilisateurId(Long utilisateurId);

    /**
     * Trouve toutes les interactions d'un type donné.
     */
    List<Interaction> findByType(TypeInteraction type);

    /**
     * Trouve toutes les interactions dans une plage de dates.
     */
    List<Interaction> findByDateBetween(LocalDateTime debut, LocalDateTime fin);

    /**
     * Recherche multicritères sur les interactions (contact, utilisateur, type).
     */
    @Query("SELECT i FROM Interaction i " +
           "WHERE (:contactId IS NULL OR i.contact.id = :contactId) " +
           "AND (:utilisateurId IS NULL OR i.utilisateur.id = :utilisateurId) " +
           "AND (:type IS NULL OR i.type = :type) " +
           "ORDER BY i.date DESC")
    List<Interaction> rechercherInteractions(
            @Param("contactId") Long contactId,
            @Param("utilisateurId") Long utilisateurId,
            @Param("type") TypeInteraction type
    );
}
