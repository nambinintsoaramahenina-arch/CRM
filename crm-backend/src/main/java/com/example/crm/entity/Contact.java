package com.example.crm.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "contacts")
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

    // Constructeur sans argument (obligatoire pour JPA)
    public Contact() {
    }

    // Constructeur complet avec tous les attributs
    public Contact(Long id, String nomComplet, String entreprise, String email, String telephone,
                   String fonction, String statut, LocalDateTime dateCreation,
                   LocalDateTime dateModification, User utilisateur) {
        this.id = id;
        this.nomComplet = nomComplet;
        this.entreprise = entreprise;
        this.email = email;
        this.telephone = telephone;
        this.fonction = fonction;
        this.statut = statut;
        this.dateCreation = dateCreation;
        this.dateModification = dateModification;
        this.utilisateur = utilisateur;
    }

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        dateModification = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }

    // Getters et Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomComplet() {
        return nomComplet;
    }

    public void setNomComplet(String nomComplet) {
        this.nomComplet = nomComplet;
    }

    public String getEntreprise() {
        return entreprise;
    }

    public void setEntreprise(String entreprise) {
        this.entreprise = entreprise;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getFonction() {
        return fonction;
    }

    public void setFonction(String fonction) {
        this.fonction = fonction;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public void setDateModification(LocalDateTime dateModification) {
        this.dateModification = dateModification;
    }

    public User getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(User utilisateur) {
        this.utilisateur = utilisateur;
    }
}