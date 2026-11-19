package tn.blueorbit.adp.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "adp_users")
public class User {
  @OneToMany(mappedBy = "user")
  private java.util.List<Annonce> annonces = new java.util.ArrayList<>();

  @OneToMany(mappedBy = "user")
  private java.util.List<Commentaire> commentaires = new java.util.ArrayList<>();

  public java.util.List<Annonce> getAnnonces() {
    return annonces;
  }

  public java.util.List<Commentaire> getCommentaires() {
    return commentaires;
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String email;

  @com.fasterxml.jackson.annotation.JsonIgnore
  @Column(nullable = false)
  private String password;

  @Column(nullable = false)
  private String tel;

  @Column(nullable = false)
  private String nom;

  @Column(nullable = false)
  private String prenom;

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(
      name = "user_roles",
      joinColumns = @JoinColumn(name = "user_id"),
      inverseJoinColumns = @JoinColumn(name = "role_id"))
  private java.util.Set<Role> roles = new java.util.HashSet<>();

  public Long getId() {
    return id;
  }

  public void setId(Long value) {
    this.id = value;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String value) {
    this.email = value;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String value) {
    this.password = value;
  }

  public String getTel() {
    return tel;
  }

  public void setTel(String value) {
    this.tel = value;
  }

  public String getNom() {
    return nom;
  }

  public void setNom(String value) {
    this.nom = value;
  }

  public String getPrenom() {
    return prenom;
  }

  public void setPrenom(String value) {
    this.prenom = value;
  }

  public java.util.Set<Role> getRoles() {
    return roles;
  }

  public void setRoles(java.util.Set<Role> value) {
    this.roles = value;
  }
}
