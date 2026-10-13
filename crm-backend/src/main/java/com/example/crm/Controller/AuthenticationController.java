package com.example.crm.Controller;

import com.example.crm.dto.AuthResponse;
import com.example.crm.dto.ForgotPasswordRequest;
import com.example.crm.dto.LoginRequest;
import com.example.crm.dto.ResetPasswordRequest;
import com.example.crm.service.AuthenticationService;
import com.example.crm.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/v1/auth", "/api/auth"})
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final PasswordResetService passwordResetService;

    public AuthenticationController(AuthenticationService authenticationService,
                                    PasswordResetService passwordResetService) {
        this.authenticationService = authenticationService;
        this.passwordResetService  = passwordResetService;
    }

    /**
     * Connexion standard / admin
     */
    @PostMapping({"/login", "/admin/login"})
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authenticationService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Étape 1 — Demande de réinitialisation de mot de passe :
     * POST /api/auth/forgot-password ou /api/v1/auth/forgot-password
     * Body : { "email": "user@crm.com" }
     *
     * Génère un token sécurisé unique (UUID), définit sa validité à 30 min,
     * et expédie de manière asynchrone un e-mail HTML avec le lien cliquable vers le frontend.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        Map<String, Object> result = passwordResetService.processForgotPassword(request);
        return ResponseEntity.ok(result);
    }

    /**
     * Étape 2 — Réinitialisation effective du mot de passe avec token reçu par e-mail :
     * POST /api/auth/reset-password ou /api/v1/auth/reset-password
     * Body : { "token": "...", "nouveauMdp": "..." }
     *
     * Valide le token, son délai d'expiration, chiffre le mot de passe avec BCrypt
     * et invalide le token.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        Map<String, Object> result = passwordResetService.processResetPassword(request);
        return ResponseEntity.ok(result);
    }
}