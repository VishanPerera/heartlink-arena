package com.heartlink.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${heart.api.base-url}")
    private String heartApiBaseUrl;

    // Bean for calling the Heart Game API
    // Interoperability: Pre-configured base URL for Heart Game API
    @Bean(name = "heartApiClient")
    public WebClient heartApiClient() {
        return WebClient.builder()
                .baseUrl(heartApiBaseUrl)
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Accept", "application/json")
                .build();
    }

    // Bean for calling OpenWeatherMap API
    @Bean(name = "weatherApiClient")
    public WebClient weatherApiClient() {
        return WebClient.builder()
                .baseUrl("https://api.openweathermap.org/data/2.5")
                .build();
    }
}