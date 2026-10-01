package com.example.crm.Controller;

import com.example.crm.entity.Contact;
import com.example.crm.repository.ContactRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contacts")
@CrossOrigin(origins = "http://localhost:3000")
public class ContactController {

    @Autowired
    private ContactRepository contactRepository;

    @GetMapping
    public List<Contact> getAllContacts() {
        return contactRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contact> getContactById(@PathVariable Long id) {
        return contactRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Contact createContact(@Valid @RequestBody Contact contact) {
        return contactRepository.save(contact);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contact> updateContact(@PathVariable Long id, @Valid @RequestBody Contact contactDetails) {
        return contactRepository.findById(id).map(contact -> {
            contact.setNomComplet(contactDetails.getNomComplet());
            contact.setEntreprise(contactDetails.getEntreprise());
            contact.setEmail(contactDetails.getEmail());
            contact.setTelephone(contactDetails.getTelephone());
            contact.setFonction(contactDetails.getFonction());
            contact.setStatut(contactDetails.getStatut());
            Contact updatedContact = contactRepository.save(contact);
            return ResponseEntity.ok(updatedContact);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id) {
        if (contactRepository.existsById(id)) {
            contactRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}