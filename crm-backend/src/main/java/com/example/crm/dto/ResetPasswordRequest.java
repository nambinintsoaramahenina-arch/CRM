package com.example.crm.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {

    @NotBlank(message = "Le token de réinitialisation est obligatoire.")
    @JsonAlias({"resetToken", "code"})
    private String token;

    @JsonAlias({"userEmail", "mail"})
    private String email;

    @NotBlank(message = "Le nouveau mot de passe est obligatoire.")
    @Size(min = 6, message = "Le nouveau mot de passe doit comporter au moins 6 caractères.")
    @JsonAlias({"password", "newPassword", "pwd"})
    private String nouveauMdp;

    public ResetPasswordRequest() {}

    public ResetPasswordRequest(String token, String nouveauMdp) {
        this.token = token;
        this.nouveauMdp = nouveauMdp;
    }

    public ResetPasswordRequest(String token, String email, String nouveauMdp) {
        this.token = token;
        this.email = email;
        this.nouveauMdp = nouveauMdp;
    }

    public String getToken() {
        return token != null ? token.trim() : null;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email != null ? email.trim() : null;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNouveauMdp() {
        return nouveauMdp != null ? nouveauMdp.trim() : null;
    }

    public void setNouveauMdp(String nouveauMdp) {
        this.nouveauMdp = nouveauMdp;
    }
}
