package com.example.crm.repository;

import com.example.crm.entity.PasswordResetRequest;
import com.example.crm.entity.PasswordResetRequest.Statut;
import com.example.crm.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long> {

    /** Récupère toutes les demandes triées par date décroissante */
    List<PasswordResetRequest> findAllByOrderByDateDemandeDesc();

    /** Récupère uniquement les demandes PENDING, triées par date décroissante */
    List<PasswordResetRequest> findByStatutOrderByDateDemandeDesc(Statut statut);

    /** Vérifie si l'utilisateur a déjà une demande PENDING en cours */
    boolean existsByUserAndStatut(User user, Statut statut);

    /** Récupère la demande PENDING active d'un utilisateur (s'il en existe une) */
    Optional<PasswordResetRequest> findByUserAndStatut(User user, Statut statut);

    /** Nombre de demandes PENDING en attente */
    @Query("SELECT COUNT(r) FROM PasswordResetRequest r WHERE r.statut = 'PENDING'")
    long countPending();
}
