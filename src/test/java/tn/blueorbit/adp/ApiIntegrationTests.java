package tn.blueorbit.adp;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.*;
import org.junit.jupiter.api.*;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:adptest;MODE=MySQL;DB_CLOSE_DELAY=-1",
      "spring.jpa.hibernate.ddl-auto=create-drop",
      "app.mail.enabled=true"
    })
@ActiveProfiles("demo")
@AutoConfigureMockMvc
class ApiIntegrationTests {
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;
  @MockitoBean JavaMailSender mail;

  String token(String email, String pass) throws Exception {
    return json.readTree(
            mvc.perform(
                    post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            json.writeValueAsString(
                                java.util.Map.of("email", email, "password", pass))))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString())
        .get("token")
        .asText();
  }

  String admin() throws Exception {
    return token("admin@adoptipattes.local", "AdminDemo!2026");
  }

  String member() throws Exception {
    return token("maya@adoptipattes.local", "MemberDemo!2026");
  }

  String postBody(String type) {
    return "{\"titre\":\"Test kitten\",\"type\":\""
        + type
        + "\",\"espece\":\"CHAT\",\"description\":\"A friendly test"
        + " kitten\",\"ville\":\"Tunis\",\"statut\":\"OUVERTE\",\"idUser\":1}";
  }

  long create() throws Exception {
    return json.readTree(
            mvc.perform(
                    post("/api/annonces")
                        .header("Authorization", "Bearer " + member())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(postBody("ADOPTION")))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString())
        .get("id")
        .asLong();
  }

  @Test
  void publicReadAndFilters() throws Exception {
    mvc.perform(get("/api/annonces"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].auteur.password").doesNotExist());
    mvc.perform(get("/api/annonces").param("type", "ADOPTION").param("ville", "Tunis"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].type").value("ADOPTION"));
    mvc.perform(get("/api/annonces/1/commentaires")).andExpect(status().isOk());
  }

  @Test
  void visitorsCannotWriteOrReadUsers() throws Exception {
    mvc.perform(
            post("/api/annonces")
                .contentType(MediaType.APPLICATION_JSON)
                .content(postBody("ADOPTION")))
        .andExpect(status().isUnauthorized());
    mvc.perform(
            put("/api/annonces/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(postBody("ADOPTION")))
        .andExpect(status().isUnauthorized());
    mvc.perform(delete("/api/annonces/1")).andExpect(status().isUnauthorized());
    mvc.perform(get("/api/users")).andExpect(status().isUnauthorized());
  }

  @Test
  void membersCannotModerateEvenTheirOwnPosts() throws Exception {
    long id = create();
    String t = member();
    mvc.perform(
            put("/api/annonces/" + id)
                .header("Authorization", "Bearer " + t)
                .contentType(MediaType.APPLICATION_JSON)
                .content(postBody("ADOPTION")))
        .andExpect(status().isForbidden());
    mvc.perform(delete("/api/annonces/" + id).header("Authorization", "Bearer " + t))
        .andExpect(status().isForbidden());
    mvc.perform(get("/api/users").header("Authorization", "Bearer " + t))
        .andExpect(status().isForbidden());
    mvc.perform(
            put("/api/commentaires/1")
                .header("Authorization", "Bearer " + t)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"contenu\":\"No\"}"))
        .andExpect(status().isForbidden());
    mvc.perform(delete("/api/commentaires/1").header("Authorization", "Bearer " + t))
        .andExpect(status().isForbidden());
  }

  @Test
  void authorComesFromTokenNotClient() throws Exception {
    mvc.perform(
            post("/api/annonces")
                .header("Authorization", "Bearer " + member())
                .contentType(MediaType.APPLICATION_JSON)
                .content(postBody("ADOPTION")))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.auteur.prenom").value("Maya"))
        .andExpect(jsonPath("$.statut").value("OUVERTE"));
  }

  @Test
  void coordinatesAreRequiredForStrays() throws Exception {
    mvc.perform(
            post("/api/annonces")
                .header("Authorization", "Bearer " + member())
                .contentType(MediaType.APPLICATION_JSON)
                .content(postBody("ANIMAL_ERRANT")))
        .andExpect(status().isBadRequest());
    String valid =
        postBody("ANIMAL_ERRANT").replace("\"idUser\":1", "\"latitude\":36.8,\"longitude\":10.2");
    mvc.perform(
            post("/api/annonces")
                .header("Authorization", "Bearer " + member())
                .contentType(MediaType.APPLICATION_JSON)
                .content(valid))
        .andExpect(status().isCreated());
  }

  @Test
  void invalidValuesAndUnsafePhotoUrlRejected() throws Exception {
    String body =
        postBody("ADOPTION").replace("\"idUser\":1", "\"photoUrl\":\"javascript:alert(1)\"");
    mvc.perform(
            post("/api/annonces")
                .header("Authorization", "Bearer " + member())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
        .andExpect(status().isBadRequest());
    mvc.perform(get("/api/annonces").param("type", "INVALID")).andExpect(status().isBadRequest());
  }

  @Test
  void adminCrudAndCascadeDeletion() throws Exception {
    long id = create();
    String t = admin();
    mvc.perform(
            put("/api/annonces/" + id)
                .header("Authorization", "Bearer " + t)
                .contentType(MediaType.APPLICATION_JSON)
                .content(postBody("ADOPTION").replace("OUVERTE", "RESOLUE")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.statut").value("RESOLUE"));
    String c =
        mvc.perform(
                post("/api/annonces/" + id + "/commentaires")
                    .header("Authorization", "Bearer " + member())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"contenu\":\"I can help!\",\"idUser\":1}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.auteur.prenom").value("Maya"))
            .andReturn()
            .getResponse()
            .getContentAsString();
    long cid = json.readTree(c).get("id").asLong();
    mvc.perform(
            put("/api/commentaires/" + cid)
                .header("Authorization", "Bearer " + t)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"contenu\":\"Updated by admin\"}"))
        .andExpect(status().isOk());
    mvc.perform(delete("/api/annonces/" + id).header("Authorization", "Bearer " + t))
        .andExpect(status().isNoContent());
    mvc.perform(get("/api/annonces/" + id)).andExpect(status().isNotFound());
    mvc.perform(
            put("/api/commentaires/" + cid)
                .header("Authorization", "Bearer " + t)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"contenu\":\"Gone\"}"))
        .andExpect(status().isNotFound());
  }

  @Test
  void missingResourcesReturn404() throws Exception {
    mvc.perform(get("/api/annonces/999999")).andExpect(status().isNotFound());
    mvc.perform(get("/api/annonces/999999/commentaires")).andExpect(status().isNotFound());
    mvc.perform(delete("/api/commentaires/999999").header("Authorization", "Bearer " + admin()))
        .andExpect(status().isNotFound());
  }

  @Test
  void invalidLoginAndTokenRejected() throws Exception {
    mvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"maya@adoptipattes.local\",\"password\":\"wrong\"}"))
        .andExpect(status().isUnauthorized());
    mvc.perform(get("/api/auth/me").header("Authorization", "Bearer invalid-token"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void registrationUsesMemberRoleAndSendsAdminEmail() throws Exception {
    String body =
        "{\"email\":\"new-member@example.com\",\"password\":\"TestPassword!2026\",\"nom\":\"Tester\",\"prenom\":\"New\",\"tel\":\"12345678\",\"roles\":[\"ADMIN\"]}";
    mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.user.roles[0]").value("MEMBRE"))
        .andExpect(jsonPath("$.user.password").doesNotExist());
    ArgumentCaptor<SimpleMailMessage> c = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mail).send(c.capture());
    assertEquals("admin@adoptipattes.local", c.getValue().getTo()[0]);
    assertTrue(c.getValue().getText().contains("new-member@example.com"));
    assertTrue(c.getValue().getText().contains("12345678"));
    mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isConflict());
  }

  @Test
  void adminUserListDoesNotExposePasswords() throws Exception {
    mvc.perform(get("/api/users").header("Authorization", "Bearer " + admin()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].password").doesNotExist())
        .andExpect(jsonPath("$[0].email").exists());
  }

  @Test
  void corsAllowsAngularOnly() throws Exception {
    mvc.perform(
            options("/api/annonces")
                .header("Origin", "http://localhost:4200")
                .header("Access-Control-Request-Method", "POST"))
        .andExpect(status().isOk())
        .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"));
    mvc.perform(
            options("/api/annonces")
                .header("Origin", "https://untrusted.example")
                .header("Access-Control-Request-Method", "POST"))
        .andExpect(status().isForbidden());
  }
}
