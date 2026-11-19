package tn.blueorbit.adp.security;

import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import tn.blueorbit.adp.repositories.UserRepository;

@Service
public class AdpUserDetailsService implements UserDetailsService {
  private final UserRepository users;

  public AdpUserDetailsService(UserRepository users) {
    this.users = users;
  }

  public UserDetails loadUserByUsername(String email) {
    var u =
        users
            .findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
    return User.withUsername(u.getEmail())
        .password(u.getPassword())
        .roles(u.getRoles().stream().map(r -> r.getLibelle()).toArray(String[]::new))
        .build();
  }
}
