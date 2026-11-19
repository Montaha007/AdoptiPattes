package tn.blueorbit.adp.services.impl;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tn.blueorbit.adp.dto.ApiDtos;
import tn.blueorbit.adp.dto.ApiDtos.*;
import tn.blueorbit.adp.entities.*;
import tn.blueorbit.adp.repositories.*;
import tn.blueorbit.adp.services.AnnonceService;

@Service
@Transactional
public class AnnonceServiceImpl implements AnnonceService {
  private final AnnonceRepository repo;
  private final UserRepository users;

  public AnnonceServiceImpl(AnnonceRepository repo, UserRepository users) {
    this.repo = repo;
    this.users = users;
  }

  private Annonce find(Long id) {
    return repo.findById(id)
        .orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Announcement not found"));
  }

  public List<AnnonceView> list(TypeAnnonce type, String ville) {
    return repo.search(type, ville == null || ville.isBlank() ? null : ville.trim()).stream()
        .map(ApiDtos::annonce)
        .toList();
  }

  public AnnonceView get(Long id) {
    return ApiDtos.annonce(find(id));
  }

  private void apply(Annonce a, AnnonceInput x) {
    if (x.type() == TypeAnnonce.ANIMAL_ERRANT && (x.latitude() == null || x.longitude() == null))
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "GPS coordinates are required for stray animals");
    if ((x.latitude() == null) != (x.longitude() == null))
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Provide both GPS coordinates or neither");
    a.setTitre(x.titre().trim());
    a.setType(x.type());
    a.setEspece(x.espece());
    a.setDescription(x.description().trim());
    a.setPhotoUrl(x.photoUrl());
    a.setVille(x.ville().trim());
    a.setAdresse(x.adresse());
    a.setLatitude(x.latitude());
    a.setLongitude(x.longitude());
    a.setStatut(x.statut());
  }

  public AnnonceView create(AnnonceInput x, String email) {
    Annonce a = new Annonce();
    apply(a, x);
    a.setStatut(StatutAnnonce.OUVERTE);
    a.setUser(users.findByEmail(email).orElseThrow());
    return ApiDtos.annonce(repo.save(a));
  }

  private void requireOwnerOrAdmin(Annonce a, String email) {
    User actor = users.findByEmail(email).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in"));
    boolean admin = actor.getRoles().stream().anyMatch(r -> "ADMIN".equals(r.getLibelle()));
    if (!admin && !a.getUser().getId().equals(actor.getId()))
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only manage your own posts");
  }

  public AnnonceView update(Long id, AnnonceInput x, String email) {
    Annonce a = find(id);
    requireOwnerOrAdmin(a, email);
    apply(a, x);
    return ApiDtos.annonce(repo.save(a));
  }

  public void delete(Long id, String email) {
    Annonce a = find(id);
    requireOwnerOrAdmin(a, email);
    repo.delete(a);
  }
}
