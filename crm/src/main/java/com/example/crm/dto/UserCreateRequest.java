package com.example.crm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UserCreateRequest {

    @NotBlank(message = "Le login est obligatoire")
    private String login;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    private String mdp;

    @NotBlank(message = "Le nom complet est obligatoire")
    private String nomComplet;

    private String role; // "ADMIN", "MANAGER", "CLIENT", "USER"
    private String telephone;
    private String statut; // "ACTIF" ou "INACTIF"

    // Constructeur par défaut
    public UserCreateRequest() {}

    // Constructeur tout paramètre
    public UserCreateRequest(String login, String email, String mdp, String nomComplet, String role, String telephone) {
        this.login = login;
        this.email = email;
        this.mdp = mdp;
        this.nomComplet = nomComplet;
        this.role = role;
        this.telephone = telephone;
        this.statut = "ACTIF";
    }

    public UserCreateRequest(String login, String email, String mdp, String nomComplet, String role, String telephone, String statut) {
        this.login = login;
        this.email = email;
        this.mdp = mdp;
        this.nomComplet = nomComplet;
        this.role = role;
        this.telephone = telephone;
        this.statut = statut;
    }

    // Getters et Setters
    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMdp() { return mdp; }
    public void setMdp(String mdp) { this.mdp = mdp; }

    public String getNomComplet() { return nomComplet; }
    public void setNomComplet(String nomComplet) { this.nomComplet = nomComplet; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}

