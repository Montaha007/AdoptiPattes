package tn.blueorbit.adp.security;

import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

@Configuration
public class SecurityConfig {
  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  CorsConfigurationSource cors(@Value("${app.cors.origins}") String origins) {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOrigins(Arrays.asList(origins.split(",")));
    c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    c.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", c);
    return source;
  }

  @Bean
  SecurityFilterChain security(HttpSecurity http, JwtFilter jwt, @org.springframework.beans.factory.annotation.Qualifier("cors") CorsConfigurationSource cors)
      throws Exception {
    return http.csrf(c -> c.disable())
        .cors(c -> c.configurationSource(cors))
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            a ->
                a.requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                    .requestMatchers("/api/auth/login", "/api/auth/register")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/annonces/**")
                    .permitAll()
                    .requestMatchers("/api/users/**")
                    .hasRole("ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/annonces/*")
                    .hasAnyRole("ADMIN", "MEMBRE")
                    .requestMatchers(HttpMethod.DELETE, "/api/annonces/*")
                    .hasAnyRole("ADMIN", "MEMBRE")
                    .requestMatchers(HttpMethod.PUT, "/api/**")
                    .hasRole("ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/**")
                    .hasRole("ADMIN")
                    .requestMatchers(HttpMethod.POST, "/api/annonces/**")
                    .hasAnyRole("ADMIN", "MEMBRE")
                    .requestMatchers("/api/auth/me")
                    .authenticated()
                    .requestMatchers("/api/**")
                    .denyAll()
                    .anyRequest()
                    .permitAll())
        .exceptionHandling(
            e ->
                e.authenticationEntryPoint(
                        (q, r, x) -> {
                          r.setStatus(401);
                          r.setContentType("application/json");
                          r.getWriter().write("{\"message\":\"Please sign in\"}");
                        })
                    .accessDeniedHandler(
                        (q, r, x) -> {
                          r.setStatus(403);
                          r.setContentType("application/json");
                          r.getWriter()
                              .write("{\"message\":\"Administrator permission required\"}");
                        }))
        .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class)
        .build();
  }
}

