package tn.blueorbit.adp.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;
import tn.blueorbit.adp.entities.*;

public final class ApiDtos {
  public record Register(
      @NotBlank @Email @Size(max = 254) String email,
      @NotBlank @Size(min = 10, max = 72) String password,
      @NotBlank @Size(max = 80) String nom,
      @NotBlank @Size(max = 80) String prenom,
      @NotBlank @Size(max = 30) String tel,
      @Pattern(regexp = "lavender|ginger|cream|grey|chocolate") String catColor) {}

  public record Login(@NotBlank @Email String email, @NotBlank String password) {}

  public record Person(Long id, String nom, String prenom) {}

  public record UserView(
      Long id, String email, String nom, String prenom, String tel, List<String> roles, String catColor) {}

  public record Auth(String token, UserView user) {}

  public record AnnonceInput(
      @NotBlank @Size(max = 120) String titre,
      @NotNull TypeAnnonce type,
      @NotNull Espece espece,
      @NotBlank @Size(max = 5000) String description,
      @Size(max = 2048)
          @Pattern(regexp = "^(https?://[^\\s]+)?$", message = "Use an http(s) image URL")
          String photoUrl,
      @NotBlank @Size(max = 120) String ville,
      @Size(max = 255) String adresse,
      @DecimalMin("-90") @DecimalMax("90") Double latitude,
      @DecimalMin("-180") @DecimalMax("180") Double longitude,
      @NotNull StatutAnnonce statut) {}

  public record CommentInput(@NotBlank @Size(max = 2000) String contenu) {}

  public record AnnonceView(
      Long id,
      String titre,
      TypeAnnonce type,
      Espece espece,
      String description,
      String photoUrl,
      String ville,
      String adresse,
      Double latitude,
      Double longitude,
      StatutAnnonce statut,
      LocalDateTime datePublication,
      Person auteur,
      int commentaireCount) {}

  public record CommentView(
      Long id, String contenu, LocalDateTime dateCommentaire, Long idAnnonce, Person auteur) {}

  public static UserView user(User u) {
    return new UserView(
        u.getId(),
        u.getEmail(),
        u.getNom(),
        u.getPrenom(),
        u.getTel(),
        u.getRoles().stream().map(Role::getLibelle).sorted().toList(),
        u.getCatColor());
  }

  public static Person person(User u) {
    return new Person(u.getId(), u.getNom(), u.getPrenom());
  }

  public static AnnonceView annonce(Annonce a) {
    return new AnnonceView(
        a.getId(),
        a.getTitre(),
        a.getType(),
        a.getEspece(),
        a.getDescription(),
        a.getPhotoUrl(),
        a.getVille(),
        a.getAdresse(),
        a.getLatitude(),
        a.getLongitude(),
        a.getStatut(),
        a.getDatePublication(),
        person(a.getUser()),
        a.getCommentaires().size());
  }

  public static CommentView comment(Commentaire c) {
    return new CommentView(
        c.getId(),
        c.getContenu(),
        c.getDateCommentaire(),
        c.getAnnonce().getId(),
        person(c.getUser()));
  }
}
