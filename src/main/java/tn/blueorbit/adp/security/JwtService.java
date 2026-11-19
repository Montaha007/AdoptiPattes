package tn.blueorbit.adp.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final SecretKey key;
  private final long expiry;

  public JwtService(
      @Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration-ms}") long expiry) {
    key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.expiry = expiry;
  }

  public String issue(String email) {
    return Jwts.builder()
        .subject(email)
        .issuer("adoptipattes")
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + expiry))
        .signWith(key)
        .compact();
  }

  public String subject(String token) {
    return Jwts.parser()
        .verifyWith(key)
        .requireIssuer("adoptipattes")
        .build()
        .parseSignedClaims(token)
        .getPayload()
        .getSubject();
  }
}
