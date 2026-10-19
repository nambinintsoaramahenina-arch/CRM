package com.example.crm.service;

import com.example.crm.entity.JournalActivite;
import com.example.crm.entity.User;
import com.example.crm.repository.JournalActiviteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service métier gérant la consultation et l'enregistrement du journal d'activité.
 * Connecté strictement à la base de données PostgreSQL via {@link JournalActiviteRepository}.
 */
@Service
public class JournalActiviteService {

    private final JournalActiviteRepository journalActiviteRepository;

    public JournalActiviteService(JournalActiviteRepository journalActiviteRepository) {
        this.journalActiviteRepository = journalActiviteRepository;
    }

    /**
     * Récupère la totalité de l'historique d'activité enregistré en base de données,
     * classé par date décroissante (les événements les plus récents en premier).
     *
     * @return Liste réelle des entités {@link JournalActivite} depuis PostgreSQL.
     */
    @Transactional(readOnly = true)
    public List<JournalActivite> obtenirTousLesJournaux() {
        return journalActiviteRepository.findAllByOrderByDateDesc();
    }

    /**
     * Récupère l'historique d'activité filtré pour un utilisateur donné.
     *
     * @param utilisateurId Identifiant unique de l'utilisateur
     * @return Liste ordonnée des activités réelles
     */
    @Transactional(readOnly = true)
    public List<JournalActivite> obtenirParUtilisateur(Long utilisateurId) {
        return journalActiviteRepository.findByUtilisateurIdOrderByDateDesc(utilisateurId);
    }

    /**
     * Méthode utilitaire permettant d'enregistrer une nouvelle entrée réelle dans PostgreSQL.
     *
     * @param utilisateur       Utilisateur auteur de l'action
     * @param action            Type d'action (CONNEXION, AJOUT, MODIFICATION, SUPPRESSION, etc.)
     * @param entiteConcernee   Nom de l'entité manipulée (Contact, Tache, etc.)
     * @param identifiantEntite ID de l'entité concernée
     * @param adresseIp         Adresse IP du client
     * @param details           Description ou détails textuels
     * @return L'entrée enregistrée en base
     */
    @Transactional
    public JournalActivite enregistrerActivite(User utilisateur,
                                             String action,
                                             String entiteConcernee,
                                             Long identifiantEntite,
                                             String adresseIp,
                                             String details) {
        JournalActivite journal = JournalActivite.builder()
                .utilisateur(utilisateur)
                .action(action)
                .entiteConcernee(entiteConcernee)
                .identifiantEntite(identifiantEntite)
                .date(LocalDateTime.now())
                .adresseIp(adresseIp)
                .details(details)
                .build();

        return journalActiviteRepository.save(journal);
    }
}
