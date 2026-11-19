package tn.blueorbit.adp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.blueorbit.adp.entities.*;

public interface UserRepository extends JpaRepository<User, Long> {
  java.util.Optional<User> findByEmail(String email);

  boolean existsByEmail(String email);
}
