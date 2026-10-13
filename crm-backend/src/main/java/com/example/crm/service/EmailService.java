package com.example.crm.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.time.LocalDate;

/**
 * Service centralisé pour l'expédition d'e-mails réels (SMTP Gmail, JavaMailSender).
 * Conçu pour être 100% asynchrone (@Async) et résilient :
 * - Aucune requête HTTP n'est bloquée par les échanges SMTP
 * - Les timeouts ou pannes réseau sont interceptés sans faire planter l'application
 * - Les logs fournissent un diagnostic clair en cas d'erreur de configuration
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${app.mail.from-address:${spring.mail.username:}}")
    private String fromAddress;

    @Value("${app.mail.from-name:SPAT CRM — Support Informatique}")
    private String fromName;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public String getFrontendUrl() {
        return (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl.replaceAll("/+$", "") : "http://localhost:3000";
    }

    /**
     * Envoie de manière asynchrone un e-mail HTML contenant le lien de réinitialisation
     * avec token sécurisé cliquable vers le frontend Next.js.
     *
     * @param toEmail          Adresse e-mail réelle du destinataire
     * @param nomComplet       Nom de l'utilisateur (optionnel)
     * @param resetLink        Lien complet incluant le token vers le frontend
     * @param expirationMinutes Durée de validité du token en minutes
     */
    @Async("mailTaskExecutor")
    public void envoyerLienReinitialisation(String toEmail, String nomComplet, String resetLink, int expirationMinutes) {
        if (!validerAdresseEmail(toEmail)) {
            return;
        }

        log.info("[MAIL] Expédition asynchrone du lien de réinitialisation vers : {}", toEmail);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            configurerExpediteur(helper);
            helper.setTo(toEmail.trim());
            helper.setSubject("🔐 Réinitialisation de votre mot de passe — SPAT CRM");

            String prenom = extrairePrenom(nomComplet);
            int annee = LocalDate.now().getYear();

            String htmlBody =
                "<!DOCTYPE html><html lang='fr'><head><meta charset='UTF-8'/></head>" +
                "<body style='margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;'>" +
                "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f1f5f9;padding:40px 0;'>" +
                "<tr><td align='center'>" +
                "<table width='580' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 28px rgba(0,0,0,0.08);'>" +

                // En-tête bleu/cyan dégradé
                "<tr><td style='background:linear-gradient(135deg,#1d4ed8,#0891b2,#0d9488);padding:36px 40px;text-align:center;'>" +
                "<h1 style='margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.02em;'>🔐 Réinitialisation de mot de passe</h1>" +
                "<p style='margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:500;'>" +
                "Société du Port à gestion Autonome de Toamasina (SPAT CRM)</p></td></tr>" +

                // Corps du message
                "<tr><td style='padding:36px 40px;'>" +
                "<p style='margin:0 0 16px;color:#0f172a;font-size:15px;font-weight:700;'>Bonjour " + prenom + ",</p>" +
                "<p style='margin:0 0 22px;color:#475569;font-size:14px;line-height:1.6;'>" +
                "Une demande de réinitialisation de mot de passe a été initiée pour votre compte sur la plateforme SPAT CRM. " +
                "Cliquez sur le bouton ci-dessous pour définir en toute sécurité un nouveau mot de passe :</p>" +

                // Bouton cliquable
                "<table cellpadding='0' cellspacing='0' width='100%' style='margin:26px 0;'>" +
                "<tr><td align='center'>" +
                "<a href='" + resetLink + "' style='display:inline-block;padding:14px 34px;background:linear-gradient(135deg,#1d4ed8,#0891b2);color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;box-shadow:0 4px 14px rgba(8,145,178,0.3);'>" +
                "Réinitialiser mon mot de passe &rarr;</a>" +
                "</td></tr></table>" +

                // Avertissement d'expiration
                "<div style='background:#fef3c7;border:1px solid #fbbf24;border-radius:10px;padding:14px 18px;margin-bottom:22px;'>" +
                "<p style='margin:0;color:#92400e;font-size:12px;font-weight:600;line-height:1.5;'>" +
                "⏱ <strong>Validité :</strong> Ce lien expirera dans <strong>" + expirationMinutes + " minutes</strong>. " +
                "Passé ce délai, il vous faudra soumettre une nouvelle demande." +
                "</p></div>" +

                // Lien direct de secours
                "<div style='background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;margin-bottom:20px;'>" +
                "<p style='margin:0 0 6px;color:#64748b;font-size:12px;'>Si le bouton ne répond pas, copiez ce lien directement :</p>" +
                "<p style='margin:0;word-break:break-all;'><a href='" + resetLink + "' style='color:#0891b2;font-size:12px;font-weight:600;text-decoration:underline;'>" + resetLink + "</a></p>" +
                "</div>" +

                // Avertissement de sécurité
                "<div style='background:#f0f9ff;border-radius:10px;padding:12px 16px;'>" +
                "<p style='margin:0;color:#0369a1;font-size:12px;line-height:1.5;'>" +
                "🔒 <strong>Vous n'êtes pas à l'origine de cette demande ?</strong><br/>" +
                "Ignorez cet e-mail. Votre mot de passe actuel demeure strictement inchangé." +
                "</p></div>" +
                "</td></tr>" +

                // Pied de page
                "<tr><td style='background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;'>" +
                "<p style='margin:0;color:#94a3b8;font-size:11px;line-height:1.6;'>" +
                "&copy; " + annee + " SPAT CRM — Direction des Systèmes d'Information<br/>" +
                "Cet e-mail est généré automatiquement par la plateforme, merci de ne pas y répondre." +
                "</p></td></tr>" +

                "</table></td></tr></table></body></html>";

            helper.setText(htmlBody, true);
            mailSender.send(message);

            log.info("[MAIL SUCCESS] E-mail avec lien de réinitialisation envoyé avec succès à : {}", toEmail);

        } catch (Exception ex) {
            traiterErreurEnvoi("Lien de réinitialisation", toEmail, ex);
        }
    }

    /**
     * Envoie de manière asynchrone le mot de passe temporaire généré par l'administrateur
     * directement à l'adresse e-mail réelle de l'utilisateur, avec optionnellement un lien
     * de réinitialisation directe basé sur un token.
     *
     * @param toEmail       Adresse e-mail réelle du destinataire
     * @param nomComplet    Nom de l'utilisateur
     * @param mdpTemporaire Mot de passe temporaire (en clair pour l'utilisateur, hashé en BDD)
     * @param resetToken    Token de réinitialisation optionnel (permet à l'utilisateur de définir son mdp via lien)
     */
    @Async("mailTaskExecutor")
    public void envoyerMotDePasseTemporaire(String toEmail, String nomComplet, String mdpTemporaire, String resetToken) {
        if (!validerAdresseEmail(toEmail)) {
            return;
        }

        log.info("[MAIL] Expédition asynchrone du mot de passe temporaire vers : {}", toEmail);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            configurerExpediteur(helper);
            helper.setTo(toEmail.trim());
            helper.setSubject(" SPAT CRM — Nouveau mot de passe");

            String prenom = extrairePrenom(nomComplet);
            int annee = LocalDate.now().getYear();
            String loginUrl = frontendUrl + "/login";
            String resetLink = (resetToken != null && !resetToken.isBlank())
                    ? frontendUrl + "/reset-password?token=" + resetToken
                    : null;

            String lienResetSection = "";
            if (resetLink != null) {
                lienResetSection =
                    "<div style='background:#f8fafc;border:1px solid #cbd5e1;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;'>" +
                    "<p style='margin:0 0 12px;color:#334155;font-size:13px;font-weight:600;'>Vous pouvez également choisir votre propre mot de passe dès maintenant :</p>" +
                    "<a href='" + resetLink + "' style='display:inline-block;padding:11px 26px;background:#0f766e;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;border-radius:8px;box-shadow:0 2px 8px rgba(15,118,110,0.25);'>" +
                    "Choisir mon propre mot de passe &rarr;</a>" +
                    "</div>";
            }

            String htmlBody =
                "<!DOCTYPE html><html lang='fr'><head><meta charset='UTF-8'/></head>" +
                "<body style='margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;'>" +
                "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f1f5f9;padding:40px 0;'>" +
                "<tr><td align='center'>" +
                "<table width='580' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 28px rgba(0,0,0,0.08);'>" +

                // En-tête
                "<tr><td style='background:linear-gradient(135deg,#0284c7,#0d9488);padding:32px 40px;text-align:center;'>" +
                "<h1 style='margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.02em;'>🔐 Nouveau mot de passe</h1>" +
                "<p style='margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:500;'>" +
                "Société du Port à gestion Autonome de Toamasina (SPAT CRM)</p></td></tr>" +

                // Corps
                "<tr><td style='padding:36px 40px;'>" +
                "<p style='margin:0 0 16px;color:#0f172a;font-size:15px;font-weight:700;'>Bonjour " + prenom + ",</p>" +
                "<p style='margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;'>" +
                "L'administrateur a réinitialisé votre mot de passe pour votre compte sur la plateforme SPAT CRM. " +
                "Voici votre mot de passe temporaire pour vous connecter :</p>" +

                // Bloc affichage du mot de passe temporaire
                "<div style='background:#f0fdfa;border:2px dashed #0d9488;border-radius:12px;padding:24px;margin:24px 0;text-align:center;'>" +
                "<span style='display:block;color:#0f766e;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;'>Mot de passe temporaire</span>" +
                "<span style='display:inline-block;font-family:Consolas,Courier New,monospace;font-size:26px;font-weight:800;color:#0f172a;letter-spacing:0.18em;background:#ffffff;padding:10px 24px;border-radius:8px;border:1px solid #ccfbf1;box-shadow:inset 0 1px 3px rgba(0,0,0,0.05);'>" +
                mdpTemporaire + "</span>" +
                "</div>" +

                // Bouton de connexion directe
                "<table cellpadding='0' cellspacing='0' width='100%' style='margin-bottom:20px;'>" +
                "<tr><td align='center'>" +
                "<a href='" + loginUrl + "' style='display:inline-block;padding:13px 32px;background:linear-gradient(135deg,#0284c7,#0d9488);color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;'>" +
                "Se connecter au CRM &rarr;</a>" +
                "</td></tr></table>" +

                lienResetSection +

                // Avertissement sécurité
                "<div style='background:#fffbeb;border-left:4px solid #f59e0b;border-radius:8px;padding:14px 16px;margin-bottom:20px;'>" +
                "<p style='margin:0;color:#92400e;font-size:12px;font-weight:600;line-height:1.5;'>" +
                "⚠️ <strong>Important :</strong> Ce mot de passe est temporaire. Veuillez le modifier dès votre première connexion pour assurer la confidentialité de votre compte." +
                "</p></div>" +

                // Support
                "<div style='background:#f8fafc;border-radius:8px;padding:12px 16px;'>" +
                "<p style='margin:0;color:#64748b;font-size:12px;line-height:1.5;'>" +
                "Si vous n'avez pas sollicité ce changement, veuillez avertir sans délai l'administrateur informatique SPAT." +
                "</p></div>" +
                "</td></tr>" +

                // Pied de page
                "<tr><td style='background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;'>" +
                "<p style='margin:0;color:#94a3b8;font-size:11px;'>" +
                "&copy; " + annee + " SPAT CRM — Direction des Systèmes d'Information<br/>" +
                "Cet e-mail est généré automatiquement, merci de ne pas y répondre." +
                "</p></td></tr>" +

                "</table></td></tr></table></body></html>";

            helper.setText(htmlBody, true);
            mailSender.send(message);

            log.info("[MAIL SUCCESS] E-mail avec mot de passe envoyé avec succès à : {}", toEmail);

        } catch (Exception ex) {
            traiterErreurEnvoi("Mot de passe temporaire", toEmail, ex);
        }
    }

    /** Surcharge de compatibilité sans resetToken. */
    @Async("mailTaskExecutor")
    public void envoyerMotDePasseTemporaire(String toEmail, String nomComplet, String mdpTemporaire) {
        envoyerMotDePasseTemporaire(toEmail, nomComplet, mdpTemporaire, null);
    }

    /**
     * Envoie de manière asynchrone un e-mail HTML contenant le code de réinitialisation
     * généré par l'administrateur à l'adresse e-mail réelle de l'utilisateur.
     *
     * @param toEmail          Adresse e-mail réelle du destinataire
     * @param nomComplet       Nom de l'utilisateur (optionnel)
     * @param resetCode        Code de réinitialisation sécurisé (6 caractères)
     * @param expirationHeures Durée de validité du code en heures
     */
    @Async("mailTaskExecutor")
    public void envoyerCodeReinitialisation(String toEmail, String nomComplet, String resetCode, int expirationHeures) {
        if (!validerAdresseEmail(toEmail)) {
            return;
        }

        log.info("[MAIL] Expédition asynchrone du code de réinitialisation vers : {}", toEmail);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            configurerExpediteur(helper);
            helper.setTo(toEmail.trim());
            helper.setSubject("🔐 Code de réinitialisation de mot de passe — SPAT CRM");

            String prenom = extrairePrenom(nomComplet);
            int annee = LocalDate.now().getYear();
            String resetPageUrl = getFrontendUrl() + "/forgot-password?token=" + resetCode;

            String htmlBody =
                "<!DOCTYPE html><html lang='fr'><head><meta charset='UTF-8'/></head>" +
                "<body style='margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;'>" +
                "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f1f5f9;padding:40px 0;'>" +
                "<tr><td align='center'>" +
                "<table width='580' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 28px rgba(0,0,0,0.08);'>" +

                // En-tête dégradé
                "<tr><td style='background:linear-gradient(135deg,#1d4ed8,#0891b2,#0d9488);padding:36px 40px;text-align:center;'>" +
                "<h1 style='margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.02em;'>🔐 Code de réinitialisation</h1>" +
                "<p style='margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:500;'>" +
                "Société du Port à gestion Autonome de Toamasina (SPAT CRM)</p></td></tr>" +

                // Corps du message
                "<tr><td style='padding:36px 40px;'>" +
                "<p style='margin:0 0 16px;color:#0f172a;font-size:15px;font-weight:700;'>Bonjour " + prenom + ",</p>" +
                "<p style='margin:0 0 22px;color:#475569;font-size:14px;line-height:1.6;'>" +
                "Votre demande de réinitialisation de mot de passe a été <strong style='color:#0d9488;'>approuvée par l'administrateur</strong>. " +
                "Utilisez le code ci-dessous pour définir votre nouveau mot de passe :</p>" +

                // Bloc code
                "<div style='background:#f0fdfa;border:2px dashed #0d9488;border-radius:12px;padding:24px;margin:24px 0;text-align:center;'>" +
                "<span style='display:block;color:#0f766e;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;'>Votre code de réinitialisation</span>" +
                "<span style='display:inline-block;font-family:Consolas,Courier New,monospace;font-size:32px;font-weight:800;color:#0f172a;letter-spacing:0.25em;background:#ffffff;padding:12px 28px;border-radius:8px;border:1px solid #ccfbf1;box-shadow:inset 0 1px 3px rgba(0,0,0,0.05);'>" +
                resetCode + "</span>" +
                "</div>" +

                // Bouton vers la page de réinitialisation
                "<table cellpadding='0' cellspacing='0' width='100%' style='margin:26px 0;'>" +
                "<tr><td align='center'>" +
                "<a href='" + resetPageUrl + "' style='display:inline-block;padding:14px 34px;background:linear-gradient(135deg,#1d4ed8,#0891b2);color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;box-shadow:0 4px 14px rgba(8,145,178,0.3);'>" +
                "Réinitialiser mon mot de passe &rarr;</a>" +
                "</td></tr></table>" +

                // Avertissement d'expiration
                "<div style='background:#fef3c7;border:1px solid #fbbf24;border-radius:10px;padding:14px 18px;margin-bottom:22px;'>" +
                "<p style='margin:0;color:#92400e;font-size:12px;font-weight:600;line-height:1.5;'>" +
                "⏱ <strong>Validité :</strong> Ce code expirera dans <strong>" + expirationHeures + " heures</strong>. " +
                "Passé ce délai, il vous faudra soumettre une nouvelle demande." +
                "</p></div>" +

                // Instructions
                "<div style='background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;margin-bottom:20px;'>" +
                "<p style='margin:0 0 6px;color:#334155;font-size:12px;font-weight:700;'>Comment procéder :</p>" +
                "<ol style='margin:0;padding-left:18px;color:#64748b;font-size:12px;line-height:1.8;'>" +
                "<li>Rendez-vous sur la <a href='" + resetPageUrl + "' style='color:#0891b2;font-weight:600;'>page de réinitialisation</a></li>" +
                "<li>Saisissez le code ci-dessus dans le champ prévu</li>" +
                "<li>Choisissez votre nouveau mot de passe (min. 6 caractères)</li>" +
                "</ol></div>" +

                // Avertissement de sécurité
                "<div style='background:#f0f9ff;border-radius:10px;padding:12px 16px;'>" +
                "<p style='margin:0;color:#0369a1;font-size:12px;line-height:1.5;'>" +
                "🔒 <strong>Vous n'êtes pas à l'origine de cette demande ?</strong><br/>" +
                "Ignorez cet e-mail. Votre mot de passe actuel demeure strictement inchangé." +
                "</p></div>" +
                "</td></tr>" +

                // Pied de page
                "<tr><td style='background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;'>" +
                "<p style='margin:0;color:#94a3b8;font-size:11px;line-height:1.6;'>" +
                "&copy; " + annee + " SPAT CRM — Direction des Systèmes d'Information<br/>" +
                "Cet e-mail est généré automatiquement par la plateforme, merci de ne pas y répondre." +
                "</p></td></tr>" +

                "</table></td></tr></table></body></html>";

            helper.setText(htmlBody, true);
            mailSender.send(message);

            log.info("[MAIL SUCCESS] E-mail avec code de réinitialisation envoyé avec succès à : {}", toEmail);

        } catch (Exception ex) {
            traiterErreurEnvoi("Code de réinitialisation", toEmail, ex);
        }
    }

    /**
     * Envoie une alerte asynchrone à l'administrateur lorsqu'une nouvelle demande de réinitialisation survient.
     */
    @Async("mailTaskExecutor")
    public void notifierAdminNouvelleDemande(String login, String email, String nomComplet) {
        if (smtpUsername == null || smtpUsername.isBlank() || smtpUsername.contains("votre-email")) {
            log.info("[ADMIN NOTIF] Demande enregistrée pour {} ({})", login, email);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            configurerExpediteur(helper);
            helper.setTo(fromAddress);
            helper.setSubject("🔔 [SPAT CRM] Nouvelle demande de réinitialisation de mot de passe");

            String html =
                "<div style='font-family:Arial,sans-serif;padding:20px;background:#f8fafc;'>" +
                "<h3>🔔 Nouvelle demande de réinitialisation</h3>" +
                "<p>Un utilisateur sollicite une réinitialisation de son mot de passe :</p>" +
                "<ul>" +
                "<li><strong>Collaborateur :</strong> " + (nomComplet != null ? nomComplet : "N/A") + "</li>" +
                "<li><strong>Matricule / Login :</strong> " + login + "</li>" +
                "<li><strong>Email :</strong> " + email + "</li>" +
                "</ul>" +
                "<p><a href='" + frontendUrl + "/admin/password-requests'>Accéder au tableau de bord des demandes</a></p>" +
                "</div>";

            helper.setText(html, true);
            mailSender.send(message);
            log.info("[ADMIN NOTIF SUCCESS] Alerte transmise à l'administrateur ({})", fromAddress);
        } catch (Exception e) {
            log.warn("[ADMIN NOTIF SKIPPED] Impossible de notifier l'admin : {}", e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Méthodes privées d'aide & Diagnostic des erreurs
    // ─────────────────────────────────────────────────────────────────────────

    private boolean validerAdresseEmail(String email) {
        if (email == null || email.trim().isEmpty() || !email.contains("@")) {
            log.error("[MAIL REJETÉ] Adresse e-mail destinataire invalide ou vide : '{}'", email);
            return false;
        }
        return true;
    }

    private void configurerExpediteur(MimeMessageHelper helper) throws MessagingException {
        try {
            helper.setFrom(fromAddress, fromName);
        } catch (UnsupportedEncodingException e) {
            helper.setFrom(fromAddress);
        }
    }

    private String extrairePrenom(String nomComplet) {
        if (nomComplet != null && !nomComplet.isBlank()) {
            return nomComplet.split(" ")[0];
        }
        return "Collaborateur";
    }

    private void traiterErreurEnvoi(String typeEnvoi, String toEmail, Exception ex) {
        if (ex instanceof MailAuthenticationException) {
            log.error("[MAIL AUTH ERROR] Échec d'authentification SMTP avec le compte '{}' lors de l'envoi '{}' vers '{}'. " +
                      "CAUSE : Mot de passe d'application Gmail invalide ou validation 2 étapes inactive. " +
                      "SOLUTION : Générez un mot de passe d'application de 16 caractères sur https://myaccount.google.com/apppasswords. " +
                      "Détail : {}", smtpUsername, typeEnvoi, toEmail, ex.getMessage());
        } else if (ex instanceof MailSendException sendEx) {
            Throwable root = sendEx.getMostSpecificCause();
            log.error("[MAIL SEND ERROR] Erreur lors de l'expédition de '{}' vers '{}' : {} (Cause racine : {})",
                    typeEnvoi, toEmail, sendEx.getMessage(), root.getMessage());
        } else if (ex instanceof MessagingException) {
            log.error("[MAIL MIME ERROR] Erreur de formatage du message MIME pour '{}' : {}", toEmail, ex.getMessage());
        } else {
            log.error("[MAIL GENERIC ERROR] Erreur inattendue d'envoi d'e-mail pour '{}' : {}", toEmail, ex.getMessage(), ex);
        }
    }
}
