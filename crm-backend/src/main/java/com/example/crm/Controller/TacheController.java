package com.example.crm.Controller;

import com.example.crm.dto.TacheRequestDTO;
import com.example.crm.dto.TacheResponseDTO;
import com.example.crm.service.TacheService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour la gestion des tâches CRM.
 *
 * <p>Tous les endpoints sont protégés par JWT (configuré globalement dans
 * {@link com.example.crm.security.SecurityConfig}). La suppression est
 * réservée aux rôles ADMIN et MANAGER.</p>
 *
 * <p>Base URL : {@code /api/tasks}</p>
 */
@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TacheController {

    private final TacheService tacheService;

    // =========================================================================
    // GET /api/tasks — Lister toutes les tâches
    // =========================================================================

    /**
     * Retourne la liste complète de toutes les tâches enregistrées.
     * Supporte un filtrage optionnel par statut via le paramètre de requête.
     *
     * @param statut (optionnel) filtre sur le statut de la tâche
     * @return {@code 200 OK} avec la liste des tâches
     */
    @GetMapping
    public ResponseEntity<List<TacheResponseDTO>> getAllTaches(
            @RequestParam(required = false) String statut) {
        List<TacheResponseDTO> taches;
        if (statut != null && !statut.isBlank()) {
            taches = tacheService.obtenirTachesParStatut(statut);
        } else {
            taches = tacheService.obtenirToutesLesTaches();
        }
        return ResponseEntity.ok(taches);
    }

    // =========================================================================
    // GET /api/tasks/{id} — Consulter une tâche par ID
    // =========================================================================

    /**
     * Retourne le détail d'une tâche identifiée par son ID.
     *
     * @param id l'identifiant de la tâche
     * @return {@code 200 OK} avec le détail, ou {@code 400 Bad Request} si introuvable
     */
    @GetMapping("/{id}")
    public ResponseEntity<TacheResponseDTO> getTacheById(@PathVariable Long id) {
        TacheResponseDTO dto = tacheService.obtenirTacheParId(id);
        return ResponseEntity.ok(dto);
    }

    // =========================================================================
    // GET /api/tasks/utilisateur/{utilisateurId} — Tâches par utilisateur
    // =========================================================================

    /**
     * Retourne toutes les tâches assignées à un utilisateur donné.
     *
     * @param utilisateurId l'identifiant de l'utilisateur
     * @return {@code 200 OK} avec la liste des tâches de l'utilisateur
     */
    @GetMapping("/utilisateur/{utilisateurId}")
    public ResponseEntity<List<TacheResponseDTO>> getTachesByUtilisateur(
            @PathVariable Long utilisateurId) {
        List<TacheResponseDTO> taches = tacheService.obtenirTachesParUtilisateur(utilisateurId);
        return ResponseEntity.ok(taches);
    }

    // =========================================================================
    // POST /api/tasks — Créer une nouvelle tâche
    // =========================================================================

    /**
     * Crée une nouvelle tâche.
     *
     * @param requestDTO les données validées de la tâche à créer
     * @return {@code 201 Created} avec le DTO de la tâche créée
     */
    @PostMapping
    public ResponseEntity<TacheResponseDTO> createTache(
            @Valid @RequestBody TacheRequestDTO requestDTO) {
        TacheResponseDTO created = tacheService.creerTache(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // =========================================================================
    // PUT /api/tasks/{id} — Modifier une tâche existante
    // =========================================================================

    /**
     * Met à jour une tâche existante identifiée par son ID.
     *
     * @param id         l'identifiant de la tâche à modifier
     * @param requestDTO les nouvelles données validées
     * @return {@code 200 OK} avec le DTO mis à jour
     */
    @PutMapping("/{id}")
    public ResponseEntity<TacheResponseDTO> updateTache(
            @PathVariable Long id,
            @Valid @RequestBody TacheRequestDTO requestDTO) {
        TacheResponseDTO updated = tacheService.modifierTache(id, requestDTO);
        return ResponseEntity.ok(updated);
    }

    // =========================================================================
    // PATCH /api/tasks/{id}/statut — Changer uniquement le statut
    // =========================================================================

    /**
     * Met à jour uniquement le statut d'une tâche (opération partielle).
     *
     * <p>Corps de requête attendu : {@code {"statut": "EN_COURS"}}</p>
     *
     * @param id   l'identifiant de la tâche
     * @param body map contenant la clé {@code "statut"} avec la nouvelle valeur
     * @return {@code 200 OK} avec le DTO mis à jour
     */
    @PatchMapping("/{id}/statut")
    public ResponseEntity<TacheResponseDTO> changerStatut(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String nouveauStatut = body.get("statut");
        if (nouveauStatut == null || nouveauStatut.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        TacheResponseDTO updated = tacheService.changerStatut(id, nouveauStatut);
        return ResponseEntity.ok(updated);
    }

    // =========================================================================
    // DELETE /api/tasks/{id} — Supprimer une tâche
    // =========================================================================

    /**
     * Supprime une tâche par son ID.
     * Accès restreint aux rôles ADMIN et MANAGER.
     *
     * @param id l'identifiant de la tâche à supprimer
     * @return {@code 204 No Content} en cas de succès
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteTache(@PathVariable Long id) {
        tacheService.supprimerTache(id);
        return ResponseEntity.noContent().build();
    }
}
