package tn.blueorbit.adp.services;

import java.util.List;
import tn.blueorbit.adp.dto.ApiDtos.*;

public interface CommentaireService {
  List<CommentView> list(Long annonce);

  CommentView create(Long annonce, CommentInput input, String email);

  CommentView update(Long id, CommentInput input);

  void delete(Long id);
}
