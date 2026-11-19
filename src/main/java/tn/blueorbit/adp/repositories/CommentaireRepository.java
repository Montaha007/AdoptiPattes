package tn.blueorbit.adp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.blueorbit.adp.entities.*;

public interface CommentaireRepository extends JpaRepository<Commentaire, Long> {
  java.util.List<Commentaire> findByAnnonceIdOrderByDateCommentaireAsc(Long id);
}
