package tn.blueorbit.adp.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String libelle;

  public Long getId() {
    return id;
  }

  public void setId(Long value) {
    this.id = value;
  }

  public String getLibelle() {
    return libelle;
  }

  public void setLibelle(String value) {
    this.libelle = value;
  }
}
