package tn.blueorbit.adp.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Service
public class RegistrationMail {
  public record Registered(String nom, String prenom, String email, String tel) {}

  private static final Logger log = LoggerFactory.getLogger(RegistrationMail.class);
  private final JavaMailSender sender;
  private final boolean enabled;
  private final String admin, from;

  public RegistrationMail(
      JavaMailSender sender,
      @Value("${app.mail.enabled}") boolean enabled,
      @Value("${app.admin.email}") String admin,
      @Value("${app.mail.from}") String from) {
    this.sender = sender;
    this.enabled = enabled;
    this.admin = admin;
    this.from = from;
  }

  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void send(Registered u) {
    if (!enabled) {
      log.info("Registration email disabled by profile");
      return;
    }
    SimpleMailMessage m = new SimpleMailMessage();
    m.setTo(admin);
    m.setFrom(from);
    m.setSubject("AdoptiPattes: new member");
    m.setText(
        "Name: " + u.prenom() + " " + u.nom() + "\nEmail: " + u.email() + "\nPhone: " + u.tel());
    try {
      sender.send(m);
    } catch (org.springframework.mail.MailException e) {
      log.error(
          "Registration saved, but admin notification delivery failed. Check SMTP configuration.");
    }
  }
}
