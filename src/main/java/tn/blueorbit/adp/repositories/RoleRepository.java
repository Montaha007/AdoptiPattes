package tn.blueorbit.adp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.blueorbit.adp.entities.*;

public interface RoleRepository extends JpaRepository<Role, Long> {
  java.util.Optional<Role> findByLibelle(String libelle);
}
