package tn.blueorbit.adp.services;

import java.util.List;
import tn.blueorbit.adp.dto.ApiDtos.*;

public interface UserService {
  List<UserView> list();

  UserView me(String email);

  Auth register(Register input);

  Auth login(Login input);

  void delete(Long id, String actorEmail);
}
