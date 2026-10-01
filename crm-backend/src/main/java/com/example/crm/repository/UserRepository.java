package com.example.crm.repository;

import com.example.crm.entity.Role;
import com.example.crm.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailOrTelephone(String email, String telephone);
    Optional<User> findByEmail(String email);
    Optional<User> findByTelephone(String telephone);
    Optional<User> findByLogin(String login);
    Optional<User> findByResetToken(String resetToken);

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