package com.example.crm.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "contacts")
@Data
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom complet est obligatoire")
    private String nomComplet;

    private String entreprise;

    @Email(message = "L'email doit être valide")
    private String email;

    private String telephone;
    private String fonction;
    private String statut; // Ex: ACTIF, INACTIF

    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;

    // Relation Many-to-One vers l'entité User existante
    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private User utilisateur;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        dateModification = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }
}