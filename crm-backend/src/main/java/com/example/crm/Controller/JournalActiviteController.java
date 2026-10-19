package com.example.crm.Controller;

import com.example.crm.entity.JournalActivite;
import com.example.crm.service.JournalActiviteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST sécurisé pour la consultation de l'historique et du journal d'activité.
 * Les requêtes sont protégées par le filtre JWT (défini dans {@link com.example.crm.security.SecurityConfig}).
 * Les données proviennent exclusivement et directement de PostgreSQL.
 */
@RestController
@RequestMapping({"/api/historique", "/api/activity-logs"})
@CrossOrigin(origins = "*")
@Tag(name = "Historique & Journal d'Activité", description = "API de consultation des journaux d'activité réels de la base PostgreSQL")
public class JournalActiviteController {

    private final JournalActiviteService journalActiviteService;

    public JournalActiviteController(JournalActiviteService journalActiviteService) {
        this.journalActiviteService = journalActiviteService;
    }

    /**
     * Endpoint GET : /api/historique ou /api/activity-logs
     * Récupère la liste réelle de tous les journaux d'activité enregistrés en base de données,
     * classés par date décroissante.
     * Supporte un filtre optionnel par utilisateur (utilisateurId).
     *
     * @param utilisateurId (Optionnel) Filtrer par l'identifiant de l'utilisateur
     * @return 200 OK avec la liste des entrées réelles de PostgreSQL
     */
    @GetMapping
    @Operation(summary = "Lister l'historique d'activité", description = "Récupère les journaux d'activité réels depuis la table PostgreSQL journal_activite")
    public ResponseEntity<List<JournalActivite>> getHistorique(
            @RequestParam(required = false) Long utilisateurId) {

        List<JournalActivite> journaux;
        if (utilisateurId != null) {
            journaux = journalActiviteService.obtenirParUtilisateur(utilisateurId);
        } else {
            journaux = journalActiviteService.obtenirTousLesJournaux();
        }

        return ResponseEntity.ok(journaux);
    }
}
