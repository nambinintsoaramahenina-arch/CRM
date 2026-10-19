package com.example.crm.repository;

import com.example.crm.entity.Notification;
import com.example.crm.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findAllByOrderByDateCreationDesc();

    List<Notification> findByLueFalseOrderByDateCreationDesc();

    long countByLueFalse();

    List<Notification> findAllByUser(User user);

    List<Notification> findAllByUserAndStatut(User user, String statut);
}
