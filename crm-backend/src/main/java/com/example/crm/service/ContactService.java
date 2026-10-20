package com.example.crm.service;

import com.example.crm.entity.Contact;
import com.example.crm.repository.ContactRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service métier pour la gestion des contacts CRM avec traçabilité dans le journal d'activité.
 */
@Service
@Transactional
public class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);

    private final ContactRepository contactRepository;
    private final JournalActiviteService journalActiviteService;

    public ContactService(ContactRepository contactRepository,
                          @org.springframework.beans.factory.annotation.Autowired(required = false) JournalActiviteService journalActiviteService) {
        this.contactRepository = contactRepository;
        this.journalActiviteService = journalActiviteService;
    }

    @Transactional(readOnly = true)
    public List<Contact> getAllContacts() {
        return contactRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Contact> getContactById(Long id) {
        return contactRepository.findById(id);
    }

    public Contact createContact(Contact contact) {
        Contact saved = contactRepository.save(contact);
        log.info("Contact créé avec succès, ID={}", saved.getId());

        if (journalActiviteService != null) {
            try {
                String auteur = journalActiviteService.getNomAuteurAction();
                String details = String.format("%s a créé le contact '%s' (Entreprise: %s, Email: %s)",
                        auteur,
                        saved.getNomComplet(),
                        saved.getEntreprise() != null ? saved.getEntreprise() : "Particulier",
                        saved.getEmail() != null ? saved.getEmail() : "N/A");

                journalActiviteService.logAction("CREATE", "Contact", saved.getId(), details);
            } catch (Exception e) {
                log.warn("[CONTACT CREATE LOG] Échec journal : {}", e.getMessage());
            }
        }

        return saved;
    }

    public Optional<Contact> updateContact(Long id, Contact contactDetails) {
        return contactRepository.findById(id).map(contact -> {
            contact.setNomComplet(contactDetails.getNomComplet());
            contact.setEntreprise(contactDetails.getEntreprise());
            contact.setEmail(contactDetails.getEmail());
            contact.setTelephone(contactDetails.getTelephone());
            contact.setFonction(contactDetails.getFonction());
            contact.setStatut(contactDetails.getStatut());

            Contact updated = contactRepository.save(contact);
            log.info("Contact ID={} mis à jour avec succès", updated.getId());

            if (journalActiviteService != null) {
                try {
                    String auteur = journalActiviteService.getNomAuteurAction();
                    String details = String.format("%s a mis à jour les coordonnées du contact '%s' (Entreprise: %s, Statut: %s)",
                            auteur,
                            updated.getNomComplet(),
                            updated.getEntreprise() != null ? updated.getEntreprise() : "N/A",
                            updated.getStatut() != null ? updated.getStatut() : "N/A");

                    journalActiviteService.logAction("UPDATE", "Contact", updated.getId(), details);
                } catch (Exception e) {
                    log.warn("[CONTACT UPDATE LOG] Échec journal : {}", e.getMessage());
                }
            }

            return updated;
        });
    }

    public boolean deleteContact(Long id) {
        return contactRepository.findById(id).map(contact -> {
            String nom = contact.getNomComplet();
            contactRepository.deleteById(id);
            log.info("Contact ID={} supprimé avec succès", id);

            if (journalActiviteService != null) {
                try {
                    String auteur = journalActiviteService.getNomAuteurAction();
                    String details = String.format("%s a supprimé le contact '%s' (ID: #%d)", auteur, nom, id);
                    journalActiviteService.logAction("DELETE", "Contact", id, details);
                } catch (Exception e) {
                    log.warn("[CONTACT DELETE LOG] Échec journal : {}", e.getMessage());
                }
            }

            return true;
        }).orElse(false);
    }
}
