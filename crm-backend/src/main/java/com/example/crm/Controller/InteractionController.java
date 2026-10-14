package com.example.crm.Controller;

import com.example.crm.dto.InteractionRequestDTO;
import com.example.crm.dto.InteractionResponseDTO;
import com.example.crm.service.InteractionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour la gestion des interactions CRM.
 *
 * <p>Tous les endpoints sont protégés par JWT (configuré globalement dans
 * {@link com.example.crm.security.SecurityConfig}). La suppression est
 * réservée aux rôles ADMIN et MANAGER.</p>
 *
 * <p>Base URL : {@code /api/interactions}</p>
 */
@RestController
@RequestMapping("/api/interactions")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;

    // =========================================================================
    // GET /api/interactions — Lister les interactions (avec filtre optionnel contactId)
    // =========================================================================

    /**
     * Retourne la liste complète de toutes les interactions enregistrées,
     * ou filtrées par contact si le paramètre contactId est fourni.
     *
     * @param contactId (optionnel) identifiant du contact
     * @return {@code 200 OK} avec la liste des interactions
     */
    @GetMapping
    public ResponseEntity<List<InteractionResponseDTO>> getAllInteractions(
            @RequestParam(required = false) Long contactId) {
        List<InteractionResponseDTO> interactions;
        if (contactId != null) {
            interactions = interactionService.obtenirInteractionsParContact(contactId);
        } else {
            interactions = interactionService.obtenirToutesLesInteractions();
        }
        return ResponseEntity.ok(interactions);
    }

    /**
     * GET /api/interactions/contact/{contactId} — Lister les interactions d'un contact
     *
     * @param contactId identifiant du contact
     * @return {@code 200 OK} avec la liste des interactions du contact
     */
    @GetMapping("/contact/{contactId}")
    public ResponseEntity<List<InteractionResponseDTO>> getInteractionsByContact(
            @PathVariable Long contactId) {
        List<InteractionResponseDTO> interactions = interactionService.obtenirInteractionsParContact(contactId);
        return ResponseEntity.ok(interactions);
    }

    // =========================================================================
    // GET /api/interactions/{id} — Consulter une interaction par ID
    // =========================================================================

    /**
     * Retourne le détail d'une interaction identifiée par son ID.
     *
     * @param id l'identifiant de l'interaction
     * @return {@code 200 OK} avec le détail, ou {@code 400 Bad Request} si introuvable
     */
    @GetMapping("/{id}")
    public ResponseEntity<InteractionResponseDTO> getInteractionById(@PathVariable Long id) {
        InteractionResponseDTO dto = interactionService.obtenirInteractionParId(id);
        return ResponseEntity.ok(dto);
    }

    // =========================================================================
    // POST /api/interactions — Créer une nouvelle interaction
    // =========================================================================

    /**
     * Crée une nouvelle interaction. L'utilisateur connecté (extrait du JWT)
     * est automatiquement défini comme responsable de l'interaction.
     *
     * @param requestDTO les données validées de l'interaction à créer
     * @return {@code 201 Created} avec le DTO de l'interaction créée
     */
    @PostMapping
    public ResponseEntity<InteractionResponseDTO> createInteraction(
            @Valid @RequestBody InteractionRequestDTO requestDTO) {
        InteractionResponseDTO created = interactionService.creerInteraction(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // =========================================================================
    // PUT /api/interactions/{id} — Modifier une interaction existante
    // =========================================================================

    /**
     * Met à jour une interaction existante identifiée par son ID.
     *
     * @param id         l'identifiant de l'interaction à modifier
     * @param requestDTO les nouvelles données validées
     * @return {@code 200 OK} avec le DTO mis à jour
     */
    @PutMapping("/{id}")
    public ResponseEntity<InteractionResponseDTO> updateInteraction(
            @PathVariable Long id,
            @Valid @RequestBody InteractionRequestDTO requestDTO) {
        InteractionResponseDTO updated = interactionService.modifierInteraction(id, requestDTO);
        return ResponseEntity.ok(updated);
    }

    // =========================================================================
    // DELETE /api/interactions/{id} — Supprimer une interaction
    // =========================================================================

    /**
     * Supprime une interaction par son ID.
     * Accès restreint aux rôles ADMIN et MANAGER.
     *
     * @param id l'identifiant de l'interaction à supprimer
     * @return {@code 204 No Content} en cas de succès
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteInteraction(@PathVariable Long id) {
        interactionService.supprimerInteraction(id);
        return ResponseEntity.noContent().build();
    }
}
