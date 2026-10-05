package com.example.crm.entity;

/**
 * Enumération des types de tâches disponibles dans le CRM.
 */
public enum TypeTache {
    /** Appel téléphonique à effectuer. */
    APPEL,
    /** Email à envoyer ou à traiter. */
    EMAIL,
    /** Réunion à organiser ou à tenir. */
    REUNION,
    /** Rendez-vous physique ou en ligne. */
    RENDEZ_VOUS,
    /** Suivi d'un contact ou d'une opportunité. */
    SUIVI,
    /** Relance d'un prospect ou d'un client. */
    RELANCE,
    /** Autre type de tâche non catégorisé. */
    AUTRE
}
