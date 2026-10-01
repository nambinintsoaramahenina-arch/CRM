  package com.example.crm.dto;

public class AuthResponse {
    private String token;
    private String role;
    private String nomComplet;

    // Constructeur par défaut (nécessaire pour la sérialisation/désérialisation JSON)
    public AuthResponse() {}

    // Constructeur avec tous les champs
    public AuthResponse(String token, String role, String nomComplet) {
        this.token = token;
        this.role = role;
        this.nomComplet = nomComplet;
    }

    // Getters et Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getNomComplet() {
        return nomComplet;
    }

    public void setNomComplet(String nomComplet) {
        this.nomComplet = nomComplet;
    }
}  

