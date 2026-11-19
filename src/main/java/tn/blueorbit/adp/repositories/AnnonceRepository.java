package tn.blueorbit.adp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.blueorbit.adp.entities.*;

public interface AnnonceRepository extends JpaRepository<Annonce, Long> {
  void deleteAllByUserId(Long userId);
  @org.springframework.data.jpa.repository.Query(
      "select a from Annonce a where (:type is null or a.type=:type) and (:ville is null or"
          + " lower(a.ville) like lower(concat('%',:ville,'%'))) order by a.datePublication desc")
  java.util.List<Annonce> search(
      @org.springframework.data.repository.query.Param("type") TypeAnnonce type,
      @org.springframework.data.repository.query.Param("ville") String ville);
}
