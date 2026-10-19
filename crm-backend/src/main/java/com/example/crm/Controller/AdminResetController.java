package com.example.crm.Controller;

import com.example.crm.service.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Contrôleur administrateur pour la validation de réinitialisation de mot de passe.
 * Expose les endpoints :
 *   POST /api/admin/approve-reset/{userId}
 *   POST /api/admin/approve-reset/matricule/{matricule}
 *   POST /api/admin/approve-reset/user/{userId}
 *   POST /api/admin/approve-reset/notification/{notificationId}
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminResetController {

    private final PasswordResetService passwordResetService;

    public AdminResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    /**
     * Valide la réinitialisation par ID utilisateur ou par matricule :
     * POST /api/admin/approve-reset/{identifier}
     *
     * Body optionnel : { "nouveauMdp": "...", "commentaire": "..." }
     */
    @PostMapping({"/approve-reset/{identifier}", "/approve-reset/user/{identifier}"})
    public ResponseEntity<Map<String, Object>> approveReset(
            @PathVariable String identifier,
            @RequestBody(required = false) Map<String, String> body) {
        String customMdp = body != null ? body.getOrDefault("nouveauMdp", body.get("password")) : null;
        String commentaire = body != null ? body.get("commentaire") : null;
        Map<String, Object> result = passwordResetService.approveResetByAdmin(identifier, customMdp, commentaire);
        return ResponseEntity.ok(result);
    }

    /**
     * Valide la réinitialisation explicitement par matricule :
     * POST /api/admin/approve-reset/matricule/{matricule}
     */
    @PostMapping("/approve-reset/matricule/{matricule}")
    public ResponseEntity<Map<String, Object>> approveResetByMatricule(
            @PathVariable String matricule,
            @RequestBody(required = false) Map<String, String> body) {
        String customMdp = body != null ? body.getOrDefault("nouveauMdp", body.get("password")) : null;
        String commentaire = body != null ? body.get("commentaire") : null;
        Map<String, Object> result = passwordResetService.approveResetByAdmin(matricule, customMdp, commentaire);
        return ResponseEntity.ok(result);
    }

    /**
     * Valide la réinitialisation directement à partir d'une notification du tableau de bord :
     * POST /api/admin/approve-reset/notification/{notificationId}
     */
    @PostMapping("/approve-reset/notification/{notificationId}")
    public ResponseEntity<Map<String, Object>> approveResetByNotification(
            @PathVariable Long notificationId,
            @RequestBody(required = false) Map<String, String> body) {
        String customMdp = body != null ? body.getOrDefault("nouveauMdp", body.get("password")) : null;
        String commentaire = body != null ? body.get("commentaire") : null;
        Map<String, Object> result = passwordResetService.approveResetByNotificationId(notificationId, customMdp, commentaire);
        return ResponseEntity.ok(result);
    }
}
