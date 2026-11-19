package tn.blueorbit.adp.services.impl;

import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tn.blueorbit.adp.dto.ApiDtos;
import tn.blueorbit.adp.dto.ApiDtos.*;
import tn.blueorbit.adp.entities.User;
import tn.blueorbit.adp.repositories.UserRepository;
import tn.blueorbit.adp.security.JwtService;
import tn.blueorbit.adp.services.*;

@Service
@Transactional
public class UserServiceImpl implements UserService {
  private final UserRepository repo;
  private final RoleService roles;
  private final PasswordEncoder encoder;
  private final JwtService jwt;
  private final ApplicationEventPublisher events;

  public UserServiceImpl(
      UserRepository repo,
      RoleService roles,
      PasswordEncoder encoder,
      JwtService jwt,
      ApplicationEventPublisher events) {
    this.repo = repo;
    this.roles = roles;
    this.encoder = encoder;
    this.jwt = jwt;
    this.events = events;
  }

  public List<UserView> list() {
    return repo.findAll().stream().map(ApiDtos::user).toList();
  }

  public UserView me(String email) {
    return ApiDtos.user(repo.findByEmail(email).orElseThrow());
  }

  public Auth register(Register x) {
    String email = x.email().trim().toLowerCase(Locale.ROOT);
    if (repo.existsByEmail(email))
      throw new ResponseStatusException(HttpStatus.CONFLICT, "This email is already registered");
    if (x.password().getBytes(StandardCharsets.UTF_8).length > 72)
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Password must be at most 72 UTF-8 bytes");
    User u = new User();
    u.setEmail(email);
    u.setPassword(encoder.encode(x.password()));
    u.setNom(x.nom().trim());
    u.setPrenom(x.prenom().trim());
    u.setTel(x.tel().trim());
    u.getRoles().add(roles.member());
    repo.saveAndFlush(u);
    events.publishEvent(
        new RegistrationMail.Registered(u.getNom(), u.getPrenom(), u.getEmail(), u.getTel()));
    return new Auth(jwt.issue(email), ApiDtos.user(u));
  }

  public Auth login(Login x) {
    User u =
        repo.findByEmail(x.email().trim().toLowerCase(Locale.ROOT))
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid email or password"));
    if (!encoder.matches(x.password(), u.getPassword()))
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    return new Auth(jwt.issue(u.getEmail()), ApiDtos.user(u));
  }
}
