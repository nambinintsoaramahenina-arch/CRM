package com.example.crm.repository;

import com.example.crm.entity.JournalActivite;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository Spring Data JPA pour l'entité {@link JournalActivite}.
 * Connecté directement à la table PostgreSQL {@code journal_activite}.
 */
@Repository
public interface JournalActiviteRepository extends JpaRepository<JournalActivite, Long> {

    /**
     * Récupère l'intégralité des entrées du journal d'activité triées par date décroissante (du plus récent au plus ancien).
     * L'annotation @EntityGraph effectue une jointure optimisée sur l'utilisateur lié pour éviter le problème N+1.
     *
     * @return Liste ordonnée de tous les journaux d'activité réels de la BDD.
     */
    @EntityGraph(attributePaths = {"utilisateur"})
    List<JournalActivite> findAllByOrderByDateDesc();

    /**
     * Récupère l'historique d'un utilisateur spécifique trié par date décroissante.
     *
     * @param utilisateurId ID de l'utilisateur
     * @return Liste ordonnée des activités de l'utilisateur
     */
    @EntityGraph(attributePaths = {"utilisateur"})
    List<JournalActivite> findByUtilisateurIdOrderByDateDesc(Long utilisateurId);

    /**
     * Récupère les activités relatives à une entité spécifique (ex: Contact, Tache).
     *
     * @param entiteConcernee Nom de l'entité ciblée
     * @return Liste ordonnée des activités pour cette entité
     */
    @EntityGraph(attributePaths = {"utilisateur"})
    List<JournalActivite> findByEntiteConcerneeOrderByDateDesc(String entiteConcernee);
}
