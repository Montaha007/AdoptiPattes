package tn.blueorbit.adp.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtFilter extends OncePerRequestFilter {
  private final JwtService jwt;
  private final AdpUserDetailsService users;

  public JwtFilter(JwtService jwt, AdpUserDetailsService users) {
    this.jwt = jwt;
    this.users = users;
  }

  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    String header = request.getHeader("Authorization");
    if (header != null && header.startsWith("Bearer ")) {
      try {
        var u = users.loadUserByUsername(jwt.subject(header.substring(7)));
        SecurityContextHolder.getContext()
            .setAuthentication(
                new UsernamePasswordAuthenticationToken(u, null, u.getAuthorities()));
      } catch (io.jsonwebtoken.JwtException
          | IllegalArgumentException
          | org.springframework.security.core.userdetails.UsernameNotFoundException e) {
        SecurityContextHolder.clearContext();
      }
    }
    chain.doFilter(request, response);
  }
}
