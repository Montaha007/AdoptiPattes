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
import tn.blueorbit.adp.services.CommentaireService;

@Service
@Transactional
public class CommentaireServiceImpl implements CommentaireService {
  private final CommentaireRepository repo;
  private final AnnonceRepository annonces;
  private final UserRepository users;

  public CommentaireServiceImpl(CommentaireRepository r, AnnonceRepository a, UserRepository u) {
    repo = r;
    annonces = a;
    users = u;
  }

  private Commentaire find(Long id) {
    return repo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
  }

  private Annonce annonce(Long id) {
    return annonces
        .findById(id)
        .orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Announcement not found"));
  }

  public List<CommentView> list(Long id) {
    annonce(id);
    return repo.findByAnnonceIdOrderByDateCommentaireAsc(id).stream()
        .map(ApiDtos::comment)
        .toList();
  }

  public CommentView create(Long id, CommentInput x, String email) {
    Commentaire c = new Commentaire();
    c.setAnnonce(annonce(id));
    c.setUser(users.findByEmail(email).orElseThrow());
    c.setContenu(x.contenu().trim());
    return ApiDtos.comment(repo.save(c));
  }

  public CommentView update(Long id, CommentInput x) {
    Commentaire c = find(id);
    c.setContenu(x.contenu().trim());
    return ApiDtos.comment(repo.save(c));
  }

  public void delete(Long id) {
    repo.delete(find(id));
  }
}
