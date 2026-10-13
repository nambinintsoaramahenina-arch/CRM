package com.example.crm.Controller;

import com.example.crm.dto.PasswordRequestDTO;
import com.example.crm.service.PasswordRequestAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST réservé aux administrateurs pour gérer les demandes
 * de réinitialisation de mot de passe.
 *
 * Routes exposées :
 *   GET  /api/admin/password-requests              → liste toutes les demandes
 *   GET  /api/admin/password-requests/pending      → liste demandes PENDING seulement
 *   GET  /api/admin/password-requests/count        → nombre de demandes PENDING
 *   POST /api/admin/password-requests/{id}/approve → approuver + envoyer email
 *   POST /api/admin/password-requests/{id}/reject  → rejeter la demande
 */
@RestController
@RequestMapping("/api/admin/password-requests")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminPasswordController {

    private final PasswordRequestAdminService adminService;

    public AdminPasswordController(PasswordRequestAdminService adminService) {
        this.adminService = adminService;
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
}
