package tn.blueorbit.adp.services;

import tn.blueorbit.adp.entities.Role;

public interface RoleService {
  Role member();

  Role admin();
}
