package tn.blueorbit.adp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tn.blueorbit.adp.entities.*;
import tn.blueorbit.adp.repositories.*;
import tn.blueorbit.adp.services.RoleService;

@Component
public class DemoData implements CommandLineRunner {
  private final UserRepository users;
  private final AnnonceRepository annonces;
  private final CommentaireRepository comments;
  private final RoleService roles;
  private final PasswordEncoder encoder;
  private final boolean seed;
  private final String adminPassword, memberPassword, adminEmail;

  public DemoData(
      UserRepository u,
      AnnonceRepository a,
      CommentaireRepository c,
      RoleService r,
      PasswordEncoder e,
      @Value("${app.seed.enabled}") boolean seed,
      @Value("${app.seed.admin-password}") String ap,
      @Value("${app.seed.member-password}") String mp,
      @Value("${app.admin.email}") String ae) {
    users = u;
    annonces = a;
    comments = c;
    roles = r;
    encoder = e;
    this.seed = seed;
    adminPassword = ap;
    memberPassword = mp;
    adminEmail = ae;
  }

  private User account(String email, String prenom, String nom, String password, Role role) {
    return users
        .findByEmail(email)
        .orElseGet(
            () -> {
              User u = new User();
              u.setEmail(email);
              u.setPrenom(prenom);
              u.setNom(nom);
              u.setTel("+216 20 000 000");
              u.setPassword(encoder.encode(password));
              u.getRoles().add(role);
              return users.save(u);
            });
  }

  @Transactional
  public void run(String... args) {
    Role member = roles.member();
    Role admin = roles.admin();
    if (!adminPassword.isBlank()) account(adminEmail, "Alex", "Admin", adminPassword, admin);
    if (!seed) return;
    if (adminPassword.length() < 10 || memberPassword.length() < 10)
      throw new IllegalStateException(
          "Set ADMIN_PASSWORD and MEMBER_PASSWORD (10+ characters) before seeding");
    User maya = account("maya@adoptipattes.local", "Maya", "Ben Ali", memberPassword, member);
    User sami = account("sami@adoptipattes.local", "Sami", "Mansour", memberPassword, member);
    if (annonces.count() > 0) return;
    String[] titles = {
      "Luna is looking for her forever person",
      "A little ginger cat near the park",
      "How do you welcome a rescue kitten?",
      "Meet Milo, your new best friend",
      "Friendly dog spotted in La Marsa",
      "Tips for a nervous rescue dog?",
      "Olive has so much love to give",
      "Small kitten needs a helping hand",
      "What should a kitten eat?",
      "Biscuit is ready for a fresh start",
      "Lost tabby near the old town",
      "Introducing two cats, gently",
      "Nala wants a sunny windowsill",
      "Dog found near the beach",
      "Keeping our furry friends cool"
    };
    String[] cities = {
      "Tunis",
      "La Marsa",
      "Sousse",
      "Ariana",
      "La Marsa",
      "Tunis",
      "Sfax",
      "Sousse",
      "Tunis",
      "Ariana",
      "Tunis",
      "Sfax",
      "La Marsa",
      "Sousse",
      "Tunis"
    };
    String[] photos = {
      "photo-1573865526739-10659fec78a5",
      "photo-1514888286974-6c03e2ca1dba",
      "photo-1513360371669-4adf3dd7dff8",
      "photo-1552053831-71594a27632d",
      "photo-1587300003388-59208cc962cb"
    };
    for (int i = 0; i < 15; i++) {
      Annonce a = new Annonce();
      a.setTitre(titles[i]);
      a.setType(TypeAnnonce.values()[i % 3]);
      a.setEspece((i == 3 || i == 4 || i == 5 || i == 13) ? Espece.CHIEN : Espece.CHAT);
      a.setDescription(
          i % 3 == 0
              ? "A gentle little soul with a big heart. This lovely companion is ready for a caring"
                    + " home. Please leave a comment to meet them and learn about their"
                    + " personality, needs and adoption arrangements."
              : i % 3 == 1
                  ? "Spotted in the neighbourhood today. The animal seems friendly but needs a safe"
                        + " place and a check-up. If you are nearby and can help, please comment so"
                        + " we can coordinate together."
                  : "Calling our kind community! I would love to hear your experience and practical"
                        + " advice. Please share what helped you. For urgent health concerns, we"
                        + " will always contact a veterinarian.");
      a.setPhotoUrl(
          "https://images.unsplash.com/"
              + photos[i % photos.length]
              + "?auto=format&fit=crop&w=900&q=80");
      a.setVille(cities[i]);
      a.setAdresse(i % 3 == 1 ? "Near the neighbourhood park" : "");
      if (i % 3 == 1) {
        a.setLatitude(36.8065 + i * 0.001);
        a.setLongitude(10.1815 + i * 0.001);
      }
      a.setStatut(
          i == 9 ? StatutAnnonce.RESOLUE : i == 4 ? StatutAnnonce.EN_COURS : StatutAnnonce.OUVERTE);
      a.setDatePublication(
          java.time.LocalDateTime.now(java.time.Clock.systemUTC()).minusHours(i * 5));
      a.setUser(i % 2 == 0 ? maya : sami);
      annonces.save(a);
      for (int k = 0; k < (i < 5 ? 2 : 1); k++) {
        Commentaire c = new Commentaire();
        c.setAnnonce(a);
        c.setUser(k == 0 ? sami : maya);
        c.setContenu(
            k == 0
                ? "Thank you for sharing. I am nearby and happy to help. Let's coordinate here!"
                : "That is so kind. I will share more details as soon as I can.");
        comments.save(c);
      }
    }
  }
}
