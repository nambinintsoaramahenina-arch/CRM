package com.example.crm.Controller;

import com.example.crm.dto.PasswordRequestDTO;
import com.example.crm.service.PasswordRequestAdminService;
import com.example.crm.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST réservé aux administrateurs pour gérer les demandes
 * de réinitialisation de mot de passe.
 */
@RestController
@RequestMapping("/api/admin/password-requests")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminPasswordController {

    private final PasswordRequestAdminService adminService;
    private final PasswordResetService passwordResetService;

    public AdminPasswordController(PasswordRequestAdminService adminService,
                                   @Autowired(required = false) PasswordResetService passwordResetService) {
        this.adminService         = adminService;
        this.passwordResetService = passwordResetService;
    }

    /**
     * Retourne toutes les demandes (PENDING + APPROVED + REJECTED), triées par date décroissante.
     */
    @GetMapping
    public ResponseEntity<List<PasswordRequestDTO>> getAllRequests() {
        return ResponseEntity.ok(adminService.obtenirToutesDemandes());
    }

    /**
     * Retourne uniquement les demandes en attente (statut PENDING).
     */
    @GetMapping("/pending")
    public ResponseEntity<List<PasswordRequestDTO>> getPendingRequests() {
        return ResponseEntity.ok(adminService.obtenirDemandesPending());
    }

    /**
     * Retourne le nombre de demandes en attente (pour badge dans le dashboard).
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> countPending() {
        long count = adminService.compterDemandesPending();
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Approuve une demande PENDING :
     * - Génère un mot de passe temporaire sécurisé (ou utilise celui fourni par l'admin)
     * - Met à jour l'utilisateur en base (BCrypt)
     * - Envoie l'email à l'utilisateur via JavaMailSender
     * - Marque la demande comme APPROVED
     *
     * Body optionnel : { "nouveauMdp": "optionnel", "commentaire": "optionnel" }
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String commentaire = (body != null) ? body.get("commentaire") : null;
        String nouveauMdp = null;
        if (body != null) {
            nouveauMdp = body.getOrDefault("nouveauMdp", body.get("password"));
        }
        Map<String, Object> result = adminService.approuverDemande(id, nouveauMdp, commentaire);
        return ResponseEntity.ok(result);
    }

    /**
     * Rejette une demande PENDING sans envoyer de mot de passe.
     *
     * Body : { "commentaire": "Raison du rejet" }
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String commentaire = (body != null) ? body.get("commentaire") : null;
        Map<String, Object> result = adminService.rejeterDemande(id, commentaire);
        return ResponseEntity.ok(result);
    }

    /**
     * Étape 3 — Réinitialise le mot de passe d'un utilisateur par son ID (génération automatique ou saisie).
     * POST /api/admin/password-requests/users/{id}/reset-password
     *
     * Body optionnel : { "nouveauMdp": "...", "commentaire": "..." }
     */
    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<Map<String, Object>> resetPasswordByUserId(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String commentaire = (body != null) ? body.get("commentaire") : null;
        String nouveauMdp = null;
        if (body != null) {
            nouveauMdp = body.getOrDefault("nouveauMdp", body.get("password"));
        }
        Map<String, Object> result = adminService.reinitialiserMotDePasseParUserId(id, nouveauMdp, commentaire);
        return ResponseEntity.ok(result);
    }

    /**
     * Valide la réinitialisation et génère le mot de passe :
     * POST /api/admin/password-requests/approve-reset/{identifier}
     */
    @PostMapping({"/approve-reset/{identifier}", "/approve-reset/user/{identifier}"})
    public ResponseEntity<Map<String, Object>> approveReset(
            @PathVariable String identifier,
            @RequestBody(required = false) Map<String, String> body) {
        if (passwordResetService != null) {
            String customMdp = body != null ? body.getOrDefault("nouveauMdp", body.get("password")) : null;
            String commentaire = body != null ? body.get("commentaire") : null;
            return ResponseEntity.ok(passwordResetService.approveResetByAdmin(identifier, customMdp, commentaire));
        }
        return ResponseEntity.notFound().build();
    }
}
