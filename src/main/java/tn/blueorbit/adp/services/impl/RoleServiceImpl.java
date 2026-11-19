package tn.blueorbit.adp.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.blueorbit.adp.entities.Role;
import tn.blueorbit.adp.repositories.RoleRepository;
import tn.blueorbit.adp.services.RoleService;

@Service
@Transactional
public class RoleServiceImpl implements RoleService {
  private final RoleRepository roles;

  public RoleServiceImpl(RoleRepository roles) {
    this.roles = roles;
  }

  private Role get(String name) {
    return roles
        .findByLibelle(name)
        .orElseGet(
            () -> {
              Role r = new Role();
              r.setLibelle(name);
              return roles.save(r);
            });
  }

  public Role member() {
    return get("MEMBRE");
  }

  public Role admin() {
    return get("ADMIN");
  }
}
