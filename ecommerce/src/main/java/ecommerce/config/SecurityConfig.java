package ecommerce.config;

import ecommerce.security.JwtAuthFilter;
import ecommerce.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthFilter jwtAuthFilter;
        private final CustomUserDetailsService userDetailsService;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http)
                        throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth

                                                // ── Auth (all public) ──────────────────────
                                                .requestMatchers("/api/auth/**").permitAll()

                                                // ── Products GET (public) ──────────────────
                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/products/**")
                                                .permitAll()

                                                // ── Categories GET (public) ────────────────
                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/categories/**")
                                                .permitAll()

                                                // ── Reviews GET (public) ───────────────────
                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/reviews/**")
                                                .permitAll()

                                                // ── Seller public profile GET (public) ─────
                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/seller/profile/*")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/users/*/seller-profile")
                                                .permitAll()

                                                // ── Swagger (public) ───────────────────────
                                                .requestMatchers(
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html",
                                                                "/v3/api-docs/**")
                                                .permitAll()

                                                // ── Admin only ─────────────────────────────
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                                                // ── Seller product write operations ────────
                                                .requestMatchers(HttpMethod.POST,
                                                                "/api/products")
                                                .hasRole("SELLER")
                                                .requestMatchers(HttpMethod.PUT,
                                                                "/api/products/*")
                                                .hasRole("SELLER")
                                                .requestMatchers(HttpMethod.DELETE,
                                                                "/api/products/*")
                                                .hasRole("SELLER")
                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/products/my")
                                                .hasRole("SELLER")
                                                .requestMatchers(HttpMethod.POST,
                                                                "/api/products/*/images")
                                                .hasRole("SELLER")
                                                .requestMatchers(HttpMethod.DELETE,
                                                                "/api/products/*/images/*")
                                                .hasRole("SELLER")

                                                // ── Category write (ADMIN only) ────────────
                                                .requestMatchers(HttpMethod.POST,
                                                                "/api/categories")
                                                .hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PUT,
                                                                "/api/categories/*")
                                                .hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE,
                                                                "/api/categories/*")
                                                .hasRole("ADMIN")

                                                // ── All other routes need authentication ───
                                                .requestMatchers("/api/users/**").authenticated()
                                                .requestMatchers("/api/addresses/**").authenticated()
                                                .requestMatchers("/api/cart/**").authenticated()
                                                .requestMatchers("/api/orders/**").authenticated()
                                                .requestMatchers("/api/wishlist/**").authenticated()
                                                .requestMatchers("/api/reviews/**").authenticated()
                                                .requestMatchers("/api/notifications/**").authenticated()
                                                .requestMatchers("/api/transactions/**").authenticated()
                                                .requestMatchers("/api/deliveries/**").authenticated()
                                                .requestMatchers("/api/seller/**").authenticated()

                                                .anyRequest().authenticated())
                                .authenticationProvider(authenticationProvider())
                                .addFilterBefore(jwtAuthFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public DaoAuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider provider = new DaoAuthenticationProvider(passwordEncoder());
                provider.setUserDetailsService(userDetailsService);
                return provider;
        }

        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of(
                                "http://localhost:3000",
                                "http://localhost:5173"));
                config.setAllowedMethods(List.of(
                                "GET", "POST", "PUT",
                                "DELETE", "PATCH", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);
                config.setMaxAge(3600L);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }
}