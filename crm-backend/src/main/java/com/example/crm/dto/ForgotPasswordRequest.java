package com.example.crm.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO de la demande de réinitialisation de mot de passe.
 * Le champ "email" accepte indifféremment une adresse e-mail ou un matricule/login.
 */
public class ForgotPasswordRequest {

    @NotBlank(message = "L'e-mail ou le matricule est obligatoire.")
    @JsonAlias({"mail", "userEmail", "login", "matricule", "identifiant"})
    private String email;

    public ForgotPasswordRequest() {}

    public ForgotPasswordRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email != null ? email.trim() : null;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
