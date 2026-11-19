package tn.blueorbit.adp.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "commentaires")
public class Commentaire {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 2000)
  private String contenu;

  @Column(nullable = false, updatable = false)
  private java.time.LocalDateTime dateCommentaire =
      java.time.LocalDateTime.now(java.time.Clock.systemUTC());

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "annonce_id")
  private Annonce annonce;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id")
  private User user;

  public Long getId() {
    return id;
  }

  public void setId(Long value) {
    this.id = value;
  }

  public String getContenu() {
    return contenu;
  }

  public void setContenu(String value) {
    this.contenu = value;
  }

  public java.time.LocalDateTime getDateCommentaire() {
    return dateCommentaire;
  }

  public void setDateCommentaire(java.time.LocalDateTime value) {
    this.dateCommentaire = value;
  }

  public Annonce getAnnonce() {
    return annonce;
  }

  public void setAnnonce(Annonce value) {
    this.annonce = value;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User value) {
    this.user = value;
  }
}
