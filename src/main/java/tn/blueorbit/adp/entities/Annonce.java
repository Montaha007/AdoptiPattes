package tn.blueorbit.adp.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "annonces")
public class Annonce {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 120)
  private String titre;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TypeAnnonce type;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Espece espece;

  @Column(nullable = false, length = 5000)
  private String description;

  @Column(length = 2048)
  private String photoUrl;

  @Column(nullable = false)
  private String ville;

  private String adresse;

  private Double latitude;

  private Double longitude;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private StatutAnnonce statut = StatutAnnonce.OUVERTE;

  @Column(nullable = false, updatable = false)
  private java.time.LocalDateTime datePublication =
      java.time.LocalDateTime.now(java.time.Clock.systemUTC());

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id")
  private User user;

  @OneToMany(mappedBy = "annonce", cascade = CascadeType.ALL, orphanRemoval = true)
  private java.util.List<Commentaire> commentaires = new java.util.ArrayList<>();

  public Long getId() {
    return id;
  }

  public void setId(Long value) {
    this.id = value;
  }

  public String getTitre() {
    return titre;
  }

  public void setTitre(String value) {
    this.titre = value;
  }

  public TypeAnnonce getType() {
    return type;
  }

  public void setType(TypeAnnonce value) {
    this.type = value;
  }

  public Espece getEspece() {
    return espece;
  }

  public void setEspece(Espece value) {
    this.espece = value;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String value) {
    this.description = value;
  }

  public String getPhotoUrl() {
    return photoUrl;
  }

  public void setPhotoUrl(String value) {
    this.photoUrl = value;
  }

  public String getVille() {
    return ville;
  }

  public void setVille(String value) {
    this.ville = value;
  }

  public String getAdresse() {
    return adresse;
  }

  public void setAdresse(String value) {
    this.adresse = value;
  }

  public Double getLatitude() {
    return latitude;
  }

  public void setLatitude(Double value) {
    this.latitude = value;
  }

  public Double getLongitude() {
    return longitude;
  }

  public void setLongitude(Double value) {
    this.longitude = value;
  }

  public StatutAnnonce getStatut() {
    return statut;
  }

  public void setStatut(StatutAnnonce value) {
    this.statut = value;
  }

  public java.time.LocalDateTime getDatePublication() {
    return datePublication;
  }

  public void setDatePublication(java.time.LocalDateTime value) {
    this.datePublication = value;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User value) {
    this.user = value;
  }

  public java.util.List<Commentaire> getCommentaires() {
    return commentaires;
  }

  public void setCommentaires(java.util.List<Commentaire> value) {
    this.commentaires = value;
  }
}
