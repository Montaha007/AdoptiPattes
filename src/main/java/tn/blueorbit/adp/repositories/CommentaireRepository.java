package tn.blueorbit.adp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.blueorbit.adp.entities.*;

public interface CommentaireRepository extends JpaRepository<Commentaire, Long> {
  void deleteAllByUserId(Long userId);
  void deleteAllByAnnonceUserId(Long userId);
  java.util.List<Commentaire> findByAnnonceIdOrderByDateCommentaireAsc(Long id);
}
