package com.example.crm.repository;

import com.example.crm.entity.Role;
import com.example.crm.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Méthodes findFirstBy... pour garantir qu'un seul résultat est renvoyé (évite l'erreur "2 results were returned")
    Optional<User> findFirstByEmailOrTelephone(String email, String telephone);
    Optional<User> findFirstByEmail(String email);
    Optional<User> findFirstByTelephone(String telephone);
    Optional<User> findFirstByLogin(String login);
    Optional<User> findFirstByResetToken(String resetToken);

    List<User> findAllByEmail(String email);
    List<User> findAllByLogin(String login);
    List<User> findAllByResetToken(String resetToken);

    Optional<User> findByResetTokenIgnoreCase(String resetToken);
    Optional<User> findFirstByResetTokenIgnoreCase(String resetToken);

    // Délégués de compatibilité redirigeant vers findFirstBy...
    default Optional<User> findByEmailOrTelephone(String email, String telephone) {
        return findFirstByEmailOrTelephone(email, telephone);
    }
    default Optional<User> findByEmail(String email) {
        return findFirstByEmail(email);
    }
    default Optional<User> findByTelephone(String telephone) {
        return findFirstByTelephone(telephone);
    }
    default Optional<User> findByLogin(String login) {
        return findFirstByLogin(login);
    }
    default Optional<User> findByResetToken(String resetToken) {
        return findFirstByResetToken(resetToken);
    }

    boolean existsByEmail(String email);
    boolean existsByLogin(String login);

    @Query("SELECT u FROM User u WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(u.login) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.nomComplet) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:role IS NULL OR u.role = :role) " +
           "AND (:statut IS NULL OR :statut = '' OR u.statut = :statut)")
    Page<User> rechercherEtFiltrer(
        @Param("keyword") String keyword,
        @Param("role") Role role,
        @Param("statut") String statut,
        Pageable pageable
    );
}