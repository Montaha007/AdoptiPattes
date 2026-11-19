package tn.blueorbit.adp.services;

import java.util.List;
import tn.blueorbit.adp.dto.ApiDtos.*;
import tn.blueorbit.adp.entities.TypeAnnonce;

public interface AnnonceService {
  List<AnnonceView> list(TypeAnnonce type, String ville);

  AnnonceView get(Long id);

  AnnonceView create(AnnonceInput input, String email);

  AnnonceView update(Long id, AnnonceInput input, String email);

  void delete(Long id, String email);
}
