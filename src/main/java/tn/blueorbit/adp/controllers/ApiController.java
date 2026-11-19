package tn.blueorbit.adp.controllers;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import tn.blueorbit.adp.dto.ApiDtos.*;
import tn.blueorbit.adp.entities.TypeAnnonce;
import tn.blueorbit.adp.services.*;

@RestController
@RequestMapping("/api")
public class ApiController {
  private final AnnonceService annonces;
  private final CommentaireService comments;
  private final UserService users;

  public ApiController(AnnonceService a, CommentaireService c, UserService u) {
    annonces = a;
    comments = c;
    users = u;
  }

  @GetMapping("/annonces")
  List<AnnonceView> list(
      @RequestParam(required = false) TypeAnnonce type,
      @RequestParam(required = false) String ville) {
    return annonces.list(type, ville);
  }

  @GetMapping("/annonces/{id}")
  AnnonceView get(@PathVariable Long id) {
    return annonces.get(id);
  }

  @PostMapping("/annonces")
  @ResponseStatus(HttpStatus.CREATED)
  AnnonceView create(@Valid @RequestBody AnnonceInput x, Principal p) {
    return annonces.create(x, p.getName());
  }

  @PutMapping("/annonces/{id}")
  AnnonceView update(@PathVariable Long id, @Valid @RequestBody AnnonceInput x) {
    return annonces.update(id, x);
  }

  @DeleteMapping("/annonces/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void delete(@PathVariable Long id) {
    annonces.delete(id);
  }

  @GetMapping("/annonces/{id}/commentaires")
  List<CommentView> comments(@PathVariable Long id) {
    return comments.list(id);
  }

  @PostMapping("/annonces/{id}/commentaires")
  @ResponseStatus(HttpStatus.CREATED)
  CommentView comment(@PathVariable Long id, @Valid @RequestBody CommentInput x, Principal p) {
    return comments.create(id, x, p.getName());
  }

  @PutMapping("/commentaires/{id}")
  CommentView updateComment(@PathVariable Long id, @Valid @RequestBody CommentInput x) {
    return comments.update(id, x);
  }

  @DeleteMapping("/commentaires/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void deleteComment(@PathVariable Long id) {
    comments.delete(id);
  }

  @GetMapping("/users")
  List<UserView> users() {
    return users.list();
  }

  @PostMapping("/auth/register")
  @ResponseStatus(HttpStatus.CREATED)
  Auth register(@Valid @RequestBody Register x) {
    return users.register(x);
  }

  @PostMapping("/auth/login")
  Auth login(@Valid @RequestBody Login x) {
    return users.login(x);
  }

  @GetMapping("/auth/me")
  UserView me(Principal p) {
    return users.me(p.getName());
  }
}
