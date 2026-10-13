package com.example.crm.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entité représentant une demande de réinitialisation de mot de passe
 * soumise par un utilisateur et en attente de validation par l'administrateur.
 */
@Entity
@Table(name = "password_reset_requests")
public class PasswordResetRequest {

    public enum Statut {
        PENDING,   // En attente de validation par l'admin
        APPROVED,  // Validée et mot de passe envoyé par e-mail
        REJECTED   // Rejetée par l'admin
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Utilisateur ayant soumis la demande */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Statut statut = Statut.PENDING;

    /** Date et heure de la demande */
    @Column(nullable = false)
    private LocalDateTime dateDemande;

    /** Date et heure du traitement par l'admin (null si toujours en attente) */
    private LocalDateTime dateTraitement;

    /** Message optionnel laissé par l'admin lors du traitement */
    private String commentaireAdmin;

    public PasswordResetRequest() {}

    public PasswordResetRequest(User user) {
        this.user        = user;
        this.statut      = Statut.PENDING;
        this.dateDemande = LocalDateTime.now();
    }

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Statut getStatut() { return statut; }
    public void setStatut(Statut statut) { this.statut = statut; }

    public LocalDateTime getDateDemande() { return dateDemande; }
    public void setDateDemande(LocalDateTime dateDemande) { this.dateDemande = dateDemande; }

    public LocalDateTime getDateTraitement() { return dateTraitement; }
    public void setDateTraitement(LocalDateTime dateTraitement) { this.dateTraitement = dateTraitement; }

    public String getCommentaireAdmin() { return commentaireAdmin; }
    public void setCommentaireAdmin(String commentaireAdmin) { this.commentaireAdmin = commentaireAdmin; }
}
